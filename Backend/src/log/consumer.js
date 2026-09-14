
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

            console.log("Received log:", log);

            await pool.query(
                `
                INSERT INTO logs (type, message)
                VALUES ($1, $2)
                `,
                [
                    log.type,
                    log.message
                ]
            );

            console.log("Saved to PostgreSQL");
        }

    });
}

main();