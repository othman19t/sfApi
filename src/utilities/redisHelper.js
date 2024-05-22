import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
console.log('REDIS_HOST', REDIS_HOST);

// this removes all data of the given key from redis
export const removeRedisDataByKey = async (key) => {
  console.log('REDIS_HOST', REDIS_HOST);

  const client = await createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  await client.del(key);
  await client.disconnect();
};
// this add data to redis
export const addDataToRedis = async (data, key) => {
  console.log('REDIS_HOST', REDIS_HOST);

  console.log('addDataToRedis data:', data, key);
  try {
    createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    })
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect();

    // Check if the data already exists in the list
    const existingIps = await client.lRange(key, 0, -1);
    if (existingIps.includes(data)) {
      console.log('data already exists in the list:', data);
    } else {
      await client.lPush(key, data);
      console.log('Added data to redis: ', key, data);
    }

    await client.disconnect();
  } catch (error) {
    console.log('Failed to add data to redis', error);
  }
};

// this gets data of the given key
export const getRedisDataByKey = async (key) => {
  console.log('REDIS_HOST', REDIS_HOST);

  const client = await createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  const blockedIps = (await client.lRange(key, 0, -1)) || [];
  await client.disconnect();
  return blockedIps;
};
