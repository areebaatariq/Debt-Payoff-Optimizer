import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAIContextTrigger } from '@/hooks/useAIContextTrigger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIGuidance } from '@/hooks/useAIGuidance';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddEditDebtDialog } from './AddEditDebtDialog';
import { Pencil, Trash2, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { CSVUploadDialog } from './CSVUploadDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

const DEBT_TYPE_MAP: { [key: string]: string } = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  student_loan: 'Student Loan',
  auto_loan: 'Auto Loan',
  other: 'Other',
};

export const DebtList = () => {
  const { debts, deleteDebt, strategy, reorderDebts, aggregation } = useAppContext();
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [debtsCount, setDebtsCount] = useState(debts.length);
  const { getGuidanceAsync } = useAIGuidance();
  const { track } = useAnalytics();

  // Auto-trigger AI summary when debts are added
  useEffect(() => {
    if (debts.length > debtsCount && debts.length > 0) {
      // Debts were added
      const totalDebt = aggregation?.totalDebt || 0;
      const avgApr = aggregation?.averageApr || 0;
      
      getGuidanceAsync({
        action: `I just added ${debts.length} debt${debts.length > 1 ? 's' : ''}. My total debt is $${totalDebt.toLocaleString()} with an average APR of ${avgApr.toFixed(2)}%. Can you give me a brief summary of my situation?`,
      }).then((result) => {
        setAiSummary(result.guidance);
        setShowAISummary(true);
      });
      
      setDebtsCount(debts.length);
    }
  }, [debts.length, debtsCount, aggregation, getGuidanceAsync]);

  // Check for inconsistent data
  useEffect(() => {
    const checkInconsistencies = () => {
      const issues: string[] = [];
      
      debts.forEach(debt => {
        const expectedMin = debt.balance * 0.02;
        if (debt.minimumPayment < expectedMin * 0.5 && debt.minimumPayment > 0) {
          issues.push(`The minimum payment for your ${debt.debtType} seems unusually low.`);
        }
      });

      if (issues.length > 0) {
        getGuidanceAsync({
          action: `I notice: ${issues[0]} Should I double-check this?`,
        }).then((result) => {
          if (!showAISummary) {
            setAiSummary(result.guidance);
            setShowAISummary(true);
          }
        });
      }
    };

    if (debts.length > 0) {
      const timeoutId = setTimeout(checkInconsistencies, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [debts, getGuidanceAsync, showAISummary]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle>Your Debts</CardTitle>
          {strategy === 'custom' && (
            <p className="text-sm text-muted-foreground mt-1">
              Use the arrows to set your payoff priority (top to bottom).
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CSVUploadDialog 
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            } 
          />
          <AddEditDebtDialog trigger={<Button size="sm" className="gap-2">Add New Debt</Button>} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAISummary && aiSummary && (
          <Alert className="border-primary/20 bg-primary/5 rounded-lg">
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-2">
                    <span className="text-lg">💡</span> AI Insight
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{aiSummary}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAISummary(false)}
                  className="h-6 w-6 rounded-full hover:bg-primary/10"
                >
                  ×
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {strategy === 'custom' && <TableHead>Priority</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">APR</TableHead>
              <TableHead className="text-right">Min. Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={strategy === 'custom' ? 6 : 5} className="text-center">
                  You haven't added any debts yet.
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt, index) => (
                <TableRow key={debt.id}>
                  {strategy === 'custom' && <TableCell>{index + 1}</TableCell>}
                  <TableCell>{DEBT_TYPE_MAP[debt.debtType]}</TableCell>
                  <TableCell className="text-right">${debt.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{debt.apr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">${debt.minimumPayment.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {strategy === 'custom' && (
                        <>
                          <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => reorderDebts(index, index - 1)}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={index === debts.length - 1} onClick={() => reorderDebts(index, index + 1)}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <AddEditDebtDialog
                        debt={debt}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteConfirmationDialog
                        onConfirm={() => {
                          track(AnalyticsEvents.DEBT_DELETED, { debtType: debt.debtType });
                          deleteDebt(debt.id);
                        }}
                        trigger={
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};