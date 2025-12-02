import { DebtTradeline, DebtAggregation, PayoffScenarioResult, FinancialContext } from '../types';

export const calculateTotalDebt = (debts: DebtTradeline[]): number => {
  return debts.reduce((acc, debt) => acc + debt.balance, 0);
};

export const calculateWeightedAverageApr = (debts: DebtTradeline[]): number => {
  const totalDebt = calculateTotalDebt(debts);
  if (totalDebt === 0) {
    return 0;
  }
  const weightedSum = debts.reduce((acc, debt) => acc + debt.balance * (debt.apr / 100), 0);
  return (weightedSum / totalDebt) * 100;
};

export const calculateDTI = (debts: DebtTradeline[], monthlyIncome: number): number => {
  if (monthlyIncome === 0) {
    return 0;
  }
  const totalMinimumPayment = debts.reduce((acc, debt) => acc + debt.minimumPayment, 0);
  return (totalMinimumPayment / monthlyIncome) * 100;
};

export const calculateUtilizationRate = (debts: DebtTradeline[]): number => {
  const creditCardDebts = debts.filter(d => d.debtType === 'credit_card');
  if (creditCardDebts.length === 0) return 0;

  const totalCreditLimit = creditCardDebts.reduce((sum, debt) => {
    return sum + (debt.creditLimit || 0);
  }, 0);

  if (totalCreditLimit === 0) return 0;

  const totalCreditCardBalance = creditCardDebts.reduce((sum, debt) => sum + debt.balance, 0);
  return (totalCreditCardBalance / totalCreditLimit) * 100;
};

export const calculateDebtAggregation = (
  debts: DebtTradeline[],
  monthlyIncome: number = 0
): DebtAggregation => {
  return {
    totalDebt: calculateTotalDebt(debts),
    averageApr: calculateWeightedAverageApr(debts),
    dti: calculateDTI(debts, monthlyIncome),
    totalMinimumPayment: debts.reduce((acc, debt) => acc + debt.minimumPayment, 0),
    utilizationRate: calculateUtilizationRate(debts),
    numberOfAccounts: debts.length,
  };
};

export const calculatePayoffScenario = (
  initialDebts: DebtTradeline[],
  monthlyPayment: number,
  strategy: 'avalanche' | 'snowball' | 'custom',
  financialContext: FinancialContext | null = null
): PayoffScenarioResult => {
  if (initialDebts.length === 0 || monthlyPayment <= 0) {
    return {
      payoffInMonths: 0,
      totalInterestPaid: 0,
      chartData: [],
      monthlyBreakdown: [],
    };
  }

  // Deep clone debts
  let debts = JSON.parse(JSON.stringify(initialDebts)) as DebtTradeline[];
  let months = 0;
  let totalInterestPaid = 0;
  const initialTotalDebt = calculateTotalDebt(debts);
  const chartData: Array<{ month: number; balance: number; interestPaid: number }> = [
    { month: 0, balance: initialTotalDebt, interestPaid: 0 },
  ];
  const monthlyBreakdown: PayoffScenarioResult['monthlyBreakdown'] = [];

  const maxMonths = 600; // 50 year limit

  while (debts.reduce((sum, d) => sum + d.balance, 0) > 0.01 && months < maxMonths) {
    months++;
    let paymentRemaining = monthlyPayment;
    let interestForMonth = 0;

    // 1. Add interest for the month
    for (const debt of debts) {
      const monthlyInterest = (debt.balance * (debt.apr / 100)) / 12;
      debt.balance += monthlyInterest;
      interestForMonth += monthlyInterest;
    }
    totalInterestPaid += interestForMonth;

    // 2. Sort debts based on strategy (if not custom)
    if (strategy === 'avalanche') {
      debts.sort((a, b) => b.apr - a.apr);
    } else if (strategy === 'snowball') {
      debts.sort((a, b) => a.balance - b.balance);
    }
    // For 'custom', we don't sort. We use the order provided.

    // 3. Make minimum payments first, then apply extra payment
    const monthlyDebtPayments: Array<{ id: string; balance: number; payment: number }> = [];
    
    // First pass: make minimum payments
    for (const debt of debts) {
      if (paymentRemaining <= 0) break;
      
      const minPaymentDue = Math.min(debt.minimumPayment, debt.balance);
      const actualPayment = Math.min(minPaymentDue, paymentRemaining);
      
      debt.balance -= actualPayment;
      paymentRemaining -= actualPayment;
      
      monthlyDebtPayments.push({
        id: debt.id,
        balance: debt.balance,
        payment: actualPayment,
      });
    }

    // Second pass: apply extra payment to highest priority debt
    if (paymentRemaining > 0) {
      for (const debt of debts) {
        if (debt.balance > 0.01 && paymentRemaining > 0) {
          const extraPayment = Math.min(debt.balance, paymentRemaining);
          debt.balance -= extraPayment;
          paymentRemaining -= extraPayment;
          
          const existingDebtPayment = monthlyDebtPayments.find(d => d.id === debt.id);
          if (existingDebtPayment) {
            existingDebtPayment.payment += extraPayment;
            existingDebtPayment.balance = debt.balance;
          } else {
            monthlyDebtPayments.push({
              id: debt.id,
              balance: debt.balance,
              payment: extraPayment,
            });
          }
        }
      }
    }

    // 4. Filter out paid-off debts
    debts = debts.filter(d => d.balance > 0.01);

    const currentBalance = calculateTotalDebt(debts);
    chartData.push({
      month: months,
      balance: currentBalance,
      interestPaid: totalInterestPaid,
    });

    monthlyBreakdown.push({
      month: months,
      debts: monthlyDebtPayments,
    });
  }

  return {
    payoffInMonths: months,
    totalInterestPaid,
    chartData,
    monthlyBreakdown,
  };
};
