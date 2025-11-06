// src/app.js
import express from 'express';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(express.json());
app.get('/ping', (req, res) => {
    res.send(`Hello world`);
});

app.use('/users', userRoutes);

export default app;
