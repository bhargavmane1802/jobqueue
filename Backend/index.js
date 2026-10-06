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
import { cartRouter } from "./src/routes/cart.router.js";
import { buyerRouter } from "./src/routes/buyer.router.js";
import { profileRouter } from "./src/routes/profile.router.js";
import {trace} from "./src/log/trace.js";
const port =process.env.PORT;
app.get("/",async(req,res)=>{
    await test();
    res.status(200).json({message:"listining"});
})
app.use('/user',userRouter);
app.use('/auth',authRouter)
app.use('/auth/buyer',verifyBuyer);
app.use('/auth/seller',verifySeller);
app.use('/auth/profile',profileRouter);
app.use('/auth/buyer/home',buyerRouter);
app.use("/auth/buyer/order",order_router);
app.use('/auth/buyer/cart',cartRouter);
app.use("/auth/seller/",sellerRouter);

app.get('/logs/all', async (req, res, next) => {

    try {
        const result = await query('SELECT id ,type,message FROM logs order by completed_at asc');
        return res.status(200).json({
            logs: result.rows
        });

    } catch (err) {
        console.log("LOG ERROR:", err);

        return res.status(500).json({
            message: "Failed to fetch logs"
        });
    }
});
app.get("/logs/single/:paymentId", async (req, res, next) => {
  const { paymentId } = req.params;
  try {
    const { rows } = await query(
      "SELECT order_id FROM payments WHERE id = $1",
      [paymentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }
    const orderId = rows[0].order_id;
    const result = await query(
      `
      SELECT id,type, message
      FROM logs
      WHERE (id = $1 AND (type = $2 or type=$5))
         OR (id = $3 AND (type = $4 or type=$5))
      ORDER BY completed_at ASC
      `,
      [orderId, "order", paymentId, "payment","inventory"]
    );
    const arr1= result.rows.filter((ele)=>{
      return ele.type=='order'
    }).map((e)=>{return e.message})
    const arr2= result.rows.filter((ele)=>{
      return ele.type=='payment'
    }).map((e)=>{return e.message});
    const arr3= result.rows.filter((ele)=>{
      return (ele.type=='inventory')
    }).map((e)=>{return e.message});
    const arr4= result.rows.map((e)=>{return e.message});
    

    return res.status(200).json({
      orderId,
      order: arr1,
      paymentId,
      payment:arr2,
      inventory:arr3,
      timeline:arr4
    });
  } catch (err) {
    console.log("LOG ERROR:", err);

    return res.status(500).json({
      message: "Failed to fetch logs"
    });
  }
});

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
// app.listen(port,()=>{
//     console.log(`Listining at ${port} `);
// })


async function startServer() { 
  await trace.start();
  app.listen(port, () => { console.log(`Listening at ${port}`); }); 
} 

  async function shutdown() { 
    console.log("Shutting down application..."); 
  await trace.stop();
   process.exit(0); 
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown); // Start everything 
  startServer();