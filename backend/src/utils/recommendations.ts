import { DebtTradeline, Recommendation, FinancialContext } from '../types';
import { calculatePayoffScenario, calculateTotalDebt } from './debtCalculations';
import { loadRecommendationConfig } from './configLoader';

interface RecommendationRule {
  type: 'consolidate' | 'settle' | 'refinance';
  condition: (debts: DebtTradeline[], context: FinancialContext | null) => boolean;
  evaluate: (debts: DebtTradeline[], context: FinancialContext | null) => Recommendation | null;
}

const consolidateRule: RecommendationRule = {
  type: 'consolidate',
  condition: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!config.consolidation.enabled || !context || debts.length < config.consolidation.min_debts) return false;
    
    const highAprDebts = debts.filter(d => 
      config.consolidation.debt_types.includes(d.debtType) && d.apr >= config.consolidation.min_apr
    );
    
    const totalDebt = calculateTotalDebt(debts);
    
    return (
      highAprDebts.length >= config.consolidation.min_debts &&
      totalDebt < config.consolidation.max_total_debt &&
      config.consolidation.eligible_credit_scores.includes(context.creditScoreRange)
    );
  },
  evaluate: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!context) return null;
    
    const highAprDebts = debts.filter(d => 
      config.consolidation.debt_types.includes(d.debtType) && d.apr >= config.consolidation.min_apr
    );
    
    if (highAprDebts.length < config.consolidation.min_debts) return null;
    
    const currentTotalPayment = highAprDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const estimatedConsolidationApr = config.consolidation.estimated_apr;
    const estimatedConsolidationBalance = calculateTotalDebt(highAprDebts);
    const estimatedNewPayment = estimatedConsolidationBalance * config.consolidation.payment_percentage;
    
    // Estimate savings: difference in interest over 3 years
    const currentMonthlyInterest = highAprDebts.reduce(
      (sum, d) => sum + (d.balance * (d.apr / 100)) / 12,
      0
    );
    const newMonthlyInterest = (estimatedConsolidationBalance * (estimatedConsolidationApr / 100)) / 12;
    const monthlySavings = currentMonthlyInterest - newMonthlyInterest;
    const estimatedSavings = monthlySavings * 36; // 3 years
    
    let fitScore: 'low' | 'medium' | 'high' = 'medium';
    if (estimatedSavings >= config.fit_score_thresholds.high.savings_min) {
      fitScore = 'high';
    } else if (estimatedSavings >= config.fit_score_thresholds.medium.savings_min) {
      fitScore = 'medium';
    } else {
      fitScore = 'low';
    }
    
    return {
      type: 'consolidate',
      debtIds: highAprDebts.map(d => d.id),
      description: `Consolidate ${highAprDebts.length} high-interest credit cards into a single loan`,
      estimatedSavings: Math.max(0, estimatedSavings),
      newMonthlyPayment: estimatedNewPayment,
      fitScore,
      reasoning: `You have ${highAprDebts.length} credit cards with APRs of ${config.consolidation.min_apr}% or higher. Consolidating them could reduce your monthly interest and simplify payments.`,
    };
  },
};

const settleRule: RecommendationRule = {
  type: 'settle',
  condition: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!config.settlement.enabled || !context) return false;
    
    return (
      config.settlement.eligible_credit_scores.includes(context.creditScoreRange) &&
      debts.some(d => d.apr >= config.settlement.min_apr && d.balance <= config.settlement.max_balance)
    );
  },
  evaluate: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!context || !config.settlement.eligible_credit_scores.includes(context.creditScoreRange)) return null;
    
    const settleableDebts = debts.filter(d => 
      d.apr >= config.settlement.min_apr && d.balance <= config.settlement.max_balance
    );
    
    if (settleableDebts.length === 0) return null;
    
    const currentTotal = calculateTotalDebt(settleableDebts);
    const estimatedSettlementAmount = currentTotal * config.settlement.estimated_settlement_percentage;
    const estimatedSavings = currentTotal - estimatedSettlementAmount;
    
    return {
      type: 'settle',
      debtIds: settleableDebts.map(d => d.id),
      description: `Consider debt settlement for ${settleableDebts.length} high-interest, smaller debts`,
      estimatedSavings,
      newMonthlyPayment: estimatedSettlementAmount / config.settlement.settlement_period_months,
      fitScore: 'medium', // Settlement is risky, so medium at best
      reasoning: `Given your credit situation, you may be able to negotiate settlements on these high-interest debts. This would significantly reduce your total debt, though it may impact your credit score.`,
    };
  },
};

const refinanceRule: RecommendationRule = {
  type: 'refinance',
  condition: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!config.refinancing.enabled || !context) return false;
    
    const largeHighAprDebts = debts.filter(
      d => 
        d.balance >= config.refinancing.min_balance && 
        d.apr >= config.refinancing.min_apr && 
        !config.refinancing.excluded_debt_types.includes(d.debtType)
    );
    
    return (
      largeHighAprDebts.length > 0 &&
      config.refinancing.eligible_credit_scores.includes(context.creditScoreRange)
    );
  },
  evaluate: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!context) return null;
    
    const refinanceableDebts = debts.filter(
      d => 
        d.balance >= config.refinancing.min_balance && 
        d.apr >= config.refinancing.min_apr && 
        !config.refinancing.excluded_debt_types.includes(d.debtType)
    );
    
    if (refinanceableDebts.length === 0) return null;
    
    // Take the largest debt for refinancing recommendation
    const targetDebt = refinanceableDebts.sort((a, b) => b.balance - a.balance)[0];
    const estimatedNewApr = Math.max(5, targetDebt.apr - config.refinancing.apr_improvement_estimate);
    
    const currentMonthlyInterest = (targetDebt.balance * (targetDebt.apr / 100)) / 12;
    const newMonthlyInterest = (targetDebt.balance * (estimatedNewApr / 100)) / 12;
    const monthlySavings = currentMonthlyInterest - newMonthlyInterest;
    const estimatedSavings = monthlySavings * config.refinancing.evaluation_period_months;
    
    let fitScore: 'low' | 'medium' | 'high' = 'medium';
    if (estimatedSavings >= config.fit_score_thresholds.high.savings_min) {
      fitScore = 'high';
    } else if (estimatedSavings >= config.fit_score_thresholds.medium.savings_min) {
      fitScore = 'medium';
    } else {
      fitScore = 'low';
    }
    
    return {
      type: 'refinance',
      debtIds: [targetDebt.id],
      description: `Refinance your ${targetDebt.debtType} to get a lower interest rate`,
      estimatedSavings: Math.max(0, estimatedSavings),
      newMonthlyPayment: targetDebt.minimumPayment * 0.9, // Slightly lower payment
      fitScore,
      reasoning: `With your ${context.creditScoreRange} credit score, you may qualify for a better interest rate on this loan. This could save you significant money over time.`,
    };
  },
};

// Balance Transfer Rule for credit cards
const balanceTransferRule: RecommendationRule = {
  type: 'consolidate',
  condition: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!config.balance_transfer.enabled || !context || debts.length < config.balance_transfer.min_debts) return false;
    
    const highAprCards = debts.filter(d => 
      config.balance_transfer.debt_types.includes(d.debtType) && d.apr >= config.balance_transfer.min_apr
    );
    
    const totalCardDebt = calculateTotalDebt(highAprCards);
    
    return (
      highAprCards.length >= config.balance_transfer.min_debts &&
      totalCardDebt < config.balance_transfer.max_total_debt &&
      config.balance_transfer.eligible_credit_scores.includes(context.creditScoreRange)
    );
  },
  evaluate: (debts, context) => {
    const config = loadRecommendationConfig();
    if (!context) return null;
    
    const highAprCards = debts.filter(d => 
      config.balance_transfer.debt_types.includes(d.debtType) && d.apr >= config.balance_transfer.min_apr
    );
    
    if (highAprCards.length < config.balance_transfer.min_debts) return null;
    
    const currentTotalPayment = highAprCards.reduce((sum, d) => sum + d.minimumPayment, 0);
    const estimatedTransferApr = config.balance_transfer.estimated_promo_apr;
    const estimatedTransferBalance = calculateTotalDebt(highAprCards);
    const transferFee = estimatedTransferBalance * config.balance_transfer.transfer_fee_percentage;
    const estimatedNewPayment = estimatedTransferBalance * 0.02; // 2% of balance
    
    // Estimate savings over promotional period
    const currentMonthlyInterest = highAprCards.reduce(
      (sum, d) => sum + (d.balance * (d.apr / 100)) / 12,
      0
    );
    const newMonthlyInterest = ((estimatedTransferBalance + transferFee) * (estimatedTransferApr / 100)) / 12;
    const monthlySavings = currentMonthlyInterest - newMonthlyInterest;
    const estimatedSavings = (monthlySavings * config.balance_transfer.promo_period_months) - transferFee;
    
    let fitScore: 'low' | 'medium' | 'high' = 'medium';
    if (estimatedSavings >= config.fit_score_thresholds.high.savings_min) {
      fitScore = 'high';
    } else if (estimatedSavings >= config.fit_score_thresholds.medium.savings_min) {
      fitScore = 'medium';
    } else {
      fitScore = 'low';
    }
    
    return {
      type: 'consolidate',
      debtIds: highAprCards.map(d => d.id),
      description: `Consider a balance transfer for ${highAprCards.length} high-interest credit cards with 0% APR promo`,
      estimatedSavings: Math.max(0, estimatedSavings),
      newMonthlyPayment: estimatedNewPayment,
      fitScore,
      reasoning: `You have ${highAprCards.length} credit cards with high APRs. A balance transfer to a 0% promotional APR card could save significant interest, especially with your ${context.creditScoreRange} credit score. Note: There's typically a ${(config.balance_transfer.transfer_fee_percentage * 100)}% transfer fee.`,
    };
  },
};

const rules: RecommendationRule[] = [
  consolidateRule,
  balanceTransferRule,
  settleRule,
  refinanceRule,
];

export const generateRecommendations = (
  debts: DebtTradeline[],
  financialContext: FinancialContext | null
): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  for (const rule of rules) {
    if (rule.condition(debts, financialContext)) {
      const recommendation = rule.evaluate(debts, financialContext);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
  }

  // Sort by fit score (high first) and savings (descending)
  recommendations.sort((a, b) => {
    const scoreOrder = { high: 3, medium: 2, low: 1 };
    const scoreDiff = scoreOrder[b.fitScore] - scoreOrder[a.fitScore];
    if (scoreDiff !== 0) return scoreDiff;
    return b.estimatedSavings - a.estimatedSavings;
  });

  return recommendations;
};

