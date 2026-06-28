import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE);
export const payment =async(inventory,orderId,email,id,paymentId)=>{
  try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card','upi'],
        line_items: inventory.map(item => ({
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name
            },
            unit_amount: item.price * 100
          },
          quantity: item.quantity
        })),
  
        mode: 'payment',
  
        expires_at: Math.floor(Date.now() / 1000) + (30*60),//testing purpose

        success_url:
          `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,//redirects to order page
  
        cancel_url:
          `${process.env.CLIENT_URL}/payment/cancel`, //redirect to order page
        
        metadata: {
          orderId: String(orderId),
          userId: String(id),
          userEmail:String(email),
          paymentId:String(paymentId)
        }
      });
      return session.url;

  } catch (error) {
    console.log("payment",error.message);
    throw new Error('payment error');
  }
}
export const refundService=async(payment)=>{
  try {
    if(!payment)throw new Error ('MissingpaymentIdinService');
    let amount;
    if(payment.amount<200)amount=payment.amount;
    else amount=payment.amount-40;
    amount=amount*100;
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripepaymentintentid,
      amount:amount,
    });
    return refund.status;
  } catch (error) {
    console.log("refundservice",error.message);
    throw error;
  }
}