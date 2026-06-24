import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { deadQueue } from "../queues/dead.queue.js";
import { google } from "googleapis"

const sendVerificationEmail = async (recipientEmail,otp) => {
     const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
  });

  const g_email = [
  `To: ${recipientEmail}`,
  "Subject: Verify OTP",
  "MIME-Version: 1.0",
  "Content-Type: text/html; charset=UTF-8",
  "",
  `
    <h1>Email Verification</h1>
    <p>Your One Time Password (OTP) : ${otp}</p>
    <p>OTP is valid for 10:00 mins .Do not share this OTP with anyone</p> 
  `
].join("\n");

  const encodedMessage = Buffer.from(g_email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage
    }
  });

  console.log("Email sent");
} catch (error) {
  console.error(
    error.response?.data || error.message || error
  );
}
};


const emailWorker =new Worker('emailQueue',async (job)=>{
    if(job.name=='orderCreated'){
        const {userEmail,products}=job.data;

        return {success:'created mail success'}
    }
    if(job.name=='OTP'){
        const {email,otp}=job.data;
        await sendVerificationEmail(email,otp);
        return {success:'OTP sent'};
    }
        
},{connection:redis})

emailWorker.on('completed' ,(job,result)=>{
    if(job.name=='orderCreated'){
        const {email}=job.data;
        console.log(`email:set a email to the customer ${email} ,product name is ${products}`);
        for(let i=0;i<products.length;i++){
            console.log(products[i]);
        }
    }
    console.log(result)
})
emailWorker.on('failed',async(job,err)=>{
    await deadQueue.add('emailFailed',job);
    console.log('email failed');
})



