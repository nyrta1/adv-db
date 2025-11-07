import express from 'express';
import { getCategories, getCategoryById, createCategory } from '../controllers/category.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', basicAuth, getCategories);
router.get('/:id', basicAuth, getCategoryById);
router.post('/', basicAuth, createCategory); // 🔥 добавили create

export default router;
