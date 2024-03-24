import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getTasks, createTask } from '../contrtrollers/task.js';

const router = express.Router();

router.get('/get-tasks', jwtAuthentication, getTasks);
router.post('/create-tasks', jwtAuthentication, getTasks);

export default router;
