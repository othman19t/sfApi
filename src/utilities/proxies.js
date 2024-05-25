import dotenv from 'dotenv';
import { createClient } from 'redis';
dotenv.config();
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const PROXY_TOKEN1 = process.env.PROXY_TOKEN1;
const PROXY_USER1 = process.env.PROXY_USER1; // Username for proxy auth
const PROXY_PASS1 = process.env.PROXY_PASS1; // Password for proxy auth

// Main function to get proxies from webshare
const handleGetProxies = async (
  token,
  user,
  pass,
  proxiesName,
  expireMinutes = 20
) => {
  const url = new URL('https://proxy.webshare.io/api/v2/proxy/list/');
  url.searchParams.append('mode', 'direct');
  url.searchParams.append('page', '1');
  url.searchParams.append('page_size', '10');

  const res = await fetch(url.href, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  const resJson = await res.json();
  let ips = [];

  resJson.results?.forEach((proxy) => {
    let createdAt = new Date(proxy.created_at);

    if (isNaN(createdAt)) {
      console.error(
        `Invalid date value for proxy created_at: ${proxy.created_at}`
      );
      return; // Skip this proxy
    }

    const createdAtTime = createdAt.getTime();

    if (isNaN(createdAtTime)) {
      console.error(
        `Invalid time value for proxy createdAtTime: ${proxy.created_at}`
      );
      return; // Skip this proxy
    }

    const expiresAtTime = createdAtTime + expireMinutes * 60000;
    const expiresAt = new Date(expiresAtTime);

    if (isNaN(expiresAt)) {
      console.error(
        `Error calculating expiresAt for proxy: ${JSON.stringify(proxy)}`
      );
      return; // Skip this proxy
    }

    const ip = {
      proxiesName,
      username: user,
      password: pass,
      host: proxy.proxy_address,
      port: proxy.port,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    ips.push(ip);
  });

  return ips;
};
export const getProxies = handleGetProxies;

// Rotate proxies so the same proxy doesn't get used in row multiple times
export const rotateProxies = async (proxiesArray) => {
  if (proxiesArray?.length == 0) {
    return [];
  }
  try {
    const client = createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    let proxyCounter = parseInt(await client.get('proxyCounter')) || 1;

    // Handle cases where the number of elements to move is greater than the array length or non-positive
    if (proxyCounter <= 0 || proxyCounter >= proxiesArray.length) {
      await client.disconnect();
      return proxiesArray;
    }

    // Move the specified number of elements to the end
    const elementsToMove = proxiesArray.slice(0, proxyCounter);
    const remainingElements = proxiesArray.slice(proxyCounter);
    proxyCounter = (proxyCounter % proxiesArray.length) + 1; // Ensure the counter cycles through the array length
    await client.set('proxyCounter', proxyCounter);

    await client.disconnect();

    // Concatenate the elements to move at the end of the remaining elements
    return remainingElements.concat(elementsToMove);
  } catch (error) {
    console.log('Error in rotateProxies:', error);
    if (client) {
      await client.disconnect();
    }
    return proxiesArray; // Return the original array in case of an error
  }
};

// Store proxies data in Redis
export const storeProxiesDataInRedis = async (data, key) => {
  try {
    const client = createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    // Ensure data is an array
    if (!Array.isArray(data)) {
      throw new Error('Data should be an array');
    }

    await client.del(key); // Clear the existing list

    const seenProxies = new Set();

    for (const item of data) {
      const result = JSON.stringify(item);
      const expiresAt = new Date(item.expiresAt).getTime();
      const currentTime = new Date().getTime();
      const ttl = Math.floor((expiresAt - currentTime) / 1000); // Convert milliseconds to seconds

      if (ttl > 0) {
        // Check for duplicate by the whole object value
        if (!seenProxies.has(result)) {
          await client.rPush(key, result); // Store proxy in a list
          seenProxies.add(result);
        } else {
          console.log(`Proxy ${result} already exists. Skipping.`);
        }
      }
    }

    // Set TTL for the entire list based on the shortest TTL among items
    const shortestTtl = Math.min(
      ...data.map((item) =>
        Math.floor(
          (new Date(item.expiresAt).getTime() - new Date().getTime()) / 1000
        )
      )
    );
    if (shortestTtl > 0) {
      await client.expire(key, shortestTtl);
    }

    await client.disconnect();
  } catch (error) {
    console.log('Failed to store data in Redis', error);
    if (client) {
      await client.disconnect();
    }
  }
};

// Get proxies from Redis
const getProxiesFromRedis = async (key) => {
  try {
    const client = createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    // Check if the key exists and its type
    const keyType = await client.type(key);
    if (keyType === 'none') {
      console.log(`Key ${key} does not exist.`);
      await client.disconnect();
      return [];
    } else if (keyType !== 'list') {
      throw new Error(
        `Key ${key} is of type ${keyType}, expected type is list`
      );
    }

    const data = (await client.lRange(key, 0, -1)) || [];
    await client.disconnect();

    return data.map((item) => JSON.parse(item));
  } catch (error) {
    console.log('Failed to retrieve data from Redis', error);
    return [];
  }
};

export const getProxiesFromRedisByKey = getProxiesFromRedis;

// Remove blocked proxy from Redis
export const removeBlockedProxyFromRedis = async (host, key) => {
  console.log('removing blocked proxy from Redis: ', host, key);
  try {
    const client = await createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    }).connect();

    // Remove the specified proxy from the list using its host
    const proxies = await client.lRange(key, 0, -1);
    for (const proxy of proxies) {
      const parsedProxy = JSON.parse(proxy);
      if (parsedProxy.host === host) {
        await client.lRem(key, 0, proxy); // Remove the specific proxy from the list
        break; // Assuming there's only one proxy with the same host
      }
    }

    await client.disconnect();
  } catch (error) {
    console.log('Failed to remove proxy from Redis', error);
  }
};

// Get proxy expiration from Redis
const getProxyExpiration = async (key) => {
  const client = createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  try {
    await client.connect();

    // Retrieve the value of the key, assuming it holds the proxy array as a string
    const proxies = await getProxiesFromRedis(key);
    await client.disconnect();

    if (proxies.length > 0) {
      const proxy = proxies[0]; // Get the first proxy
      return new Date(proxy.expiresAt).getTime(); // Return the expiration date
    }
    return null;
  } catch (error) {
    console.log('Failed to get proxy expiration from Redis', error);
    if (client) {
      await client.disconnect();
    }
    return null;
  }
};

// Poll proxy server for new proxies
const pollProxyServer = async (key) => {
  try {
    const newProxies = await handleGetProxies(
      PROXY_TOKEN1,
      PROXY_USER1,
      PROXY_PASS1,
      key
    );
    if (newProxies.length > 0) {
      const newProxyCreationTime = new Date(newProxies[0].createdAt).getTime();
      const currentTime = new Date().getTime();

      if (currentTime - newProxyCreationTime <= 60000) {
        // 1 minute in milliseconds
        await storeProxiesDataInRedis(newProxies, key);
        console.log('Proxies refreshed and stored in Redis');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error fetching new proxies:', error);
    return false;
  }
};

// Check and update proxies
export const checkAndUpdateProxies = async (key) => {
  const expirationTime = await getProxyExpiration(key);
  const currentTime = new Date().getTime();

  if (expirationTime && expirationTime - currentTime <= 60000) {
    // Proxies are expiring within 1 minute
    console.log('Proxies are about to expire, start polling for new proxies');
    const intervalId = setInterval(async () => {
      const updated = await pollProxyServer(key);
      if (updated) {
        clearInterval(intervalId);
      }
    }, 10000); // Poll every 10 seconds
  } else if (!expirationTime) {
    // No proxies left
    console.log('No proxies left, start polling for new proxies');
    const intervalId = setInterval(async () => {
      const updated = await pollProxyServer(key);
      if (updated) {
        clearInterval(intervalId);
      }
    }, 10000); // Poll every 10 seconds
  } else {
    console.log('Proxies are not expiring soon');
  }
};

// Get Facebook proxies and rotate them
export const getFacebookProxies = async () => {
  const proxies = await getProxiesFromRedis('facebookProxies1');
  const rotatedProxies = await rotateProxies(proxies);
  return rotatedProxies;
};
