import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getPosts } from '../contrtrollers/post.js';

const router = express.Router();

router.get('/get-posts', jwtAuthentication, getPosts);

export default router;
