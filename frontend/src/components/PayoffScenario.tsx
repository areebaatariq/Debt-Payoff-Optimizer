import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { usePayoff } from '@/hooks/usePayoff';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ExplainThis } from './ExplainThis';
import { CalibrationDialog } from './CalibrationDialog';
import { useAIGuidance } from '@/hooks/useAIGuidance';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';

export const PayoffScenario = () => {
  const { debts, strategy, setStrategy, aggregation } = useAppContext();
  const { simulateAsync, scenario, isSimulating } = usePayoff();
  const totalMinimumPayment = aggregation?.totalMinimumPayment || useMemo(() => debts.reduce((sum, d) => sum + d.minimumPayment, 0), [debts]);

  const [monthlyPayment, setMonthlyPayment] = useState(totalMinimumPayment + 500);
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [hasSeenFirstResult, setHasSeenFirstResult] = useState(false);
  const [showAIGuidance, setShowAIGuidance] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [comparisonScenarios, setComparisonScenarios] = useState<any[]>([]);
  const { getGuidanceAsync } = useAIGuidance();
  const { track } = useAnalytics();

  const generateComparisonScenarios = async (currentInterest: number, currentPayment: number) => {
    if (!aggregation || debts.length === 0) return;
    
    const scenarios = [
      { name: 'Current', payment: currentPayment, interest: currentInterest },
      { name: '-$50/mo', payment: Math.max(totalMinimumPayment, currentPayment - 50), interest: 0 },
      { name: '+$50/mo', payment: currentPayment + 50, interest: 0 },
      { name: '+$100/mo', payment: currentPayment + 100, interest: 0 },
      { name: '+$200/mo', payment: currentPayment + 200, interest: 0 },
    ];

    // Calculate interest for alternative payment scenarios
    const calculatedScenarios = await Promise.all(
      scenarios.map(async (scenario) => {
        if (scenario.interest > 0) {
          // Current scenario - calculate savings as 0
          return {
            ...scenario,
            savings: 0,
          };
        }
        
        try {
          const result = await simulateAsync({
            strategy,
            monthlyPayment: scenario.payment,
          });
          return {
            ...scenario,
            interest: result.scenario.totalInterestPaid,
            savings: currentInterest - result.scenario.totalInterestPaid,
          };
        } catch {
          return scenario;
        }
      })
    );

    setComparisonScenarios(calculatedScenarios);
  };

  useEffect(() => {
    if (monthlyPayment < totalMinimumPayment || totalMinimumPayment === 0) {
      setMonthlyPayment(totalMinimumPayment + 500);
    }
  }, [totalMinimumPayment, monthlyPayment]);

  useEffect(() => {
    const fetchScenario = async () => {
      if (debts.length === 0 || monthlyPayment < totalMinimumPayment) {
        setScenarioResult(null);
        return;
      }
      try {
        const result = await simulateAsync({ strategy, monthlyPayment });
        setScenarioResult(result.scenario);
        
        // Show calibration dialog on first successful result
        if (!hasSeenFirstResult && result.scenario) {
          setHasSeenFirstResult(true);
          setTimeout(() => setShowCalibration(true), 500);
        }

        // Auto-trigger AI guidance explaining the scenario
        if (result.scenario && !showAIGuidance) {
          getGuidanceAsync({
            scenario: {
              strategy,
              monthlyPayment,
              payoffMonths: result.scenario.payoffInMonths,
            },
          }).then((aiResult) => {
            setAiGuidance(aiResult.guidance);
            setShowAIGuidance(true);
          });
        }

        // Generate comparison scenarios for interest savings chart
        if (result.scenario) {
          generateComparisonScenarios(result.scenario.totalInterestPaid, monthlyPayment);
        }
      } catch (error) {
        console.error('Failed to simulate payoff:', error);
        setScenarioResult(null);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      fetchScenario();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [debts.length, monthlyPayment, strategy, totalMinimumPayment, simulateAsync]);

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
              <Select value={strategy} onValueChange={(val) => {
                track(AnalyticsEvents.STRATEGY_CHANGED, { strategy: val });
                setStrategy(val as any);
              }}>
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
            {showAIGuidance && aiGuidance && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-1">💡 AI Explanation</p>
                      <p className="text-sm">{aiGuidance}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAIGuidance(false)}
                      className="ml-2"
                    >
                      ×
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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

            {/* Interest Savings Comparison Chart */}
            {comparisonScenarios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interest Savings by Payment Amount</CardTitle>
                  <CardDescription>
                    See how adjusting your monthly payment affects total interest paid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonScenarios.filter(s => s.interest !== undefined && s.interest > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'savings') {
                            return value > 0 ? `Save $${value.toLocaleString()}` : `$${Math.abs(value).toLocaleString()} more`;
                          }
                          return `$${value.toLocaleString()}`;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="interest" 
                        fill="#ef4444"
                        name="Total Interest Paid"
                      />
                      <Bar 
                        dataKey="savings" 
                        fill="#22c55e"
                        name="Savings vs Current"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        ) : isSimulating ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Calculating your payoff plan...</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Please add debts and set a valid monthly payment to see your payoff plan.</p>
          </div>
        )}
      </CardContent>

      {scenarioResult && (
        <CalibrationDialog
          open={showCalibration}
          onOpenChange={setShowCalibration}
          scenario={{
            payoffInMonths: scenarioResult.payoffInMonths,
            totalInterestPaid: scenarioResult.totalInterestPaid,
            payoffDate: payoffDate,
          }}
        />
      )}
    </Card>
  );
};