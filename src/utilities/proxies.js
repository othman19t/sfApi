import dotenv from 'dotenv';
import { createClient } from 'redis';
dotenv.config();
// this removes key from redis. this is not needed for now but in the future we might need to use it.
const handleDeleteAllBlockedIp = async (proxiesName) => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();

  await client.del(proxiesName);
  await client.disconnect();
};
// this add blocked ip to redis
const handleAddBlockedIp = async (ip, proxiesName) => {
  try {
    const client = await createClient()
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect();

    await client.lPush(proxiesName, ip?.ip);
    await client.disconnect();
    console.log('Added blocked ip to redis: ', ip?.ip, proxiesName);
  } catch (error) {
    console.log('Failed to add blocked', error);
  }
};
// this gets the list of blocked ips of the given proxies set name
const handleGetListBlockedIps = async (proxiesName) => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  const blockedIps = (await client.lRange(proxiesName, 0, -1)) || [];
  await client.disconnect();
  return blockedIps;
};

// this remove blocked ips from the given array and return the ones NOT blocked
//also this removes the old ips from the blocked ips
const removBlockedIps = async (ips, proxiesName) => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  const blockedIps = (await client.lRange(proxiesName, 0, -1)) || [];
  // Keep only the last 5 blocked IPs if there is more than 5
  if (blockedIps?.length > 5) {
    await client.lTrim(proxiesName, -5, -1);
  }
  if (blockedIps?.length == 0) {
    return ips;
  }
  const blocked = new Set(blockedIps);
  await client.disconnect();
  return ips.filter((item) => !blocked.has(item.ip));
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

// this function would be called when scrapping data in the feature we will need to add one more account to have more ips and concatate all ips togther before returning the ips to use them for scrapping
export const getFacebookProxies = async () => {
  const PROXY_TOKEN1 = process.env.PROXY_TOKEN1;
  const PROXY_USER1 = process.env.PROXY_USER1; // Username for proxy auth
  const PROXY_PASS1 = process.env.PROXY_PASS1; // Password for proxy auth
  const proxies1 = await handleGetFacebookProxies(
    PROXY_TOKEN1,
    PROXY_USER1,
    PROXY_PASS1,
    'facebookProxies1'
  );
  // console.log(proxies1, 'proxies1');
  return proxies1;
};
//TODO: the following commented code are just examples for depugging purposes
// proxies();
// await handleAddBlockedIp({ ip: 'add-blocked-ip' }, 'proxies1');
handleDeleteAllBlockedIp('facebookProxies1');
const data = await handleGetListBlockedIps('facebookProxies1');
console.log('data', data);

export const addBlockedIp = handleAddBlockedIp; // call this funtion when you want to add a blocked IP and dont forget to add all ip object and proxies set name which is in the ip object proxiesName property.
// export const getFacebookProxies = getFacebookproxies; //call this when want to get proxies to use for scrapping
