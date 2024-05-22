import dotenv from 'dotenv';
import { createClient } from 'redis';
import { addDataToRedis, getRedisDataByKey } from './redisHelper.js';
dotenv.config();
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// this remove blocked ips from the given array and return the ones NOT blocked
//also this removes the old ips from the blocked ips
const removBlockedIps = async (ips, proxiesName) => {
  const client = await createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  const blockedIps = await getRedisDataByKey(proxiesName);
  console.log('====================================');
  console.log('blockedIps', blockedIps);
  console.log('====================================');
  // Keep only the last 5 blocked IPs if there is more than 5
  if (blockedIps?.length > 5) {
    const trimIndex = blockedIps?.length - 5;
    await client.lTrim(proxiesName, 0, trimIndex - 1);
  }
  if (blockedIps?.length == 0) {
    return ips;
  }
  const blocked = new Set(blockedIps);
  await client.disconnect();
  const workingIps = ips.filter((item) => !blocked.has(item.host));
  if (workingIps?.length == 0) {
    return ips;
  } else {
    return workingIps;
  }
};

// this gets IPs from webShare proxies and call other functions to filter blocked ips and then return the NOT blocked IPs
const handleGetFacebookProxies = async (token, user, pass, proxiesName) => {
  const url = new URL('https://proxy.webshare.io/api/v2/proxy/list/');
  url.searchParams.append('mode', 'direct');
  url.searchParams.append('page', '1');
  url.searchParams.append('page_size', '10');

  const req = await fetch(url.href, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  const res = await req.json();
  let ips = [];
  res?.results?.forEach((proxy) => {
    // Assuming the proxy expects credentials in the URL:
    const ip = {
      proxiesName,
      username: user,
      password: pass,
      host: proxy?.proxy_address,
      port: proxy?.port,
    };
    ips.push(ip);
  });
  const workingIpsForFacebook = await removBlockedIps(ips, proxiesName);
  return workingIpsForFacebook;
};

// to rotate proxies so they the same proxy doesn't get used in row multiple times
function moveElementsToEnd(array, numberOfElements) {
  // Handle cases where the number of elements to move is greater than the array length or non-positive
  if (numberOfElements <= 0 || numberOfElements >= array.length) {
    return array;
  }

  // Move the specified number of elements to the end
  const elementsToMove = array.slice(0, numberOfElements);
  const remainingElements = array.slice(numberOfElements);

  // Concatenate the elements to move at the end of the remaining elements
  return remainingElements.concat(elementsToMove);
}

// this function would be called when scrapping data in the feature we will need to add one more account to have more ips and concatate all ips togther before returning the ips to use them for scrapping
export const getFacebookProxies = async () => {
  const client = await createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  const PROXY_TOKEN1 = process.env.PROXY_TOKEN1;
  const PROXY_USER1 = process.env.PROXY_USER1; // Username for proxy auth
  const PROXY_PASS1 = process.env.PROXY_PASS1; // Password for proxy auth
  const proxies1 = await handleGetFacebookProxies(
    PROXY_TOKEN1,
    PROXY_USER1,
    PROXY_PASS1,
    'facebookProxies1'
  );
  console.log('====================================');
  console.log('proxies1', proxies1?.length);
  console.log('====================================');

  // Get the current value of the counter from the Redis database
  let counter = parseInt(await client.get('counter')) || 1;

  if (counter < proxies1.length) {
    // call moveelementstoend
    const rotatedProxies = moveElementsToEnd(proxies1, counter);
    console.log('rotatedProxies1', rotatedProxies?.length);

    //increase the counter
    counter++;
    await client.set('counter', counter);
    return rotatedProxies;
  }
  if (counter == proxies1.length) {
    await client.set('counter', 1);
    return proxies1;
  }
};

// this add blocked ip to redis
export const addBlockedIp = addDataToRedis;
