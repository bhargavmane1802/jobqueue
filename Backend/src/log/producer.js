import {Kafka} from'kafkajs'
const kafka= new Kafka({
    clientId:'log-stream',
    brokers:['localhost:9092'],
});
const producer=kafka.producer();

export const producerMain= async ()=>{
    await producer.connect();
    await producer.send({
        topic:'logs',
        messages:[
            {
        value: JSON.stringify({
          orderId: 123,
          userId: 42,
          amount: 4999,
        }),
      },
        ]
    });
    await producer.disconnect();
}
