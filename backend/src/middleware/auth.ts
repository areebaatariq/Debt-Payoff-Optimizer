import { Request, Response, NextFunction } from 'express';
import { sessionManager } from '../utils/sessionManager';

export interface AuthenticatedRequest extends Request {
  sessionId?: string;
  file?: Express.Multer.File;
}

export const requireSession = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId) {
    return res.status(401).json({
      error: 'Session ID required',
      message: 'Please provide a session ID in the X-Session-Id header',
    });
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    return res.status(401).json({
      error: 'Invalid or expired session',
      message: 'Your session has expired or is invalid. Please create a new session.',
    });
  }

  req.sessionId = sessionId;
  next();
};

