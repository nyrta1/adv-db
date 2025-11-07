// src/routes/productRoutes.js
import express from 'express';
import { getProducts, getProductById, createProduct } from '../controllers/product.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', basicAuth, getProducts);
router.get('/:id', basicAuth, getProductById);
router.post('/', basicAuth, createProduct);

export default router;
