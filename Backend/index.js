import express from "express"
import { app } from "./src/app.js";
import { redis } from "./src/utils/redis.js";
import { query } from "./src/config/database.js";
import { order_router } from "./src/routes/order.router.js";
import { test } from "./src/queues/test.js";
const port =process.env.PORT;
app.get("/",async(req,res)=>{
    await test();
    res.status(200).json({message:"listining"});
})
app.use("/order",order_router);
app.get('/health/db', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ db: 'ok' });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});
app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).json({message:"check logs"});
})
app.listen(port,()=>{
    console.log(`Listining at ${port} `);
})
