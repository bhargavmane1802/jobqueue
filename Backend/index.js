import express from "express"
import { configDotenv } from "dotenv"
configDotenv();
const app=express();
const port =process.env.PORT;
app.get("/",(req,res)=>{
    res.status(200).json({message:"listining"});
})
app.listen(port,()=>{
    console.log(`Listining at ${port} `);
})