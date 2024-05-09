import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import routers from './src/routes/index.js';
import { runFacebookJobs, runTasksQueue } from './src/cron/cronJobs.js';

import { getFacebookProxies, addBlockedIp } from './src/utilities/proxies.js';
import {
  removeRedisDataByKey,
  getRedisDataByKey,
} from './src/utilities/redisHelper.js';
import { getPostsFromNotifications } from './src/notifications/PostsNotifications.js';
//TODO: to get proxies example
const getIp = async () => {
  const mainIps = await getFacebookProxies();
  console.log('Ip: ', JSON.stringify(mainIps));
};

// TODO: backup proxy => this might be better of you keep it in scrapper server
// const backupIp = {
//   host: process.env.BACK_UP_IP,
//   port: process.env.BACK_UP_PORT,
//   username: process.env.BACK_UP_USERNAME,
//   password: process.env.BACK_UP_PASSWORD,
// };

getIp();
// removeRedisDataByKey('testProxiname');
// const d = await getRedisDataByKey('testProxiname');
// console.log('getRedisDataByKey=> ', d);
dotenv.config();
const sfClient = process.env.SF_CLIENT;
const sfScrapper = process.env.SF_SCRAPPER;
const PORT = process.env.PORT || 8000;
const dbUrl = process.env.DB_URL;
const allowList = [`${sfClient}`, `${sfScrapper}`];
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Attempting CORS for origin:', origin); // Helps in debugging
    if (allowList.indexOf(origin) !== -1 || !origin) {
      console.log('Allowed CORS for origin:', origin);
      callback(null, true);
    } else {
      console.log('Blocked by CORS for origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200,
};

// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: corsOptions,
  },
});
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '6mb' }));
app.use('/api', routers);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Example event
  socket.on('getPostsNotifications', async (clientData, callback) => {
    const posts = await getRedisDataByKey(clientData?.key);
    await removeRedisDataByKey(clientData?.key);
    callback({ Msg: 'successfully retrived posts notifications', posts });
  });
});

runFacebookJobs();
runTasksQueue();

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Connected to database');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
