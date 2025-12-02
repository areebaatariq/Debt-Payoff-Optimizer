import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { DebtTradeline } from '@/types';
import { useState } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';

const formSchema = z.object({
  debtType: z.enum(['credit_card', 'personal_loan', 'student_loan', 'auto_loan', 'other']),
  balance: z.coerce.number().positive('Balance must be a positive number.'),
  apr: z.coerce.number().min(0, 'APR must be a positive number.').max(100, 'APR cannot exceed 100.'),
  minimumPayment: z.coerce.number().positive('Minimum payment must be a positive number.'),
  nextPaymentDate: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
});

interface AddEditDebtDialogProps {
  debt?: DebtTradeline;
  trigger: React.ReactNode;
}

export const AddEditDebtDialog = ({ debt, trigger }: AddEditDebtDialogProps) => {
  const { addDebt, updateDebt } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const { track } = useAnalytics();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      debtType: debt?.debtType || 'credit_card',
      balance: debt?.balance || 0,
      apr: debt?.apr || 0,
      minimumPayment: debt?.minimumPayment || 0,
      nextPaymentDate: debt?.nextPaymentDate || '',
      creditLimit: debt?.creditLimit || undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (debt) {
        track(AnalyticsEvents.DEBT_UPDATED, { debtType: values.debtType });
        updateDebt({ ...debt, ...values });
        showSuccess('Debt updated successfully!');
      } else {
        track(AnalyticsEvents.DEBT_ADDED, { debtType: values.debtType, balance: values.balance });
        addDebt(values);
        showSuccess('Debt added successfully!');
      }
      form.reset();
      setIsOpen(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to save debt');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{debt ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="debtType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Debt Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="personal_loan">Personal Loan</SelectItem>
                      <SelectItem value="student_loan">Student Loan</SelectItem>
                      <SelectItem value="auto_loan">Auto Loan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance ($)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>APR (%)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimumPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Monthly Payment ($)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextPaymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Payment Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('debtType') === 'credit_card' && (
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">{debt ? 'Save Changes' : 'Add Debt'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};