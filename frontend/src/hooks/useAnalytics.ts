import { useCallback } from 'react';
import { analyticsApi } from '@/services/api';

export const useAnalytics = () => {
  const track = useCallback((eventType: string, eventData?: any) => {
    // Only track if we have a session
    if (typeof window !== 'undefined') {
      analyticsApi.track(eventType, eventData).catch((error) => {
        // Silently fail analytics - don't interrupt user experience
        console.error('Analytics tracking failed:', error);
      });
    }
  }, []);

  return { track };
};

// Common event types
export const AnalyticsEvents = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  
  // Debt Management
  DEBT_ADDED: 'debt_added',
  DEBT_UPDATED: 'debt_updated',
  DEBT_DELETED: 'debt_deleted',
  CSV_UPLOADED: 'csv_uploaded',
  
  // Payoff
  PAYOFF_SIMULATED: 'payoff_simulated',
  STRATEGY_CHANGED: 'strategy_changed',
  CALIBRATION_CONFIRMED: 'calibration_confirmed',
  CALIBRATION_EDITED: 'calibration_edited',
  
  // Scenarios
  WHAT_IF_PAY_MORE: 'what_if_pay_more',
  WHAT_IF_CONSOLIDATE: 'what_if_consolidate',
  WHAT_IF_SETTLE: 'what_if_settle',
  
  // Recommendations
  RECOMMENDATION_VIEWED: 'recommendation_viewed',
  RECOMMENDATION_EXPLORED: 'recommendation_explored',
  
  // AI
  AI_GUIDANCE_REQUESTED: 'ai_guidance_requested',
  AI_GUIDANCE_AUTO_SHOWN: 'ai_guidance_auto_shown',
  
  // Navigation
  PAGE_VIEWED: 'page_viewed',
  EXPORT_TRIGGERED: 'export_triggered',
  
  // Demo
  DEMO_LOADED: 'demo_loaded',
};


