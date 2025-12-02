import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { generateAIGuidance } from '../utils/aiGuidance';

const router = Router();

router.use(requireSession);

router.post('/guidance', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, scenario } = req.body;

    const session = sessionManager.getSession(req.sessionId!);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = process.env.GEMINI_URL;

    const guidance = await generateAIGuidance(
      {
        action,
        debts: session.debts,
        financialContext: session.financialContext,
        scenario,
      },
      geminiApiKey,
      geminiUrl
    );

    res.json({
      guidance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating AI guidance:', error);
    res.status(500).json({
      error: 'Failed to generate guidance',
      message: 'An error occurred while generating AI guidance',
    });
  }
});

export default router;

