import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { z } from 'zod';

const router = Router();

const financialContextSchema = z.object({
  zipCode: z.string().optional(),
  monthlyIncome: z.number().min(0),
  monthlyExpenses: z.number().min(0),
  liquidSavings: z.number().min(0),
  creditScoreRange: z.enum(['poor', 'fair', 'good', 'excellent']),
  primaryGoal: z.enum(['pay_faster', 'reduce_interest', 'lower_payment', 'avoid_default']),
  timeHorizonPreference: z.number().min(0).optional(),
});

router.use(requireSession);

router.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const validationResult = financialContextSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid financial context data',
        details: validationResult.error.errors,
      });
    }

    const success = sessionManager.updateSession(req.sessionId!, {
      financialContext: validationResult.data,
    });

    if (!success) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    res.json({
      message: 'Financial context saved successfully',
      financialContext: validationResult.data,
    });
  } catch (error) {
    console.error('Error saving financial context:', error);
    res.status(500).json({
      error: 'Failed to save financial context',
      message: 'An error occurred while saving your financial context',
    });
  }
});

router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = sessionManager.getSession(req.sessionId!);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    res.json({
      financialContext: session.financialContext,
    });
  } catch (error) {
    console.error('Error getting financial context:', error);
    res.status(500).json({
      error: 'Failed to get financial context',
      message: 'An error occurred while retrieving your financial context',
    });
  }
});

export default router;

