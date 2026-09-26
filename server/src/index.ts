import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { situationRouter } from './routes/situations.js';
import { privacyRouter } from './routes/privacy.js';
import { scenarioRouter } from './routes/scenarios.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Request Logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'NextStep End-to-End Decision Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route registration
app.use('/api/situations', situationRouter);
app.use('/api/privacy', privacyRouter);
app.use('/api/scenarios', scenarioRouter);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NextStep End-to-End Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
