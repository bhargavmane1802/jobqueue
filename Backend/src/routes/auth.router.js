import {Router} from 'express'
import validate_auth from '../middleware/auth.middleware.js';
const authRouter=Router();
authRouter.use('/',validate_auth)
export {authRouter}