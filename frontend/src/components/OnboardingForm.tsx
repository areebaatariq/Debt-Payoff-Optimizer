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
import { showSuccess, showError } from '@/utils/toast';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';
import { useDemo } from '@/hooks/useDemo';

const formSchema = z.object({
  zipCode: z.string().optional(),
  monthlyIncome: z.coerce.number().min(0, 'Income must be a positive number.'),
  monthlyExpenses: z.coerce.number().min(0, 'Expenses must be a positive number.'),
  liquidSavings: z.coerce.number().min(0, 'Savings must be a positive number.'),
  creditScoreRange: z.enum(['poor', 'fair', 'good', 'excellent']),
  primaryGoal: z.enum(['pay_faster', 'reduce_interest', 'lower_payment', 'avoid_default']),
  timeHorizonPreference: z.coerce.number().min(0).optional(),
});

export const OnboardingForm = () => {
  const { setFinancialContext } = useAppContext();
  const { track } = useAnalytics();
  const { loadDemo, isLoading: isDemoLoading } = useDemo();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCode: '',
      monthlyIncome: 5000,
      monthlyExpenses: 3000,
      liquidSavings: 10000,
      creditScoreRange: 'good',
      primaryGoal: 'pay_faster',
      timeHorizonPreference: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      track(AnalyticsEvents.ONBOARDING_COMPLETED, { primaryGoal: values.primaryGoal });
      await setFinancialContext(values as FinancialContext);
      showSuccess('Financial information saved successfully!');
    } catch (error) {
      console.error('Failed to save financial context:', error);
      showError('Failed to save financial information. Please try again.');
    }
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
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code (Optional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="e.g., 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        <SelectItem value="lower_payment">Lower monthly payment</SelectItem>
                        <SelectItem value="avoid_default">Avoid default/collections</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeHorizonPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Horizon Preference (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 36 (months)" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <Button type="submit" className="w-full">Get Started</Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={loadDemo}
                  disabled={isDemoLoading}
                >
                  {isDemoLoading ? 'Loading...' : 'Try Demo Data Instead'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};