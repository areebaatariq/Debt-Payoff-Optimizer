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

export interface SessionData {
  sessionId: string;
  createdAt: Date;
  lastAccessedAt: Date;
  financialContext: FinancialContext | null;
  debts: DebtTradeline[];
}

export interface DebtAggregation {
  totalDebt: number;
  averageApr: number;
  dti: number; // Debt-to-Income ratio
  totalMinimumPayment: number;
  utilizationRate: number; // Credit utilization rate (%)
  numberOfAccounts: number;
}

export interface PayoffScenarioResult {
  payoffInMonths: number;
  totalInterestPaid: number;
  chartData: { month: number; balance: number; interestPaid: number }[];
  monthlyBreakdown: {
    month: number;
    debts: Array<{
      id: string;
      balance: number;
      payment: number;
    }>;
  }[];
}

export interface Recommendation {
  type: 'consolidate' | 'settle' | 'refinance';
  debtIds: string[];
  description: string;
  estimatedSavings: number;
  newMonthlyPayment: number;
  fitScore: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface ChartData {
  pie: Array<{ name: string; value: number }>;
  line: Array<{ month: number; balance: number; interestPaid: number }>;
  bar: Array<{ name: string; interestSavings: number }>;
}
