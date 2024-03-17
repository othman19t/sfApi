import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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
app.use(cors(corsOptions));
app.use(cookieParser()); // Somewhere in your server setup before you use your routes
app.use(bodyParser.json({ limit: '6mb' }));
app.use('/api', routers);
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
