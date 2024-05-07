import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import {
  getPosts,
  processInitialPosts,
  getPostsByTaskId,
} from '../contrtrollers/post.js';

const router = express.Router();

router.get('/get-posts', jwtAuthentication, getPosts);
router.get('/get-posts-by-taskId', jwtAuthentication, getPostsByTaskId);
router.post('/initial-posts', processInitialPosts);
export default router;
