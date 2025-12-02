import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { calculatePayoffScenario } from '../utils/debtCalculations';
import { z } from 'zod';

const router = Router();

const simulateSchema = z.object({
  strategy: z.enum(['avalanche', 'snowball', 'custom']),
  monthlyPayment: z.number().min(0),
});

router.use(requireSession);

router.post('/simulate', (req: AuthenticatedRequest, res: Response) => {
  try {
    const validationResult = simulateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid simulation parameters',
        details: validationResult.error.errors,
      });
    }

    const { strategy, monthlyPayment } = validationResult.data;

    const session = sessionManager.getSession(req.sessionId!);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    if (session.debts.length === 0) {
      return res.status(400).json({
        error: 'No debts found',
        message: 'Please add debts before running a simulation',
      });
    }

    const totalMinimumPayment = session.debts.reduce(
      (sum, debt) => sum + debt.minimumPayment,
      0
    );

    if (monthlyPayment < totalMinimumPayment) {
      return res.status(400).json({
        error: 'Invalid monthly payment',
        message: `Monthly payment must be at least $${totalMinimumPayment.toFixed(2)} (total minimum payments)`,
        totalMinimumPayment,
      });
    }

    const scenario = calculatePayoffScenario(
      session.debts,
      monthlyPayment,
      strategy,
      session.financialContext
    );

    res.json({
      scenario,
      strategy,
      monthlyPayment,
    });
  } catch (error) {
    console.error('Error simulating payoff:', error);
    res.status(500).json({
      error: 'Failed to simulate payoff',
      message: 'An error occurred while calculating your payoff scenario',
    });
  }
});

export default router;

