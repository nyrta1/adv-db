import express from 'express';
import { getBrands, getBrandById, createBrand } from '../controllers/brand.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', basicAuth, getBrands);
router.get('/:id', basicAuth, getBrandById);
router.post('/', basicAuth, createBrand); // 🔥 добавили create

export default router;
