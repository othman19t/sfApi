import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import {
  getPosts,
  processInitialPosts,
  getPostsByTaskId,
  getPostsByIds,
} from '../contrtrollers/post.js';

const router = express.Router();

router.get('/get-posts', jwtAuthentication, getPosts);
router.get('/get-posts-by-taskId', jwtAuthentication, getPostsByTaskId);
router.post('/initial-posts', processInitialPosts);
router.post('/get-posts-by-ids', getPostsByIds);

export default router;
