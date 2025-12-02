import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FinancialContext, DebtTradeline } from '@/types';
import { useFinancialContext } from '@/hooks/useFinancialContext';
import { useDebts } from '@/hooks/useDebts';

type PayoffStrategy = 'avalanche' | 'snowball' | 'custom';

interface AppContextType {
  financialContext: FinancialContext | null;
  setFinancialContext: (context: FinancialContext) => Promise<void>;
  debts: DebtTradeline[];
  aggregation: any;
  addDebt: (debt: Omit<DebtTradeline, 'id'>) => void;
  updateDebt: (debt: DebtTradeline) => void;
  deleteDebt: (id: string) => void;
  strategy: PayoffStrategy;
  setStrategy: (strategy: PayoffStrategy) => void;
  reorderDebts: (fromIndex: number, toIndex: number) => void;
  isLoading: boolean;
  isSaving: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  
  // Use API hooks
  const {
    financialContext,
    save: saveFinancialContext,
    saveAsync: saveFinancialContextAsync,
    isLoading: isLoadingFinancialContext,
    isSaving: isSavingFinancialContext,
  } = useFinancialContext();

  const {
    debts,
    aggregation,
    add: addDebtApi,
    update: updateDebtApi,
    delete: deleteDebtApi,
    isLoading: isLoadingDebts,
  } = useDebts();

  const setFinancialContext = async (context: FinancialContext) => {
    await saveFinancialContextAsync(context);
  };

  const addDebt = (debt: Omit<DebtTradeline, 'id'>) => {
    addDebtApi(debt);
  };

  const updateDebt = (updatedDebt: DebtTradeline) => {
    const { id, ...debtData } = updatedDebt;
    updateDebtApi({ id, debt: debtData });
  };

  const deleteDebt = (id: string) => {
    deleteDebtApi(id);
  };

  const reorderDebts = (fromIndex: number, toIndex: number) => {
    // For custom strategy, we need to update the order on backend
    // For now, we'll do it client-side and then sync
    // TODO: Add endpoint to update debt order
    const newDebts = [...debts];
    const [movedItem] = newDebts.splice(fromIndex, 1);
    newDebts.splice(toIndex, 0, movedItem);
    
    // Update each debt's order (if backend supports it)
    // For now, this is handled by custom strategy using the array order
  };

  return (
    <AppContext.Provider value={{ 
      financialContext, 
      setFinancialContext, 
      debts, 
      aggregation,
      addDebt, 
      updateDebt, 
      deleteDebt,
      strategy, 
      setStrategy,
      reorderDebts,
      isLoading: isLoadingFinancialContext || isLoadingDebts,
      isSaving: isSavingFinancialContext,
    }}>
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