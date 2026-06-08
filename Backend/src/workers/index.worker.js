import { redis } from "../utils/redis.js";
import { query } from "../config/database.js";
import './inventory.worker.js'
import './payment.worker.js'
import './email.worker.js'