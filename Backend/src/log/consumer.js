
import {Kafka} from 'kafkajs'
import { pool } from '../config/database.js';
const kafka = new Kafka({
    clientId: "trace_consumer",
    brokers: ["localhost:9092"]
});

const consumer = kafka.consumer({
    groupId: "trace-consumer-group"
});
async function main() {

    await consumer.connect();

    await consumer.subscribe({
        topic: "trace_logs",
        fromBeginning: true
    });

    console.log("Consumer connected");

    await consumer.run({

        eachMessage: async ({ message }) => {

            const log = JSON.parse(
                message.value.toString()
            );

            console.log("Received log:");

            await pool.query(
                `
                INSERT INTO logs (id,type, message,completed_at)
                VALUES ($1, $2,$3,$4)
                `,
                [
                    log.id,
                    log.type,
                    log.message,
                    log.time
                ]
            );

            console.log("Saved to PostgreSQL");
        }

    });
}

main();