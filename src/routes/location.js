import express from 'express';
import jwtAuthentication from '../auth/jwtAuthentication.js';
import { getlocation } from '../contrtrollers/location.js';

const router = express.Router();

router.get('/get-location/:location', jwtAuthentication, getlocation);

export default router;
