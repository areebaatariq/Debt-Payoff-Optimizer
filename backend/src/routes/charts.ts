import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { generateChartData } from '../utils/chartData';
import { calculatePayoffScenario } from '../utils/debtCalculations';

const router = Router();

router.use(requireSession);

router.get('/data', (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = sessionManager.getSession(req.sessionId!);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    // Optional: get payoff scenario from query params
    const strategy = req.query.strategy as 'avalanche' | 'snowball' | 'custom' | undefined;
    const monthlyPayment = req.query.monthlyPayment 
      ? parseFloat(req.query.monthlyPayment as string) 
      : undefined;

    let payoffScenario;
    if (strategy && monthlyPayment && monthlyPayment > 0) {
      const totalMinimumPayment = session.debts.reduce(
        (sum, debt) => sum + debt.minimumPayment,
        0
      );
      
      if (monthlyPayment >= totalMinimumPayment) {
        payoffScenario = calculatePayoffScenario(
          session.debts,
          monthlyPayment,
          strategy,
          session.financialContext
        );
      }
    }

    const chartData = generateChartData(session.debts, payoffScenario);

    res.json(chartData);
  } catch (error) {
    console.error('Error generating chart data:', error);
    res.status(500).json({
      error: 'Failed to generate chart data',
      message: 'An error occurred while generating chart data',
    });
  }
});

export default router;

