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
  password: String(process.env.DB_PASSWORD)
});
const query=(text, params) => pool.query(text, params);
export{query}
