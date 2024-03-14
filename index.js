import express from 'express';
import dotenv from 'dotenv';

const app = express();

dotenv.config();
const sfcClient = process.env.SF_CLIENT;
const PORT = process.env.PORT || 3002;

const allowList = [`${sfcClient}`];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true, // This allows session cookies from browser to pass through
};

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
