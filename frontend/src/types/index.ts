export interface FinancialContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  liquidSavings: number;
  creditScoreRange: 'poor' | 'fair' | 'good' | 'excellent';
  primaryGoal: 'pay_faster' | 'reduce_interest';
}

export interface DebtTradeline {
  id: string;
  debtType: 'credit_card' | 'personal_loan' | 'student_loan' | 'auto_loan' | 'other';
  balance: number;
  apr: number;
  minimumPayment: number;
}