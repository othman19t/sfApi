import { createClient } from 'redis';
import { promisify } from 'util';
import { callFacebookScrapper } from '../api/scrapper.js';
import { getFacebookProxies } from '../utilities/proxies.js';

const handleCallScrapper = async (tasks) => {
  tasks.forEach(async (task) => {
    const mainIps = await getFacebookProxies();
    console.log('task: ', JSON.parse(task));
    const scrap = await callFacebookScrapper({
      task: JSON.parse(task),
      mainIps,
    });
    console.log('scrap result: ', scrap);
  });
};
// // this storeDataInRedis
export const pushTasksToQueue = async (key, object) => {
  try {
    const client = await createClient()
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
  try {
    const client = await createClient()
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
// this gets the list of blocked ips of the given proxies set name
const handleGetListOfData = async (key) => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  const data = (await client.lRange(key, 0, -1)) || [];
  await client.disconnect();
  return data;
};

// Example usage with the key used previously
// readAndUpdateRedis('myDataKey');
// let i = 1;
// export const addTaskToQueue = async (task) => {
//   // Example usage

//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });
//   pushTasksToQueue('tasks', { num: `${i}` });

//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });
//   // pushTasksToQueue('tasks', { num: `${i}` });

//   i++;
//   const tasksData = await handleGetListOfData('tasks');
//   console.log('====================================');
//   console.log('tasksData from queue: ', tasksData);
//   console.log('====================================');
// };

// export async function runTasksInQueue(key) {
//   const client = await createClient()
//     .on('error', (err) => console.log('Redis Client Error', err))
//     .connect();

//   // try {
//   const allData = (await client.lRange(key, 0, -1)) || [];
//   const ltrimAsync = promisify(client.lTrim).bind(client);

//   console.log('length: ', allData?.length);
//   // Fetch all elements first
//   console.log('Fetched all data to remove:', allData);

//   await ltrimAsync(key, 0, 102); // update this and use it to remove the last elements based on allData length

//   console.log('All data removed because the list had fewer than 6 items.');
//   // Math.ceil(allData?.length / 12)
//   //TODO: call scrapper for all data
//   await client.disconnect();
//   // } catch (error) {
//   //   console.error('Failed to read or update Redis:', error);
//   // }
// }
