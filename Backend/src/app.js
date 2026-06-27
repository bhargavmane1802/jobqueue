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

      case 'checkout.session.async_payment_failed':
        case 'checkout.session.expired':
        try {
          const pid=await updatestatuscancel(session.metadata.orderId);
          if(pid===-1)return ;
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
    return;
  }
);
app.use(urlencoded({extended:true}))
app.use(express.json());
export {app};
