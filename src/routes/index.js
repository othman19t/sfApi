import { Router } from 'express';
import auth from '../auth/auth.routes.js';
import user from './user.js';
import notification from './notification.js';
import post from './post.js';
import task from './task.js';
import location from './location.js';

const routers = Router();

routers.use('/auth', auth);
routers.use('/user', user);
routers.use('/notification', notification);
routers.use('/post', post);
routers.use('/task', task);
routers.use('/location', location);

export default routers;
