import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getTasks, createTask, updateTask } from '../contrtrollers/task.js';

const router = express.Router();

router.get('/get-tasks', jwtAuthentication, getTasks);
router.post('/create-tasks', jwtAuthentication, createTask);
router.put('/update-tasks', jwtAuthentication, updateTask);

export default router;
