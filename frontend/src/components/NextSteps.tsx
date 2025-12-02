import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, Target, TrendingDown, Calendar } from 'lucide-react';
import { usePayoff } from '@/hooks/usePayoff';
import { useMemo, useRef } from 'react';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';
import jsPDF from 'jspdf';

export const NextSteps = () => {
  const { debts, aggregation, financialContext, strategy } = useAppContext();
  const { scenario } = usePayoff();
  const { track } = useAnalytics();
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    track(AnalyticsEvents.EXPORT_TRIGGERED, { format: 'pdf' });
    
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.text('PathLight Debt Payoff Summary', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Financial Overview
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Financial Overview', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.text(`Total Debt: $${aggregation?.totalDebt.toLocaleString() || 0}`, 25, yPos);
      yPos += 6;
      doc.text(`Number of Accounts: ${aggregation?.numberOfAccounts || 0}`, 25, yPos);
      yPos += 6;
      doc.text(`Average APR: ${aggregation?.averageApr.toFixed(2)}%`, 25, yPos);
      yPos += 6;
      doc.text(`Debt-to-Income Ratio: ${aggregation?.dti.toFixed(1)}%`, 25, yPos);
      yPos += 6;
      if (aggregation?.utilizationRate) {
        doc.text(`Credit Utilization: ${aggregation.utilizationRate.toFixed(1)}%`, 25, yPos);
        yPos += 6;
      }
      yPos += 5;

      // Payoff Plan
      if (scenario) {
        doc.setFontSize(14);
        doc.text('Payoff Plan', 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.text(`Strategy: ${strategy.charAt(0).toUpperCase() + strategy.slice(1)}`, 25, yPos);
        yPos += 6;
        
        const years = Math.floor(scenario.payoffInMonths / 12);
        const months = scenario.payoffInMonths % 12;
        doc.text(`Estimated Payoff Time: ${years > 0 ? `${years} year${years > 1 ? 's' : ''}, ` : ''}${months} month${months > 1 ? 's' : ''}`, 25, yPos);
        yPos += 6;
        doc.text(`Total Interest: $${scenario.totalInterestPaid.toLocaleString()}`, 25, yPos);
        yPos += 10;
      }

      // Debts
      doc.setFontSize(14);
      doc.text('Your Debts', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      debts.forEach((debt, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${debt.debtType.replace('_', ' ')} - $${debt.balance.toLocaleString()} @ ${debt.apr}% APR`, 25, yPos);
        yPos += 6;
      });
      yPos += 10;

      // Next Steps
      if (suggestedActions.length > 0) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.text('Suggested Actions', 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        suggestedActions.forEach((action, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${index + 1}. ${action.title}`, 25, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(action.description, 160);
          doc.text(lines, 30, yPos);
          yPos += lines.length * 5 + 2;
        });
      }

      // Save PDF
      doc.save('pathlight-debt-plan.pdf');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // Fallback to text export
      const content = `
PathLight Debt Payoff Summary
Generated: ${new Date().toLocaleDateString()}

Financial Overview:
- Total Debt: $${aggregation?.totalDebt.toLocaleString() || 0}
- Number of Accounts: ${aggregation?.numberOfAccounts || 0}
- Average APR: ${aggregation?.averageApr.toFixed(2)}%
- Debt-to-Income Ratio: ${aggregation?.dti.toFixed(1)}%

Payoff Plan:
- Strategy: ${strategy}
- Estimated Payoff Time: ${scenario?.payoffInMonths || 'N/A'} months
- Total Interest: $${scenario?.totalInterestPaid.toLocaleString() || 0}

Next Steps:
1. Review your payoff plan
2. Consider the recommendations provided
3. Explore "What If?" scenarios
4. Stay consistent with payments
      `;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pathlight-debt-plan.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const suggestedActions = useMemo(() => {
    const actions = [];
    
    if (!financialContext) {
      actions.push({
        icon: Target,
        title: 'Complete Your Profile',
        description: 'Fill out your financial information to get personalized recommendations',
      });
    }

    if (debts.length === 0) {
      actions.push({
        icon: Target,
        title: 'Add Your Debts',
        description: 'Start by adding all your debts to see your complete financial picture',
      });
      return actions;
    }

    if (aggregation?.dti && aggregation.dti > 40) {
      actions.push({
        icon: TrendingDown,
        title: 'High Debt-to-Income Ratio',
        description: `Your DTI is ${aggregation.dti.toFixed(1)}%. Consider ways to reduce monthly payments or increase income.`,
      });
    }

    if (aggregation?.utilizationRate && aggregation.utilizationRate > 30) {
      actions.push({
        icon: TrendingDown,
        title: 'High Credit Utilization',
        description: `Your utilization is ${aggregation.utilizationRate.toFixed(1)}%. Paying down credit cards can help your credit score.`,
      });
    }

    if (scenario?.payoffInMonths && scenario.payoffInMonths > 60) {
      actions.push({
        icon: Calendar,
        title: 'Long Payoff Timeline',
        description: `Your current plan takes ${Math.floor(scenario.payoffInMonths / 12)} years. Consider increasing monthly payments or exploring consolidation.`,
      });
    }

    actions.push({
      icon: CheckCircle2,
      title: 'Stay Consistent',
      description: 'Stick to your payment plan and track your progress monthly',
    });

    return actions;
  }, [debts.length, aggregation, financialContext, scenario]);

  if (debts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Next Steps</CardTitle>
            <CardDescription>
              A summary of your payoff plan and suggested actions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" ref={contentRef}>
        {scenario && (
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Strategy</p>
                  <p className="text-lg font-semibold capitalize">{strategy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payoff Time</p>
                  <p className="text-lg font-semibold">
                    {Math.floor(scenario.payoffInMonths / 12)} years, {scenario.payoffInMonths % 12} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-semibold">
                    ${scenario.totalInterestPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <p className="font-medium">Suggested Actions:</p>
          {suggestedActions.map((action, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <action.icon className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          ))}
        </div>

        {financialContext?.primaryGoal && (
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-2">Your Primary Goal:</p>
              <p className="text-sm text-muted-foreground capitalize">
                {financialContext.primaryGoal.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Your payoff plan is optimized for this goal. Review your strategy if priorities change.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

