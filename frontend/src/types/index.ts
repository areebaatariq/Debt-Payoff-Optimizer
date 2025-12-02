export interface FinancialContext {
  zipCode?: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  liquidSavings: number;
  creditScoreRange: 'poor' | 'fair' | 'good' | 'excellent';
  primaryGoal: 'pay_faster' | 'reduce_interest' | 'lower_payment' | 'avoid_default';
  timeHorizonPreference?: number; // in months
}

export interface DebtTradeline {
  id: string;
  debtType: 'credit_card' | 'personal_loan' | 'student_loan' | 'auto_loan' | 'other';
  balance: number;
  apr: number;
  minimumPayment: number;
  nextPaymentDate?: string; // ISO date string
  creditLimit?: number; // For credit cards to calculate utilization
}