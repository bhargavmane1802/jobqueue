import express, { urlencoded } from "express"
import cors from 'cors'
import helmet from "helmet"
import "dotenv/config";
import Stripe from "stripe";
import { paymentQueue } from "./queues/payment.queue.js";
import { query } from "./config/database.js";
import { inventoryQueue } from "./queues/inventory.queue.js";
import { updatestatuscancel } from "./models/order.model.js";
import { updatePaymentStatustToCancelled } from "./models/payment.model.js";
import { emailQueue } from "./queues/email.queue.js";

const stripe = new Stripe(process.env.STRIPE);
const app=express();
app.use(helmet());
app.use(cors());
app.post('/stripe/webhook',express.raw({ type: 'application/json' }),async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;     
      session.metadata.stripeSessionId=session.id;
      session.metadata.stripePaymentIntentId=session.payment_intent;
      console.log(event.type);

    switch (event.type) {

      case 'checkout.session.completed':
        console.log(session.payment_status);
        if (session.payment_status === 'paid') {
          await paymentQueue.add(
            'paymentSuccess',
            session.metadata,
            {
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
            }
          );

        }
        break;

      case 'checkout.session.async_payment_succeeded':
        await paymentQueue.add(
          'paymentSuccess',
          session.metadata,
          {
            attempts: 5, // total attempts (1 initial + 4 retries)
            backoff: {
              type: 'exponential',
              delay: 2000, // initial delay: 1 second
            },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
        break;


      case 'charge.refunded':
        try {
          const charge = session;
          console.log(charge);
            console.log('Refund webhook received:', charge.id);
    console.log('Payment intent:', charge.payment_intent);
    console.log('Charge refunded:', charge.refunded);
    
          const { rows } = await query(
            `SELECT *
            FROM payments
            WHERE stripepaymentintentid = $1`,
            [charge.payment_intent]
          );

          const payment = rows[0];

          if (!payment) {
            console.log(
              'Payment not found for payment intent:',
              charge.payment_intent
            );

            return res.status(200).json({
              received: true
            });
          }

          /*
          * Idempotency:
          * Webhooks can be delivered more than once.
          */
          if (payment.status === 'refunded') {
            console.log('Payment already refunded:', payment.id);

            return res.status(200).json({
              received: true
            });
          }

          /*
          * Only transition refunding → refunded.
          */
          if (payment.status !== 'refunding') {
            console.log(
              `Ignoring refund webhook. Current payment status: ${payment.status}`
            );

            return res.status(200).json({
              received: true
            });
          }

          /*
          * Payment is now confirmed refunded.
          */
          await query(
            `UPDATE payments
            SET status = $1
            WHERE id = $2`,
            ['refunded', payment.id]
          );
          console.log(
            `Refund confirmed. Payment ${payment.id} marked refunded`
          );
          return res.status(200).json({
            received: true
          });

        } catch (error) {
          console.error('charge.refunded webhook error:', error);
     /*
     * Return 200 if you don't want Stripe to retry this webhook.
     * If you want Stripe to retry on processing errors,
     * return a non-2xx response instead.
     */
          return res.status(500).json({
            received: false
          });
        }
  break;
        
      case 'refund.failed':
        try {
          const refund = session;
          console.log('Refund failed:', refund.id);
          const { rows } = await query(
            `SELECT *
            FROM payments
            WHERE stripe_payment_intent_id = $1`,
            [refund.payment_intent]
          );
          const payment = rows[0];
          if (!payment) {
            console.log('Payment not found');
            return res.status(200).json({
              received: true
            });
          }
          /*
          * Stripe refund failed.
          *
          * Don't mark order as cancelled.
          * The order can remain in "cancelling".
          */
          await query(
            `UPDATE payments
            SET status = $1
            WHERE id = $2`,
            ['refund_request_failed', payment.id]
          );
          console.log(
            `Refund failed for payment ${payment.id}`
          );
          return res.status(200).json({
            received: true
          });

        } catch (error) {
          console.error('refund.failed webhook error:', error);

          return res.status(500).json({
            received: false
          });
        }
        break;  

      case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired':
        try {
          const pid=await updatestatuscancel(session.metadata.orderId);
          if(pid===-1){
            return res.status(200).json({ received: true, message: 'Order already cancelled or not found', });
          }
          await updatePaymentStatustToCancelled(pid);
          await inventoryQueue.add('cancelPendingOrder',{email:session.metadata.userEmail,orderId:session.metadata.orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
          return res.status(200).json({message:'done'});

        } catch (error) {
          console.log('checkout.session.expired')
        }
        break;
   }
    res.status(200).json({ received: true });
  }
);
app.use(urlencoded({extended:true}))
app.use(express.json());
export {app};
