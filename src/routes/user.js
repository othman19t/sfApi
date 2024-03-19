import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getUserByToken } from '../contrtrollers/user.js';

const router = express.Router();

router.get('/get-user-by-token', jwtAuthentication, getUserByToken);

export default router;
