import { DebtTradeline, ChartData, PayoffScenarioResult } from '../types';

const DEBT_TYPE_MAP: { [key: string]: string } = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  student_loan: 'Student Loan',
  auto_loan: 'Auto Loan',
  other: 'Other',
};

export const generateChartData = (
  debts: DebtTradeline[],
  payoffScenario?: PayoffScenarioResult
): ChartData => {
  // Pie chart: debt composition by type
  const pieData = generatePieChartData(debts);

  // Line chart: payoff over time
  const lineData = payoffScenario
    ? payoffScenario.chartData.map(d => ({
        month: d.month,
        balance: d.balance,
        interestPaid: d.interestPaid,
      }))
    : [];

  // Bar chart: interest savings comparison (would need multiple scenarios)
  // For now, we'll generate a simple bar showing current interest vs potential
  const barData = generateBarChartData(debts, payoffScenario);

  return {
    pie: pieData,
    line: lineData,
    bar: barData,
  };
};

const generatePieChartData = (debts: DebtTradeline[]) => {
  const debtByType = debts.reduce((acc, debt) => {
    acc[debt.debtType] = (acc[debt.debtType] || 0) + debt.balance;
    return acc;
  }, {} as { [key: string]: number });

  return Object.entries(debtByType).map(([key, value]) => ({
    name: DEBT_TYPE_MAP[key] || key,
    value: Math.round(value * 100) / 100,
  }));
};

const generateBarChartData = (
  debts: DebtTradeline[],
  payoffScenario?: PayoffScenarioResult
) => {
  // Calculate current monthly interest
  const currentMonthlyInterest = debts.reduce(
    (sum, debt) => sum + (debt.balance * (debt.apr / 100)) / 12,
    0
  );

  // If we have a payoff scenario, we can compare strategies
  if (payoffScenario && payoffScenario.payoffInMonths > 0) {
    const totalInterestPaid = payoffScenario.totalInterestPaid;
    const avgMonthlyInterest = totalInterestPaid / payoffScenario.payoffInMonths;
    
    return [
      {
        name: 'Current Plan',
        interestSavings: 0,
      },
      {
        name: 'Optimized Strategy',
        interestSavings: Math.max(0, (currentMonthlyInterest - avgMonthlyInterest) * payoffScenario.payoffInMonths),
      },
    ];
  }

  // Default: show current interest projection
  return [
    {
      name: 'Projected Interest',
      interestSavings: -currentMonthlyInterest * 12, // Negative because it's a cost
    },
  ];
};

