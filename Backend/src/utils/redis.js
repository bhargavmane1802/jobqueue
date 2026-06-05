import {Redis} from "ioredis"
const redis=new Redis(process.env.REDIS_URL ||{
    host: "127.0.0.1",
    port: 6379,
});
redis.on("connect",()=>{
    console.log("redis connected");
})
redis.on("error",(err)=>{
    console.log("error connection redis",err);
})
export {redis};