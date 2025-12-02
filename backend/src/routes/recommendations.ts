import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { generateRecommendations } from '../utils/recommendations';

const router = Router();

router.use(requireSession);

router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = sessionManager.getSession(req.sessionId!);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    if (session.debts.length === 0) {
      return res.json({
        recommendations: [],
        message: 'Add debts to get personalized recommendations',
      });
    }

    const recommendations = generateRecommendations(
      session.debts,
      session.financialContext
    );

    res.json({
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: 'An error occurred while generating recommendations',
    });
  }
});

export default router;

