import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../utils/redis.js';

// Helper function to dynamically generate a command sender wrapper
const sendCommand = (...args) => redis.call(...args);

// 1. Registration Limiter (With its own distinct store)
export const registerLimiter = rateLimit({
  store: new RedisStore({
    sendCommand,
    prefix: 'rl:register:', // Unique prefix for Redis keys
  }),
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { message: "Too many registration attempts, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. OTP Verification Limiter (With its own distinct store)
export const verifyLimiter = rateLimit({
  store: new RedisStore({
    sendCommand,
    prefix: 'rl:verify:', // Unique prefix for Redis keys
  }),
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: { message: "Too many verification attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Login Limiter (With its own distinct store)
export const loginLimiter = rateLimit({
  store: new RedisStore({
    sendCommand,
    prefix: 'rl:login:', // Unique prefix for Redis keys
  }),
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});