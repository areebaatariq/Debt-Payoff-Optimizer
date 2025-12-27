import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory analytics store (in production, use a database)
interface AnalyticsEvent {
  sessionId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
}

const analyticsStore: AnalyticsEvent[] = [];

router.use(requireSession);

router.post('/track', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventType, eventData } = req.body;

    if (!eventType) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'eventType is required',
      });
    }

    const event: AnalyticsEvent = {
      sessionId: req.sessionId!,
      eventType,
      eventData: eventData || {},
      timestamp: new Date(),
    };

    analyticsStore.push(event);

    // Keep only last 10000 events (prevent memory leak)
    if (analyticsStore.length > 10000) {
      analyticsStore.shift();
    }

    res.json({
      message: 'Event tracked successfully',
      eventId: analyticsStore.length - 1,
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({
      error: 'Failed to track event',
      message: 'An error occurred while tracking the analytics event',
    });
  }
});

// Get analytics for current session (for debugging/admin)
router.get('/session', (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionEvents = analyticsStore.filter(
      e => e.sessionId === req.sessionId!
    );

    res.json({
      sessionId: req.sessionId,
      events: sessionEvents,
      count: sessionEvents.length,
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: 'An error occurred while retrieving analytics',
    });
  }
});

// Get aggregated analytics (admin endpoint - no auth for simplicity in demo)
router.get('/summary', (req: any, res: Response) => {
  try {
    const eventTypes = analyticsStore.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueSessions = new Set(analyticsStore.map(e => e.sessionId)).size;

    res.json({
      totalEvents: analyticsStore.length,
      uniqueSessions,
      eventTypeCounts: eventTypes,
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({
      error: 'Failed to get analytics summary',
      message: 'An error occurred while retrieving analytics summary',
    });
  }
});

export default router;




