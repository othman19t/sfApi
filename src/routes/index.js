import { Router } from 'express';
import auth from '../auth/auth.routes.js';

const routers = Router();

routers.use('/auth', auth);

export default routers;
