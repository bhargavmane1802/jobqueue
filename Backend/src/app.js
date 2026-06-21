import express, { urlencoded } from "express"
import cors from 'cors'
import helmet from "helmet"
import { configDotenv } from "dotenv"
import Stripe from "stripe";
import { paymentQueue } from "./queues/payment.queue.js";
configDotenv();
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


    if (event.type === 'checkout.session.completed' ) {
      const session = event.data.object;
      session.metadata.stripeSessionId=session.id;
      session.metadata.stripePaymentIntentId=session.payment_intent;
      console.log(session.metadata);
      if(session.payment_status === 'paid'){
        await paymentQueue.add('paymentSucess',session.metadata);
      }
      // mark payment success
      // mark order confirmed
    }
    const session = event.data.object;     
      session.metadata.orderId=14
      session.metadata.paymentId=14
      session.metadata.userId=3
      session.metadata.userEmail='testuser1@gmail.com'
      session.metadata.stripeSessionId=session.id;
      session.metadata.stripePaymentIntentId=session.payment_intent;
      console.log("metadata:",session.metadata);

    switch (event.type) {

      case 'checkout.session.completed':
        if (session.payment_status === 'paid') {
          await paymentQueue.add('paymentSucess',session.metadata);
        }
        break;

      case 'checkout.session.async_payment_succeeded':
        await paymentQueue.add('paymentSucess',session.metadata);
        break;

      case 'checkout.session.async_payment_failed':
        // cancel order
        // release stock
        break;

      case 'checkout.session.expired':
        // cancel order
        // release stock
        break;
    }
    res.sendStatus(200);
  }
);
app.use(urlencoded({extended:true}))
app.use(express.json());
export {app};
