import { Router } from 'express';
import auth from '../auth/auth.routes.js';
import user from './user.js';

const routers = Router();

routers.use('/auth', auth);
routers.use('/user', user);

export default routers;
