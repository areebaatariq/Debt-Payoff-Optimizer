import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
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
  const { debts, deleteDebt, strategy, reorderDebts } = useAppContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Debts</CardTitle>
          {strategy === 'custom' && <p className="text-sm text-muted-foreground">Use the arrows to set your payoff priority (top to bottom).</p>}
        </div>
        <div className="flex items-center space-x-2">
          <CSVUploadDialog 
            trigger={
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
            } 
          />
          <AddEditDebtDialog trigger={<Button size="sm">Add New Debt</Button>} />
        </div>
      </CardHeader>
      <CardContent>
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
                        onConfirm={() => deleteDebt(debt.id)}
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