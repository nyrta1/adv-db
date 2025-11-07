// src/app.js
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/ping', (req, res) => {
    res.send(`Hello world`);
});

app.use('/users', userRoutes);
app.use('/products', productRoutes);

export default app;
