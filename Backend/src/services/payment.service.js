const capturePayment =async (amount,orderId)=>{
    await new Promise(r => setTimeout(r, 5000)); // simulate network latency

  if (Math.random() < 0.9) {
    throw new Error('Payment gateway timeout — connection refused');
  }

  return {
    reference: `PAY-${Date.now()}-${orderId}`,
    status: 'captured',
    amount
  };
}

export{capturePayment}