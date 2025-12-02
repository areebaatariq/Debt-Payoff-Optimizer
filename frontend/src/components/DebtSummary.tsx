import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DEBT_TYPE_MAP: { [key: string]: string } = {
    credit_card: 'Credit Card',
    personal_loan: 'Personal Loan',
    student_loan: 'Student Loan',
    auto_loan: 'Auto Loan',
    other: 'Other',
};

export const DebtSummary = () => {
  const { debts, aggregation } = useAppContext();

  const totalDebt = useMemo(() => aggregation?.totalDebt || 0, [aggregation]);
  const weightedApr = useMemo(() => aggregation?.averageApr || 0, [aggregation]);
  const utilizationRate = useMemo(() => aggregation?.utilizationRate || 0, [aggregation]);
  const numberOfAccounts = useMemo(() => aggregation?.numberOfAccounts || debts.length, [aggregation, debts.length]);

  const chartData = useMemo(() => {
    const debtByType = debts.reduce((acc, debt) => {
      acc[debt.debtType] = (acc[debt.debtType] || 0) + debt.balance;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(debtByType).map(([key, value]) => ({
      name: DEBT_TYPE_MAP[key],
      value,
    }));
  }, [debts]);

  const balanceBarData = useMemo(() => {
    return debts.map(debt => ({
      name: DEBT_TYPE_MAP[debt.debtType] || debt.debtType,
      balance: debt.balance,
    }));
  }, [debts]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Debt</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${totalDebt.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Weighted Avg. APR</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{weightedApr.toFixed(2)}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Utilization Rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Number of Accounts</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{numberOfAccounts}</p></CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Debt Composition</CardTitle></CardHeader>
        <CardContent>
          {debts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">Add debts to see a breakdown.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Debt Balances</CardTitle></CardHeader>
        <CardContent>
          {debts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={balanceBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Bar dataKey="balance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">Add debts to see balances.</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};