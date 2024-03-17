import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../models/user.model.js';
import jwtAuthentication from './jwtAuthentication.js';

dotenv.config();

const router = express.Router();

const secret = process.env.JWT_SECRET;
//jwtAuthentication
router.get('/test', jwtAuthentication, async (req, res) => {
  res.status(201).send({ message: 'successfully hit test' });
});
router.post('/signup', async (req, res) => {
  try {
    console.log('req.body', req.body);
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: 'Login failed' });
    }
    const token = jwt.sign({ id: user._id }, secret);
    console.log('Token to be set:', token);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true, // NOTE: For development over HTTP. Use 'secure: true' in production with HTTPS.
      sameSite: 'Lax', // or 'None' if you need cross-site requests
      path: '/',
    });
    return res.status(200).send({ Msg: 'Logged in successfully.' });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
