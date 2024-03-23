import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getUserNotifications } from '../contrtrollers/notification.js';

const router = express.Router();

router.get('/get-notifications', jwtAuthentication, getUserNotifications);

export default router;
