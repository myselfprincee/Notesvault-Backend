import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});

const serviceUri = process.env.REDIS_URI;
console.log(serviceUri)
export const redis = new Redis(serviceUri); 

redis.flushall()