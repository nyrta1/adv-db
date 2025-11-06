// src/routes/userRoutes.js
import express from 'express';
import { createUser, loginUser, getUser, updateUser } from '../controllers/user.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes
router.get('/:id', basicAuth, getUser);
router.put('/:id', basicAuth, updateUser);

export default router;
