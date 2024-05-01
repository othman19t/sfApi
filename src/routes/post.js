import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getPosts, processInitialPosts } from '../contrtrollers/post.js';

const router = express.Router();

router.get('/get-posts', jwtAuthentication, getPosts);
router.post('/initial-posts', processInitialPosts);

export default router;
