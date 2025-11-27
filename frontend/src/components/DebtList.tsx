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
import { Pencil, Trash2 } from 'lucide-react';

const DEBT_TYPE_MAP: { [key: string]: string } = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  student_loan: 'Student Loan',
  auto_loan: 'Auto Loan',
  other: 'Other',
};

export const DebtList = () => {
  const { debts, deleteDebt } = useAppContext();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Debts</CardTitle>
        <AddEditDebtDialog trigger={<Button>Add New Debt</Button>} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={5} className="text-center">
                  You haven't added any debts yet.
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{DEBT_TYPE_MAP[debt.debtType]}</TableCell>
                  <TableCell className="text-right">${debt.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{debt.apr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">${debt.minimumPayment.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <AddEditDebtDialog
                        debt={debt}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button variant="ghost" size="icon" onClick={() => deleteDebt(debt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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