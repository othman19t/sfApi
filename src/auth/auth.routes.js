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

    const { email, password, firstName, lastName, postalCode, timezone } =
      req.body;
    //TODO: check email does not exist before inserting datas
    const emailExists = await User.findOne({ email: email });

    if (emailExists) {
      return res
        .status(400)
        .send({ success: false, message: 'Email Address already registered' });
    }
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      postalCode,
      timezone,
    });
    await user.save();
    return res
      .status(201)
      .send({ success: true, message: 'User created successfully' });
  } catch (error) {
    return res.status(400).send({ success: false, error });
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
    console.log('Token generated:', token);

    return res
      .status(200)
      .json({ token, success: true, message: 'Successfully logged user in!' }); // Return the token in the response
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
