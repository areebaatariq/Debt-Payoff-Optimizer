import { useEffect, useRef } from 'react';
import { useAIGuidance } from './useAIGuidance';
import { useAppContext } from '@/contexts/AppContext';

interface TriggerContext {
  debtsAdded?: boolean;
  viewingRecommendations?: boolean;
  scenarioViewed?: boolean;
  inconsistentData?: boolean;
}

export const useAIContextTrigger = (triggers: TriggerContext) => {
  const { getGuidanceAsync } = useAIGuidance();
  const { debts, aggregation, financialContext } = useAppContext();
  const hasTriggered = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Trigger 1: Debt entry complete → personalized summary
    if (triggers.debtsAdded && debts.length > 0 && !hasTriggered.current.has('debts_added')) {
      const totalDebt = aggregation?.totalDebt || 0;
      const avgApr = aggregation?.averageApr || 0;
      
      getGuidanceAsync({
        action: `I just added ${debts.length} debt${debts.length > 1 ? 's' : ''}. My total debt is $${totalDebt.toLocaleString()} with an average APR of ${avgApr.toFixed(2)}%. Can you give me a brief summary of my situation?`,
      }).then(() => {
        hasTriggered.current.add('debts_added');
      });
    }

    // Trigger 2: Inconsistent data detection
    if (triggers.inconsistentData && !hasTriggered.current.has('inconsistent')) {
      const issues: string[] = [];
      
      // Check for unusually low minimum payments
      debts.forEach(debt => {
        const expectedMin = debt.balance * 0.02; // Rough estimate: 2% of balance
        if (debt.minimumPayment < expectedMin * 0.5) {
          issues.push(`The minimum payment for your ${debt.debtType} seems unusually low compared to the balance.`);
        }
      });

      // Check for very high APR
      if (aggregation?.averageApr && aggregation.averageApr > 25) {
        issues.push('Your average APR is quite high. You might want to explore consolidation options.');
      }

      if (issues.length > 0 && financialContext) {
        getGuidanceAsync({
          action: `I notice some potential issues: ${issues.join(' ')} Should I be concerned about these?`,
        }).then(() => {
          hasTriggered.current.add('inconsistent');
        });
      }
    }

    // Trigger 3: User views recommendations → analysis
    if (triggers.viewingRecommendations && !hasTriggered.current.has('recommendations')) {
      getGuidanceAsync({
        action: 'I\'m looking at my recommendations. Can you help me understand the trade-offs between different options?',
      }).then(() => {
        hasTriggered.current.add('recommendations');
      });
    }

    // Trigger 4: User interacts with scenario → impact explanation
    if (triggers.scenarioViewed && !hasTriggered.current.has('scenario')) {
      getGuidanceAsync({
        scenario: {
          strategy: 'avalanche',
          monthlyPayment: aggregation?.totalMinimumPayment || 0,
          payoffMonths: 0,
        },
      }).then(() => {
        hasTriggered.current.add('scenario');
      });
    }
  }, [triggers, debts, aggregation, financialContext, getGuidanceAsync]);
};


