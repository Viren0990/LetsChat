import express from 'express'
import userRouter from './user'
import friendRouter from './friends'
import path from 'path';

const router = express.Router();

router.use('/user',userRouter);
router.use('/friends', friendRouter);

export default router;
