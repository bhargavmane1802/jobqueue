import { Worker } from "bullmq";
import { redis } from "../utils/redis.js";
import { deadQueue } from "../queues/dead.queue.js";
import { google } from "googleapis"
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
const sendEmail = async (g_email) => {

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
      const { userEmail, products } = job.data;
      const totalCost = products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const productRows = products
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.title}</td>
              <td>₹${item.price}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price * item.quantity}</td>
            </tr>
          `
        )
        .join("");

      const g_email = [
        `To: ${userEmail}`,
        "Subject: Order Confirmation",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "",
        `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2 style="color:#28a745;">🎉 Order Placed Successfully</h2>

          <p>Hi,</p>
          <p>Thank you for your order. Here are your order details:</p>

          <table style="width:100%; border-collapse:collapse;" border="1" cellpadding="8">
            <thead style="background:#f2f2f2;">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <h3 style="text-align:right;">
            Grand Total: ₹${totalCost}
          </h3>

          <p>We'll notify you once your order has been shipped.</p>

          <p>Thank you for shopping with us! ❤️</p>
        </div>
        `,
      ].join("\n");
        await sendEmail(g_email);
        return {success:'created mail success'}
    }
    if(job.name=='OTP'){
        const {email,otp}=job.data;
        const g_email = [
          `To: ${email}`,
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
        await sendEmail(g_email);
        return {success:'OTP sent'};
    }
    if (job.name === "orderCancelMail") {
        const { email, orderId, products } = job.data;

        const totalRefund = products.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const productRows = products
          .map(
            (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>₹${item.price}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price * item.quantity}</td>
              </tr>
            `
          )
          .join("");

        const g_email = [
          `To: ${email}`,
          "Subject: Order Cancellation Confirmation",
          "MIME-Version: 1.0",
          "Content-Type: text/html; charset=UTF-8",
          "",
          `
          <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
            <h2 style="color:#dc3545;">❌ Order Cancelled</h2>

            <p>Hi,</p>

            <p>Your order has been cancelled successfully.</p>

            <p><strong>Order ID:</strong> ${orderId}</p>

            <table style="width:100%; border-collapse:collapse;" border="1" cellpadding="8">
              <thead style="background:#f2f2f2;">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>

            <h3 style="text-align:right; color:#dc3545;">
              Refund Amount: ₹${totalRefund}
            </h3>

            <p>
              If you have already made the payment, the refund will be processed to
              your original payment method within <strong>5–7 business days</strong>.
            </p>

            <p>We're sorry to see this order cancelled. We hope to serve you again soon.</p>

            <p>Thank you.</p>
          </div>
          `,
        ].join("\n");

  await sendEmail(g_email);
  return {
    success: "Order cancellation email sent"
};
}
        
},{connection:redis})

emailWorker.on('completed' ,(job,result)=>{
    if(job.name=='orderCreated'){
        const {userEmail,products}=job.data;
        console.log(`email:set a email to the customer ${userEmail} ,product name is ${products}`);
        for(let i=0;i<products.length;i++){
            console.log(products[i]);
        }
    }})
emailWorker.on('failed',async(job,err)=>{
   console.log('email failed', err.message);
    await deadQueue.add('emailFailed',job.data);
})



