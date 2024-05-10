import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import {
  getUserNotifications,
  createNotification,
} from '../contrtrollers/notification.js';

const router = express.Router();

router.get('/get-notifications', jwtAuthentication, getUserNotifications);
router.post('/create-notifications', createNotification);

export default router;
