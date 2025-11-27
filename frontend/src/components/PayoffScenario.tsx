import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calculatePayoffScenario } from '@/lib/debtCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExplainThis } from './ExplainThis';

export const PayoffScenario = () => {
  const { debts, strategy, setStrategy } = useAppContext();
  const totalMinimumPayment = useMemo(() => debts.reduce((sum, d) => sum + d.minimumPayment, 0), [debts]);

  const [monthlyPayment, setMonthlyPayment] = useState(totalMinimumPayment + 500);

  useEffect(() => {
    if (monthlyPayment < totalMinimumPayment || totalMinimumPayment === 0) {
      setMonthlyPayment(totalMinimumPayment + 500);
    }
  }, [totalMinimumPayment, monthlyPayment]);

  const scenarioResult = useMemo(() => {
    if (debts.length === 0 || monthlyPayment < totalMinimumPayment) {
      return null;
    }
    return calculatePayoffScenario(debts, monthlyPayment, strategy);
  }, [debts, monthlyPayment, strategy, totalMinimumPayment]);

  const payoffDate = useMemo(() => {
    if (!scenarioResult || scenarioResult.payoffInMonths === 0) return 'N/A';
    const date = new Date();
    date.setMonth(date.getMonth() + scenarioResult.payoffInMonths);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }, [scenarioResult]);

  const timeToFreedom = useMemo(() => {
    if (!scenarioResult || scenarioResult.payoffInMonths === 0) return 'N/A';
    const years = Math.floor(scenarioResult.payoffInMonths / 12);
    const months = scenarioResult.payoffInMonths % 12;
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) result += `${months} month${months > 1 ? 's' : ''}`;
    return result.trim() || 'Less than a month';
  }, [scenarioResult]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Payoff Plan</CardTitle>
        <CardDescription>
          Choose a strategy and set your monthly budget to see your path out of debt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">Payoff Strategy</Label>
            <div className="flex items-center">
              <Select value={strategy} onValueChange={(val) => setStrategy(val as any)}>
                <SelectTrigger id="strategy">
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avalanche">Avalanche (Highest APR first)</SelectItem>
                  <SelectItem value="snowball">Snowball (Lowest Balance first)</SelectItem>
                  <SelectItem value="custom">Custom Order</SelectItem>
                </SelectContent>
              </Select>
              <ExplainThis explanation="Choose a strategy or select 'Custom' to set your own payoff order in the table below." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-payment">Total Monthly Payment</Label>
            <Input
              id="monthly-payment"
              type="number"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Number(e.target.value))}
              min={totalMinimumPayment}
            />
            {monthlyPayment < totalMinimumPayment && (
              <p className="text-sm text-destructive">
                Must be at least your total minimum payment of ${totalMinimumPayment.toLocaleString()}.
              </p>
            )}
          </div>
        </div>

        {scenarioResult ? (
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader><CardTitle>Payoff Date</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold">{payoffDate}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total Interest Paid</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold">${scenarioResult.totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle>Time to Freedom</CardTitle></CardHeader>
                <CardContent><p className="text-xl font-bold">{timeToFreedom}</p></CardContent>
              </Card>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scenarioResult.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Please add debts and set a valid monthly payment to see your payoff plan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};