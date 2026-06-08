import { TransientError } from "../utils/custom.error.js";

const capturePayment =async (amount,orderId)=>{
    await new Promise(r => setTimeout(r, 1000)); // simulate network latency

  if (Math.random() < 0.9) {
    throw new TransientError('Payment gateway timeout');
  }

  return {
    reference: `PAY-${Date.now()}-${orderId}`,
    status: 'captured',
    amount
  };
}

export{capturePayment}