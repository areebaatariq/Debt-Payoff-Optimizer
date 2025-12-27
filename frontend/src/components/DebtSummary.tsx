import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['hsl(210, 70%, 50%)', 'hsl(170, 50%, 45%)', 'hsl(150, 50%, 50%)', 'hsl(200, 65%, 55%)', 'hsl(190, 60%, 50%)'];

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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${totalDebt.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Weighted Avg. APR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{weightedApr.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{utilizationRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Number of Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{numberOfAccounts}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Debt Composition</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Breakdown by debt type</p>
          </CardHeader>
          <CardContent>
            {debts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={chartData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={90} 
                    fill="#8884d8" 
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Add debts to see a breakdown.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Debt Balances</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Balance by account</p>
          </CardHeader>
          <CardContent>
            {debts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={balanceBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar 
                    dataKey="balance" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] rounded-lg bg-muted/30">
                <p className="text-muted-foreground">Add debts to see balances.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};