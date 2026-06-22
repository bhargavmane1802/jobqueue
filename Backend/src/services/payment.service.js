import Stripe from "stripe";
export const payment =async(inventory,orderId,email,id)=>{
  try {
    const stripe = new Stripe(process.env.STRIPE);
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
  
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60),

        success_url:
          `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,//redirects to order page
  
        cancel_url:
          `${process.env.CLIENT_URL}/payment/cancel`, //redirect to order page
        
        metadata: {
          orderId: String(orderId),
          userId: String(id),
          userEmail:String(email)
        }
      });
      return session.url;

  } catch (error) {
    console.log("payment",error);
    throw new Error('payment error');
  }
}