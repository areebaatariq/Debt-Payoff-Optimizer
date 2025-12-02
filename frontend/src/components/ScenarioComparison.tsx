import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { usePayoff } from '@/hooks/usePayoff';

interface Scenario {
  id: string;
  name: string;
  strategy: 'avalanche' | 'snowball' | 'custom';
  monthlyPayment: number;
  payoffInMonths?: number;
  totalInterestPaid?: number;
  estimatedSavings?: number;
}

export const ScenarioComparison = () => {
  const { aggregation, strategy } = useAppContext();
  const { simulateAsync } = usePayoff();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const compareScenarios = async () => {
    if (!aggregation) return;
    
    setIsLoading(true);
    const basePayment = aggregation.totalMinimumPayment;
    const scenariosToTest: Scenario[] = [
      {
        id: 'avalanche-base',
        name: 'Avalanche (Current Payment)',
        strategy: 'avalanche',
        monthlyPayment: basePayment,
      },
      {
        id: 'snowball-base',
        name: 'Snowball (Current Payment)',
        strategy: 'snowball',
        monthlyPayment: basePayment,
      },
      {
        id: 'avalanche-plus100',
        name: 'Avalanche (+$100/month)',
        strategy: 'avalanche',
        monthlyPayment: basePayment + 100,
      },
      {
        id: 'avalanche-plus200',
        name: 'Avalanche (+$200/month)',
        strategy: 'avalanche',
        monthlyPayment: basePayment + 200,
      },
    ];

    try {
      const results = await Promise.all(
        scenariosToTest.map(async (scenario) => {
          try {
            const result = await simulateAsync({
              strategy: scenario.strategy,
              monthlyPayment: scenario.monthlyPayment,
            });
            return {
              ...scenario,
              payoffInMonths: result.scenario.payoffInMonths,
              totalInterestPaid: result.scenario.totalInterestPaid,
            };
          } catch (error) {
            console.error(`Failed to simulate ${scenario.name}:`, error);
            return scenario;
          }
        })
      );

      // Calculate savings relative to first scenario
      const baseInterest = results[0]?.totalInterestPaid || 0;
      const scenariosWithSavings = results.map((scenario, index) => ({
        ...scenario,
        estimatedSavings: index === 0 ? 0 : baseInterest - (scenario.totalInterestPaid || 0),
      }));

      setScenarios(scenariosWithSavings);
    } catch (error) {
      console.error('Failed to compare scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = scenarios
    .filter(s => s.totalInterestPaid !== undefined)
    .map(s => ({
      name: s.name,
      'Interest Paid': s.totalInterestPaid || 0,
      'Savings': s.estimatedSavings || 0,
    }));

  const payoffChartData = scenarios
    .filter(s => s.payoffInMonths !== undefined)
    .map(s => ({
      name: s.name,
      'Months': s.payoffInMonths || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
        <CardDescription>
          Compare different payoff strategies side-by-side to see which works best for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={compareScenarios} 
          disabled={isLoading || !aggregation}
          className="w-full"
        >
          {isLoading ? 'Comparing Scenarios...' : 'Compare Strategies'}
        </Button>

        {scenarios.length > 0 && (
          <>
            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Monthly Payment</TableHead>
                    <TableHead className="text-right">Payoff Time</TableHead>
                    <TableHead className="text-right">Total Interest</TableHead>
                    <TableHead className="text-right">Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell className="text-right">
                        ${scenario.monthlyPayment.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.payoffInMonths !== undefined ? (
                          <>
                            {Math.floor(scenario.payoffInMonths / 12)}y {scenario.payoffInMonths % 12}m
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.totalInterestPaid !== undefined ? (
                          `$${scenario.totalInterestPaid.toLocaleString()}`
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.estimatedSavings !== undefined && scenario.estimatedSavings > 0 ? (
                          <Badge variant="outline" className="text-green-600">
                            ${scenario.estimatedSavings.toLocaleString()}
                          </Badge>
                        ) : scenario.estimatedSavings !== undefined && scenario.estimatedSavings < 0 ? (
                          <Badge variant="outline" className="text-red-600">
                            -${Math.abs(scenario.estimatedSavings).toLocaleString()}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Interest Savings Comparison Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interest Savings Comparison</CardTitle>
                  <CardDescription>
                    Compare total interest paid across different strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="Interest Paid" 
                        fill="#ef4444"
                        name="Total Interest Paid"
                      />
                      <Bar 
                        dataKey="Savings" 
                        fill="#22c55e"
                        name="Savings vs Base"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Payoff Time Comparison Chart */}
            {payoffChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payoff Time Comparison</CardTitle>
                  <CardDescription>
                    See how long it takes to pay off debt with each strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={payoffChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis label={{ value: 'Months', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number) => `${value} months`}
                      />
                      <Bar 
                        dataKey="Months" 
                        fill="#3b82f6"
                        name="Payoff Time (Months)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Key Insights */}
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-6">
                <p className="font-semibold mb-3">Key Insights</p>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const bestSavings = scenarios.reduce((best, current) => 
                      (current.estimatedSavings || 0) > (best.estimatedSavings || 0) ? current : best
                    );
                    const fastestPayoff = scenarios.reduce((fastest, current) => 
                      (current.payoffInMonths || 999) < (fastest.payoffInMonths || 999) ? current : fastest
                    );

                    return (
                      <>
                        {bestSavings.estimatedSavings && bestSavings.estimatedSavings > 0 && (
                          <div className="flex items-start gap-2">
                            <TrendingDown className="h-4 w-4 mt-0.5 text-green-600" />
                            <p>
                              <span className="font-medium">{bestSavings.name}</span> saves the most money: 
                              <span className="font-semibold text-green-600"> ${bestSavings.estimatedSavings.toLocaleString()}</span>
                            </p>
                          </div>
                        )}
                        {fastestPayoff.payoffInMonths && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-blue-600" />
                            <p>
                              <span className="font-medium">{fastestPayoff.name}</span> pays off fastest: 
                              <span className="font-semibold"> {Math.floor(fastestPayoff.payoffInMonths / 12)} years, {fastestPayoff.payoffInMonths % 12} months</span>
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
};


