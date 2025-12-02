import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sessionRoutes from './routes/session';
import financialContextRoutes from './routes/financialContext';
import debtsRoutes from './routes/debts';
import payoffRoutes from './routes/payoff';
import recommendationsRoutes from './routes/recommendations';
import chartsRoutes from './routes/charts';
import aiRoutes from './routes/ai';
import demoRoutes from './routes/demo';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Allow multiple origins for development (frontend can run on different ports)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [
      'http://localhost:5173', 
      'http://localhost:5137', 
      'http://localhost:3000',
      'https://debt-payoff-optimizer.onrender.com'
    ];

const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In production (or when NODE_ENV is not set but on Render), allow any Render subdomain
    // Check for Render by looking for .onrender.com in origin or checking RENDER environment
    const isOnRender = process.env.RENDER || origin.includes('.onrender.com');
    if (!isDevelopment || isOnRender) {
      if (origin.includes('.onrender.com')) {
        return callback(null, true);
      }
    }
    
    // In development, allow any localhost port for flexibility
    if (isDevelopment && !isOnRender && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Also allow 127.0.0.1 in development
    if (isDevelopment && !isOnRender && origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Log rejected origin for debugging
    console.warn(`CORS: Origin "${origin}" not allowed. Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/session', sessionRoutes);
app.use('/api/financial-context', financialContextRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/payoff', payoffRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Don't handle CORS errors here - they're already handled by CORS middleware
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CORS policy: Origin not allowed',
    });
  }
  
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PathLight Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
