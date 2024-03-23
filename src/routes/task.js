import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getTasks } from '../contrtrollers/task.js';

const router = express.Router();

router.get('/get-tasks', jwtAuthentication, getTasks);

export default router;
