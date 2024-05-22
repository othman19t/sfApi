import { createClient } from 'redis';
import { promisify } from 'util';
import { callFacebookScrapper } from '../api/scrapper.js';
import { getFacebookProxies } from '../utilities/proxies.js';

import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const handleCallScrapper = async (tasks, firstTime = false) => {
  tasks.forEach(async (task) => {
    const mainIps = await getFacebookProxies();
    console.log('====================================');
    console.log('mainIps: ', mainIps.length);
    console.log('====================================');
    console.log('task: ', JSON.parse(task));
    const scrap = await callFacebookScrapper({
      task: JSON.parse(task),
      mainIps,
      firstTime,
    });
    console.log('scrap result: ', scrap);
  });
};
// // this storeDataInRedis
export const pushTasksToQueue = async (key, object) => {
  console.log('REDIS_HOST', REDIS_HOST);
  try {
    const client = await createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
    })
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect();

    // Double-check that client.lPush is correctly defined and is a function
    if (typeof client.lPush === 'function') {
      const lPushAsync = promisify(client.lPush).bind(client);

      // Serialize object to a string and prepend to the Redis list
      const data = JSON.stringify(object);

      // Use LPUSH to add data to the beginning of the list in Redis
      await lPushAsync(key, data);
      console.log('Data has been successfully saved in Redis!');

      await client.disconnect();
    } else {
      throw new Error('client.lPush is not a function');
    }
  } catch (error) {
    console.log('Failed to add data to Redis:', error);
  }
};

export async function runTasksInQueue(key) {
  console.log('REDIS_HOST', REDIS_HOST);
  try {
    const client = await createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
    })
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect();
    // Get all indices of the array from Redis
    const tasks = await client.lRange(key, 0, -1);
    // Log the tasks
    console.log('tasks length to remove:', tasks.length);
    handleCallScrapper(tasks);
    // Remove elements from the array starting from the end
    for (let i = tasks.length - 1; i >= 0; i--) {
      await client.lRem(key, 1, tasks[i]);
    }

    console.log('Elements removed successfully.');
    await client.disconnect();
  } catch (error) {
    console.error('Failed to run tasks in queue:', error);
  }
}

export const callScrapper = handleCallScrapper;
// this gets the list of blocked ips of the given proxies set name
const handleGetListOfData = async (key) => {
  const client = await createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  const data = (await client.lRange(key, 0, -1)) || [];
  await client.disconnect();
  return data;
};
