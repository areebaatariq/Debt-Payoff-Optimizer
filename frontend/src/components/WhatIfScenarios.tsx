import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/AppContext';
import { usePayoff } from '@/hooks/usePayoff';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, ArrowRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export const WhatIfScenarios = () => {
  const { debts, aggregation, financialContext } = useAppContext();
  const { simulateAsync, isSimulating } = usePayoff();
  const [currentPayment, setCurrentPayment] = useState(aggregation?.totalMinimumPayment || 0);
  const [scenarioResults, setScenarioResults] = useState<Record<string, any>>({});
  const [selectedDebts, setSelectedDebts] = useState<string[]>([]);
  const [consolidationApr, setConsolidationApr] = useState(18);
  const [settlementRate, setSettlementRate] = useState(50); // 50% settlement
  const [transferPromoApr, setTransferPromoApr] = useState(3); // Default promo APR
  const [transferFeePercentage, setTransferFeePercentage] = useState(3); // Default 3% fee
  const [transferPromoMonths, setTransferPromoMonths] = useState(18); // Default 18 months

  const totalMinimumPayment = aggregation?.totalMinimumPayment || 0;

  const runPayMoreScenario = async (extraAmount: number) => {
    const newPayment = totalMinimumPayment + extraAmount;
    try {
      const result = await simulateAsync({
        strategy: 'avalanche',
        monthlyPayment: newPayment,
      });
      setScenarioResults(prev => ({
        ...prev,
        [`paymore_${extraAmount}`]: {
          ...result.scenario,
          extraPayment: extraAmount,
          newMonthlyPayment: newPayment,
        },
      }));
    } catch (error) {
      console.error('Failed to simulate:', error);
    }
  };

  const runConsolidationScenario = async () => {
    if (selectedDebts.length < 2) return;
    
    // Calculate consolidated debt
    const selectedDebtObjects = debts.filter(d => selectedDebts.includes(d.id));
    const totalBalance = selectedDebtObjects.reduce((sum, d) => sum + d.balance, 0);
    const newPayment = totalBalance * 0.02; // 2% of balance
    
    // Create mock debt for consolidation
    const consolidatedDebts = [
      ...debts.filter(d => !selectedDebts.includes(d.id)),
      {
        id: 'consolidated',
        debtType: 'personal_loan' as const,
        balance: totalBalance,
        apr: consolidationApr,
        minimumPayment: newPayment,
      },
    ];

    // For now, we'll calculate estimated savings
    const currentTotalPayment = selectedDebtObjects.reduce((sum, d) => sum + d.minimumPayment, 0);
    const currentMonthlyInterest = selectedDebtObjects.reduce(
      (sum, d) => sum + (d.balance * (d.apr / 100)) / 12,
      0
    );
    const newMonthlyInterest = (totalBalance * (consolidationApr / 100)) / 12;
    const monthlySavings = currentMonthlyInterest - newMonthlyInterest;
    const estimatedSavings = monthlySavings * 36; // Over 3 years

    setScenarioResults(prev => ({
      ...prev,
      consolidation: {
        payoffInMonths: 0, // Would need full calculation
        totalInterestPaid: 0,
        estimatedSavings,
        newMonthlyPayment,
        currentTotalPayment,
      },
    }));
  };

  const runSettlementScenario = async () => {
    if (selectedDebts.length === 0) return;
    
    const selectedDebtObjects = debts.filter(d => selectedDebts.includes(d.id));
    const totalBalance = selectedDebtObjects.reduce((sum, d) => sum + d.balance, 0);
    const settlementAmount = totalBalance * (settlementRate / 100);
    const savings = totalBalance - settlementAmount;

    setScenarioResults(prev => ({
      ...prev,
      settlement: {
        originalBalance: totalBalance,
        settlementAmount,
        savings,
        payoffInMonths: 12, // Assume 12 months to pay settlement
      },
    }));
  };

  const runBalanceTransferScenario = async () => {
    if (selectedDebts.length === 0) return;
    
    // Filter for credit cards only
    const selectedDebtObjects = debts.filter(
      d => selectedDebts.includes(d.id) && d.debtType === 'credit_card'
    );
    
    if (selectedDebtObjects.length === 0) {
      alert('Please select credit card debts for balance transfer');
      return;
    }

    const totalBalance = selectedDebtObjects.reduce((sum, d) => sum + d.balance, 0);
    const transferFee = totalBalance * (transferFeePercentage / 100);
    const transferAmount = totalBalance + transferFee;
    
    // Calculate current monthly interest
    const currentMonthlyInterest = selectedDebtObjects.reduce(
      (sum, d) => sum + (d.balance * (d.apr / 100)) / 12,
      0
    );
    
    // Calculate interest during promo period (low promo APR)
    const promoMonthlyInterest = (transferAmount * (transferPromoApr / 100)) / 12;
    
    // Calculate savings during promo period
    const monthlySavingsDuringPromo = currentMonthlyInterest - promoMonthlyInterest;
    const totalSavingsDuringPromo = monthlySavingsDuringPromo * transferPromoMonths;
    
    // Net savings (savings minus transfer fee)
    const netSavings = totalSavingsDuringPromo - transferFee;
    
    // Calculate what happens after promo period (assuming standard 22% APR)
    const postPromoApr = 22;
    const postPromoMonthlyInterest = (transferAmount * (postPromoApr / 100)) / 12;
    
    // Estimate payoff time with current payment strategy
    const currentTotalPayment = selectedDebtObjects.reduce((sum, d) => sum + d.minimumPayment, 0);
    const estimatedNewPayment = transferAmount * 0.02; // 2% of balance
    
    // Run actual payoff simulation for current scenario
    try {
      const currentResult = await simulateAsync({
        strategy: 'avalanche',
        monthlyPayment: totalMinimumPayment,
      });

      // Estimate payoff with balance transfer (simplified)
      // This is a rough estimate - would need more complex calculation for accuracy
      const estimatedPayoffMonths = Math.ceil(transferAmount / estimatedNewPayment);

      setScenarioResults(prev => ({
        ...prev,
        balanceTransfer: {
          originalBalance: totalBalance,
          transferAmount: transferAmount,
          transferFee,
          promoApr: transferPromoApr,
          promoMonths: transferPromoMonths,
          monthlySavingsDuringPromo,
          totalSavingsDuringPromo,
          netSavings: Math.max(0, netSavings),
          postPromoApr,
          estimatedNewPayment,
          estimatedPayoffMonths,
          currentPayoffMonths: currentResult.scenario.payoffInMonths,
          timeSaved: currentResult.scenario.payoffInMonths - estimatedPayoffMonths,
        },
      }));
    } catch (error) {
      console.error('Failed to simulate balance transfer:', error);
    }
  };

  const toggleDebtSelection = (debtId: string) => {
    setSelectedDebts(prev =>
      prev.includes(debtId)
        ? prev.filter(id => id !== debtId)
        : [...prev, debtId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What If? Scenarios</CardTitle>
        <CardDescription>
          Explore different strategies and see how they impact your payoff plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paymore" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="paymore">Pay More</TabsTrigger>
            <TabsTrigger value="consolidate">Consolidate</TabsTrigger>
            <TabsTrigger value="settle">Settle</TabsTrigger>
            <TabsTrigger value="transfer">Balance Transfer</TabsTrigger>
          </TabsList>

          <TabsContent value="paymore" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Extra Monthly Payment</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="e.g., 200"
                  onChange={(e) => {
                    const amount = Number(e.target.value);
                    if (amount > 0) {
                      runPayMoreScenario(amount);
                    }
                  }}
                />
                <Button onClick={() => {
                  const amounts = [100, 200, 500, 1000];
                  amounts.forEach(amt => runPayMoreScenario(amt));
                }}>
                  Quick Test
                </Button>
              </div>
            </div>
            {Object.entries(scenarioResults)
              .filter(([key]) => key.startsWith('paymore_'))
              .map(([key, result]) => (
                <Card key={key} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Pay ${result.extraPayment} more/month</p>
                        <p className="text-sm text-muted-foreground">
                          Payoff in {result.payoffInMonths} months
                        </p>
                      </div>
                      <Badge variant="outline">
                        Save ${(scenarioResults['base']?.totalInterestPaid - result.totalInterestPaid).toLocaleString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="consolidate" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Select Debts to Consolidate</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border p-3 rounded">
                  {debts.map(debt => (
                    <div key={debt.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedDebts.includes(debt.id)}
                        onCheckedChange={() => toggleDebtSelection(debt.id)}
                      />
                      <label className="text-sm">
                        {debt.debtType} - ${debt.balance.toLocaleString()} @ {debt.apr}% APR
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estimated Consolidation APR (%)</Label>
                <Input
                  type="number"
                  value={consolidationApr}
                  onChange={(e) => setConsolidationApr(Number(e.target.value))}
                />
              </div>
              <Button
                onClick={runConsolidationScenario}
                disabled={selectedDebts.length < 2}
              >
                Calculate Consolidation
              </Button>
              {scenarioResults.consolidation && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">Consolidation Scenario</p>
                    <div className="space-y-1 text-sm">
                      <p>Est. Savings: <span className="font-semibold">${scenarioResults.consolidation.estimatedSavings.toLocaleString()}</span></p>
                      <p>New Monthly Payment: <span className="font-semibold">${scenarioResults.consolidation.newMonthlyPayment.toLocaleString()}</span></p>
                      <p className="text-muted-foreground">
                        Current: ${scenarioResults.consolidation.currentTotalPayment.toLocaleString()}/month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settle" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Select Debts for Settlement</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border p-3 rounded">
                  {debts.map(debt => (
                    <div key={debt.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedDebts.includes(debt.id)}
                        onCheckedChange={() => toggleDebtSelection(debt.id)}
                      />
                      <label className="text-sm">
                        {debt.debtType} - ${debt.balance.toLocaleString()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Settlement Rate (%)</Label>
                <Input
                  type="number"
                  value={settlementRate}
                  onChange={(e) => setSettlementRate(Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of original balance to settle for
                </p>
              </div>
              <Button
                onClick={runSettlementScenario}
                disabled={selectedDebts.length === 0}
              >
                Calculate Settlement
              </Button>
              {scenarioResults.settlement && (
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-2">Settlement Scenario</p>
                    <div className="space-y-1 text-sm">
                      <p>Original Balance: <span className="font-semibold">${scenarioResults.settlement.originalBalance.toLocaleString()}</span></p>
                      <p>Settlement Amount: <span className="font-semibold">${scenarioResults.settlement.settlementAmount.toLocaleString()}</span></p>
                      <p className="text-green-600">Savings: <span className="font-semibold">${scenarioResults.settlement.savings.toLocaleString()}</span></p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Select Credit Card Debts to Transfer</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border p-3 rounded">
                  {debts
                    .filter(d => d.debtType === 'credit_card')
                    .map(debt => (
                      <div key={debt.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedDebts.includes(debt.id)}
                          onCheckedChange={() => toggleDebtSelection(debt.id)}
                        />
                        <label className="text-sm">
                          {debt.debtType.replace('_', ' ')} - ${debt.balance.toLocaleString()} @ {debt.apr}% APR
                        </label>
                      </div>
                    ))}
                  {debts.filter(d => d.debtType === 'credit_card').length === 0 && (
                    <p className="text-sm text-muted-foreground">No credit card debts found.</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Promo APR (%)</Label>
                  <Input
                    type="number"
                    value={transferPromoApr}
                    onChange={(e) => setTransferPromoApr(Number(e.target.value))}
                    min={0}
                    max={5}
                  />
                  <p className="text-xs text-muted-foreground">Typical: 0-5%</p>
                </div>
                <div className="space-y-2">
                  <Label>Transfer Fee (%)</Label>
                  <Input
                    type="number"
                    value={transferFeePercentage}
                    onChange={(e) => setTransferFeePercentage(Number(e.target.value))}
                    min={0}
                    max={10}
                    step={0.5}
                  />
                  <p className="text-xs text-muted-foreground">Typical: 3-5%</p>
                </div>
                <div className="space-y-2">
                  <Label>Promo Period (months)</Label>
                  <Input
                    type="number"
                    value={transferPromoMonths}
                    onChange={(e) => setTransferPromoMonths(Number(e.target.value))}
                    min={6}
                    max={24}
                  />
                  <p className="text-xs text-muted-foreground">Typical: 12-18 months</p>
                </div>
              </div>

              <Button
                onClick={runBalanceTransferScenario}
                disabled={selectedDebts.filter(id => debts.find(d => d.id === id)?.debtType === 'credit_card').length === 0}
              >
                Calculate Balance Transfer
              </Button>

              {scenarioResults.balanceTransfer && (
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="font-semibold mb-3">Balance Transfer Scenario</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Original Balance</p>
                          <p className="text-lg font-semibold">${scenarioResults.balanceTransfer.originalBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Transfer Fee ({transferFeePercentage}%)</p>
                          <p className="text-lg font-semibold">${scenarioResults.balanceTransfer.transferFee.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Savings During Promo:</span>
                          <span className="text-sm font-semibold text-green-600">
                            ${scenarioResults.balanceTransfer.monthlySavingsDuringPromo.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Savings ({transferPromoMonths} months):</span>
                          <span className="text-sm font-semibold text-green-600">
                            ${scenarioResults.balanceTransfer.totalSavingsDuringPromo.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-medium">Net Savings (after fee):</span>
                          <span className="text-sm font-bold text-green-600">
                            ${scenarioResults.balanceTransfer.netSavings.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Important Notes:</p>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                          <li>Promo APR ({transferPromoApr}%) applies for {transferPromoMonths} months</li>
                          <li>After promo, standard APR (~{scenarioResults.balanceTransfer.postPromoApr}%) applies</li>
                          <li>Pay off during promo period to maximize savings</li>
                          <li>Transfer fee is added to the balance immediately</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

