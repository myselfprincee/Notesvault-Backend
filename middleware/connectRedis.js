import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});

const serviceUri = process.env.REDIS_URI;
console.log(serviceUri)
export const redis = new Redis(serviceUri);

async function getAllKeys() {
    try {
        const key = await redis.get('note-667db2a13b3efe6e5221cd63');

      console.log(JSON.parse(key));
    //   redis.del('note-667db2a13b3efe6e5221cd63');
    } catch (error) {
      console.error('Error:', error);
    }}

  async function getKeyMemoryUsage(key) {
    try {
      const memoryUsage = await redis.memory(['usage', key]);
      console.log(`Memory usage for ${key}: ${memoryUsage}`);
    } catch (error) {
      console.error('Error fetching memory usage:', error);
    }
  }
  
  getKeyMemoryUsage('note-667db2a13b3efe6e5221cd63');