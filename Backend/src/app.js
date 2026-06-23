import express, { urlencoded } from "express"
import cors from 'cors'
import helmet from "helmet"
import "dotenv/config";
import Stripe from "stripe";
import { paymentQueue } from "./queues/payment.queue.js";
import { query } from "./config/database.js";
import { inventoryQueue } from "./queues/inventory.queue.js";

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
      session.metadata.orderId=31
      session.metadata.paymentId=31
      session.metadata.userId=3
      session.metadata.userEmail='testuser1@gmail.com'
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
        const order =await query('update orders set status=$1 where id=$2 and customer_id =$3 and status!=$1 and status!=$4 and status!=$5 returning id' ,['cancelling',session.metadata.orderId,session.metadata.userId,'cancelled','completed']);
        if(order.rows.length==0)return res.staus(200);
        await inventoryQueue.add('cancelOrder',{orderId:session.metadata.orderId},{
              attempts: 5, // total attempts (1 initial + 4 retries)
              backoff: {
                type: 'exponential',
                delay: 2000, // initial delay: 1 second
              },
              removeOnComplete: true,
              removeOnFail: false,
            });
        break;


   }
    res.sendStatus(200);
  }
);
app.use(urlencoded({extended:true}))
app.use(express.json());
export {app};
