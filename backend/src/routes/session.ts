import { Router, Response } from 'express';
import { sessionManager } from '../utils/sessionManager';

const router = Router();

router.post('/', (req: any, res: Response) => {
  try {
    const sessionId = sessionManager.createSession();
    
    res.status(201).json({
      sessionId,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: 'An error occurred while creating your session',
    });
  }
});

router.get('/:sessionId', (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    res.json({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt,
      hasFinancialContext: !!session.financialContext,
      debtCount: session.debts.length,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: 'Failed to get session',
      message: 'An error occurred while retrieving your session',
    });
  }
});

export default router;

