import { Kafka } from "kafkajs";
const kafka= new Kafka({
    clientId:'trace',
    brokers:['localhost:9092'],
});
const producer= kafka.producer();

// In-memory buffer
const buffer = [];

// Configuration
const BATCH_SIZE = 3;
const FLUSH_INTERVAL = 2000;

let flushTimer = null;

export const start=async()=>{
    await producer.connect();
    console.log("Trace SDK connected to Kafka");
    // Time-based trigger
    flushTimer = setInterval(() => {
        flush();
    }, FLUSH_INTERVAL);
}
export const log =async(type,message)=>{
    const log={type,message};
    buffer.push(log);
    console.log(`push to buffer ` );
    // Length-based trigger
    if (buffer.length >= BATCH_SIZE) {
        flush();
    }
}

export const flush=async()=>{
    if(buffer.length ===0)return ;
    const logs = buffer.splice(0,buffer.length);
    console.log(`Flushing ${logs.length} logs to Kafka`);
    try {
        await producer.send({
            topic:'trace_logs',
            messages: logs.map(log=>{
                return {value: JSON.stringify(log)}
            })
        });
        console.log("Batch sent to Kafka");

    } catch (err) {
                console.error("Failed to send logs to Kafka:", err);

        // Put logs back into buffer
        buffer.unshift(...logs);

    }
}

export async function stop() {

    // Stop timer
    if (flushTimer) {
        clearInterval(flushTimer);
    }

    // Send remaining logs
    await flush();

    await producer.disconnect();

    console.log("Trace SDK stopped");
}
export const trace ={
    start,
    stop,
    flush,
    log
}