import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    toggleLikeProduct,
    buyProduct,
    getRecommendations,
} from '../controllers/product.js';
import { basicAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', basicAuth, getProducts);
router.get('/recommendations', basicAuth, getRecommendations);
router.get('/:id', basicAuth, getProductById);
router.post('/', basicAuth, createProduct);
router.post('/:id/like', basicAuth, toggleLikeProduct);
router.post('/:id/buy', basicAuth, buyProduct);

export default router;
