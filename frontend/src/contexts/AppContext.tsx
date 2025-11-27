import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FinancialContext, DebtTradeline } from '@/types';

interface AppContextType {
  financialContext: FinancialContext | null;
  setFinancialContext: (context: FinancialContext) => void;
  debts: DebtTradeline[];
  addDebt: (debt: Omit<DebtTradeline, 'id'>) => void;
  updateDebt: (debt: DebtTradeline) => void;
  deleteDebt: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [financialContext, setFinancialContextState] = useState<FinancialContext | null>(null);
  const [debts, setDebts] = useState<DebtTradeline[]>([]);

  const setFinancialContext = (context: FinancialContext) => {
    setFinancialContextState(context);
  };

  const addDebt = (debt: Omit<DebtTradeline, 'id'>) => {
    const newDebt = { ...debt, id: new Date().toISOString() };
    setDebts(prev => [...prev, newDebt]);
  };

  const updateDebt = (updatedDebt: DebtTradeline) => {
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  return (
    <AppContext.Provider value={{ financialContext, setFinancialContext, debts, addDebt, updateDebt, deleteDebt }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};