import { redis } from "../utils/redis.js";
import { query } from "../config/database.js";
import { trace } from "../log/trace.js";
async function startWorkers() {
    await trace.start();
    await import("./inventory.worker.js");
    await import("./payment.worker.js");
    await import("./shipment.worker.js");
    // await import("./order.worker.js");
    await import("./email.worker.js");
}
startWorkers();
// index.worker.js