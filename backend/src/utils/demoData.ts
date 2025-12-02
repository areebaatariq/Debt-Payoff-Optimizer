import { FinancialContext, DebtTradeline } from '../types';

export const getDemoFinancialContext = (): FinancialContext => {
  return {
    zipCode: '10001',
    monthlyIncome: 5500,
    monthlyExpenses: 3500,
    liquidSavings: 5000,
    creditScoreRange: 'good',
    primaryGoal: 'pay_faster',
    timeHorizonPreference: 36, // 3 years
  };
};

export const getDemoDebts = (): Omit<DebtTradeline, 'id'>[] => {
  return [
    {
      debtType: 'credit_card',
      balance: 8500,
      apr: 22.5,
      minimumPayment: 250,
      creditLimit: 10000,
      nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    },
    {
      debtType: 'credit_card',
      balance: 3200,
      apr: 19.9,
      minimumPayment: 120,
      creditLimit: 5000,
      nextPaymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      debtType: 'personal_loan',
      balance: 12000,
      apr: 15.5,
      minimumPayment: 350,
      nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      debtType: 'auto_loan',
      balance: 18500,
      apr: 6.9,
      minimumPayment: 420,
      nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ];
};


