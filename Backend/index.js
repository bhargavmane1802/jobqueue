import express from "express"
import { app } from "./src/app.js";
import { redis } from "./src/utils/redis.js";
import { query } from "./src/config/database.js";
import { order_router } from "./src/routes/order.router.js";
import { userRouter } from "./src/routes/user.router.js";
import { test } from "./src/queues/test.js";
import { deadQueue } from "./src/queues/dead.queue.js";
import { authRouter } from "./src/routes/auth.router.js";
import { verifyBuyer, verifySeller } from "./src/middleware/role.middleware.js";
import { sellerRouter } from "./src/routes/seller.router.js";
import { paymentQueue } from "./src/queues/payment.queue.js";
const port =process.env.PORT;
app.get("/",async(req,res)=>{
    await test();
    res.status(200).json({message:"listining"});
})
app.use('/user',userRouter);
app.use('/auth',authRouter)
app.use('/auth/sellers');
app.use('/auth/buyers',verifyBuyer);
app.use('/auth/seller',verifySeller);
app.use("/auth/buyers/order",order_router);
app.use("/auth/seller/",sellerRouter);
app.post('/stripe/webhook',express.raw({ type: 'application/json' }),async (req, res) => {

    const sig = req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed' ) {
      const session = event.data.object;
      session.metadata.stripeSessionId=session.id;
      session.metadata.stripePaymentIntentId=session.payment_intent;
      console.log(session.metadata);
      // mark payment success
      // mark order confirmed
    }
    if(session.payment_status === 'paid'){
      await paymentQueue.add('paymentSucess',session.metadata);
    }

    res.sendStatus(200);
  }
);
app.get('/health/db', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ db: 'ok' });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});
app.get('/test',async (req,res,next)=>{
  const result =await deadQueue.getJobs();
  return res.status(200).json({result}); 
})
app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).json({message:"check logs"});
})
app.listen(port,()=>{
    console.log(`Listining at ${port} `);
})
