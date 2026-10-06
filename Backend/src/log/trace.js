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
let isConnected = false;
let isFlushing = false;


export const start=async()=>{
    await producer.connect();
isConnected = true;

console.log("Trace SDK connected to Kafka");

// Flush anything generated before Kafka connected
await flush();

flushTimer = setInterval(() => {
    flush().catch(err => {
        console.error("Trace flush failed:", err);
    });
}, FLUSH_INTERVAL);
}
export const log =async(type,id,message,time)=>{
    const log={id,type,message,time};
    buffer.push(log);
    console.log(`push to buffer ` );
    // Length-based trigger
    if (buffer.length >= BATCH_SIZE) {
    await flush();
}
}

export const flush=async()=>{
    if (buffer.length === 0) return;

    if (!isConnected) {
    console.log(
        `Kafka producer is not connected; keeping ${buffer.length} logs buffered`
    );
    return;
}

    if (isFlushing) {
        return;
    }

    isFlushing = true;

    const logs = buffer.splice(0, buffer.length);
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

    } finally {
        isFlushing = false;
    }
}
export async function stop() {
    if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
    }

    await flush();

    if (isConnected) {
        await producer.disconnect();
        isConnected = false;
    }

    console.log("Trace SDK stopped");
}
export const trace ={
    start,
    stop,
    flush,
    log
}