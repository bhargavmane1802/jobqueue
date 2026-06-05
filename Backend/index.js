import express from "express"
import { app } from "./src/app.js";
import { redis } from "./src/utils/redis.js";
import { query } from "./src/config/database.js";
const port =process.env.PORT;
app.get("/",(req,res)=>{
    res.status(200).json({message:"listining"});
})
app.listen(port,()=>{
    console.log(`Listining at ${port} `);
})
app.get('/health/db', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ db: 'ok' });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});
app.use("/",(err,req,res,next)=>{
    console.log(err);
    res.status(500).json({message:"scheck logs"});
})
