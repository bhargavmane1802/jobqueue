import { Pool } from 'pg'
import { configDotenv } from "dotenv"
 configDotenv({
  path: "../../.env"
});
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  // Pool Configuration
  max: 20,                          // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,          // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000,     // Fail fast if connection cannot be acquired in 2s
});
const query=(text, params) => pool.query(text, params);
export{query,pool}
//use pool.connect when ever u are using begin or commit 
// else all the statement in the begin and commit will run are a seperate individual unit rather that as  whole