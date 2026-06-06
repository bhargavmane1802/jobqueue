import {Redis} from "ioredis"
//process.env.REDIS_URL ||
const redis=new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
});
redis.on("connect",()=>{
    console.log("redis connected");
})
redis.on("error",(err)=>{
    console.log("error connection redis",err);
})
export {redis};