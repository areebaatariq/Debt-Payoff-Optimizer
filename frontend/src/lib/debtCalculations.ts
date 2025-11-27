import { DebtTradeline } from "@/types";

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

export interface PayoffScenarioResult {
  payoffInMonths: number;
  totalInterestPaid: number;
  chartData: { month: number; balance: number }[];
}

export const calculatePayoffScenario = (
  initialDebts: DebtTradeline[],
  monthlyPayment: number,
  strategy: 'avalanche' | 'snowball' | 'custom'
): PayoffScenarioResult => {
  if (initialDebts.length === 0 || monthlyPayment <= 0) {
    return { payoffInMonths: 0, totalInterestPaid: 0, chartData: [] };
  }

  let debts = JSON.parse(JSON.stringify(initialDebts)) as DebtTradeline[];
  let months = 0;
  let totalInterestPaid = 0;
  const initialTotalDebt = calculateTotalDebt(debts);
  const chartData = [{ month: 0, balance: initialTotalDebt }];

  while (debts.reduce((sum, d) => sum + d.balance, 0) > 0 && months < 600) { // 50 year limit
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

    // 3. Make minimum payments (simplified)
    // This part is simplified for the model; a real-world app would be more complex.
    // We assume the total monthly payment covers all minimums.

    // 4. Apply remaining payment
    for (const debt of debts) {
        if (paymentRemaining > 0) {
            const payment = Math.min(debt.balance, paymentRemaining);
            debt.balance -= payment;
            paymentRemaining -= payment;
        }
    }

    // 5. Filter out paid-off debts
    debts = debts.filter(d => d.balance > 0.01);

    chartData.push({ month: months, balance: calculateTotalDebt(debts) });
  }

  return {
    payoffInMonths: months,
    totalInterestPaid,
    chartData,
  };
};