// src/routes/productRoutes.js
import express from 'express';
import { getProducts, getProductById } from '../controllers/product.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', basicAuth, getProducts);
router.get('/:id', basicAuth, getProductById);

export default router;
