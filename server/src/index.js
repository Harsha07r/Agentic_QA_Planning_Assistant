import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import planRoutes from './routes/planRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Agentic QA Planning Assistant API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/plans', planRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;
