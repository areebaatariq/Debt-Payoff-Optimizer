import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { getDemoFinancialContext, getDemoDebts } from '../utils/demoData';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(requireSession);

router.post('/load', (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = sessionManager.getSession(req.sessionId!);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    // Load demo financial context
    const demoFinancialContext = getDemoFinancialContext();
    const demoDebts = getDemoDebts().map(debt => ({
      ...debt,
      id: uuidv4(),
    }));

    // Update session with demo data
    sessionManager.updateSession(req.sessionId!, {
      financialContext: demoFinancialContext,
      debts: demoDebts,
    });

    res.json({
      message: 'Demo dataset loaded successfully',
      financialContext: demoFinancialContext,
      debtsCount: demoDebts.length,
    });
  } catch (error) {
    console.error('Error loading demo data:', error);
    res.status(500).json({
      error: 'Failed to load demo data',
      message: 'An error occurred while loading the demo dataset',
    });
  }
});

export default router;




