import express from "express"
import cors from 'cors'
import helmet from "helmet"
import { configDotenv } from "dotenv"
configDotenv();
const app=express();
app.use(helmet());
app.use(cors());
app.use(express.json());
export {app};
