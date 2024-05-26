import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import routers from './src/routes/index.js';
import { runJobs } from './src/cron/jobs.js';

import { getUserNotifications } from './src/contrtrollers/notification.js';
import {
  storeProxiesDataInRedis,
  getProxies,
} from './src/utilities/proxies.js';
// TODO: backup proxy => this might be better of you keep it in scrapper server

// setInterval(performScheduledTask, 30000);
dotenv.config();
const PROXY_TOKEN1 = process.env.PROXY_TOKEN1;
const PROXY_USER1 = process.env.PROXY_USER1; // Username for proxy auth
const PROXY_PASS1 = process.env.PROXY_PASS1; // Password for proxy auth
const sfClient = process.env.SF_CLIENT;
const sfScrapper = process.env.SF_SCRAPPER;
const PORT = process.env.PORT || 4000;
const dbUrl = process.env.DB_URL;
const allowList = [`${sfClient}`, `${sfScrapper}`];
const corsOptions = {
  origin: function (origin, callback) {
    // console.log('Attempting CORS for origin:', origin); // Helps in debugging
    if (allowList.indexOf(origin) !== -1 || !origin) {
      // console.log('Allowed CORS for origin:', origin);
      callback(null, true);
    } else {
      // console.log('Blocked by CORS for origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200,
};

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
app.get('/health-check', (req, res) => {
  console.log('health-check received');
  return res.status(200).send('I am a live');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Example event
  socket.on('getPostsNotifications', async (clientData, callback) => {
    const data = await getUserNotifications(clientData?.key);

    callback({ Msg: 'successfully retrived posts notifications', data });
  });
});
const initializeProxies = async () => {
  try {
    const proxies1 = await getProxies(
      PROXY_TOKEN1,
      PROXY_USER1,
      PROXY_PASS1,
      'facebookProxies1'
    );
    await storeProxiesDataInRedis(proxies1, 'facebookProxies1'); // Use a suitable key for your proxies
    console.log('Proxies initialized and stored in Redis');
  } catch (error) {
    console.error('Error initializing proxies:', error);
  }
};

runJobs();
initializeProxies();
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Connected to database');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
