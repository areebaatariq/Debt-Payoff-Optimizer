import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { FinancialContext } from '@/types';

const formSchema = z.object({
  monthlyIncome: z.coerce.number().min(0, 'Income must be a positive number.'),
  monthlyExpenses: z.coerce.number().min(0, 'Expenses must be a positive number.'),
  liquidSavings: z.coerce.number().min(0, 'Savings must be a positive number.'),
  creditScoreRange: z.enum(['poor', 'fair', 'good', 'excellent']),
  primaryGoal: z.enum(['pay_faster', 'reduce_interest']),
});

export const OnboardingForm = () => {
  const { setFinancialContext } = useAppContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: 5000,
      monthlyExpenses: 3000,
      liquidSavings: 10000,
      creditScoreRange: 'good',
      primaryGoal: 'pay_faster',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setFinancialContext(values as FinancialContext);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to PathLight</CardTitle>
          <CardDescription>Let's start with a snapshot of your finances to create your personalized debt payoff plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Take-Home Income</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="liquidSavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liquid Savings</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditScoreRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Score Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your credit score range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="poor">Poor (&lt;580)</SelectItem>
                        <SelectItem value="fair">Fair (580-669)</SelectItem>
                        <SelectItem value="good">Good (670-739)</SelectItem>
                        <SelectItem value="excellent">Excellent (740+)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pay_faster">Pay off debt faster</SelectItem>
                        <SelectItem value="reduce_interest">Reduce total interest paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Get Started</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};