import express from 'express';
import {
  blockProxy,
  hendleGetFacebookProxies,
} from '../contrtrollers/proxy.js';
const router = express.Router();

router.post('/block-proxy', blockProxy);
router.get('/get-proxies', hendleGetFacebookProxies);

export default router;
