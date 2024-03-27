import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import routers from './src/routes/index.js';

dotenv.config();
const sfcClient = process.env.SF_CLIENT;
const PORT = process.env.PORT || 3002;
const dbUrl = process.env.DB_URL;
const allowList = [`${sfcClient}`];
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
app.use(cookieParser()); // Somewhere in your server setup before you use your routes
app.use(bodyParser.json({ limit: '6mb' }));
app.use('/api', routers);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Example event
  socket.on('example_event', (clientData, callback) => {
    console.log(`Received example_event with data: ${clientData}`);
    callback({ Msg: 'clientData is received on socket eventBuzz' });
  });
});

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Connected to database');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
