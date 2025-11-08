import express from 'express';
import { createUser, loginUser, getUser, updateUser, getUserHistory } from '../controllers/user.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes
router.get('/:id', basicAuth, getUser);
router.put('/:id', basicAuth, updateUser);
router.get('/:id/history', basicAuth, getUserHistory);

export default router;
