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