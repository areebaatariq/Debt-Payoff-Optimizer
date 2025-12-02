import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { CheckCircle2, XCircle, Edit } from 'lucide-react';
import { AddEditDebtDialog } from './AddEditDebtDialog';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';

interface CalibrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: {
    payoffInMonths: number;
    totalInterestPaid: number;
    payoffDate: string;
  } | null;
}

export const CalibrationDialog = ({ open, onOpenChange, scenario }: CalibrationDialogProps) => {
  const { debts, aggregation } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const { track } = useAnalytics();

  if (!scenario) return null;

  const years = Math.floor(scenario.payoffInMonths / 12);
  const months = scenario.payoffInMonths % 12;
  const timeToFreedom = `${years > 0 ? `${years} year${years > 1 ? 's' : ''} ` : ''}${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`.trim() || 'Less than a month';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Do These Numbers Look Right?</DialogTitle>
          <DialogDescription>
            Review your payoff plan. If anything seems off, you can make quick adjustments below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Payoff Date</p>
                <p className="text-xl font-bold">{scenario.payoffDate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Time to Freedom</p>
                <p className="text-xl font-bold">{timeToFreedom}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                <p className="text-xl font-bold">${scenario.totalInterestPaid.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Debt</span>
                  <span className="text-sm">${aggregation?.totalDebt.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Number of Accounts</span>
                  <span className="text-sm">{aggregation?.numberOfAccounts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average APR</span>
                  <span className="text-sm">{aggregation?.averageApr.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Quick Adjustments</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Add or Edit Debts
              </Button>
              <p className="text-xs text-muted-foreground">
                You can add missing debts or correct any incorrect information.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            track(AnalyticsEvents.CALIBRATION_EDITED);
            onOpenChange(false);
          }}>
            Something's Wrong
          </Button>
          <Button onClick={() => {
            track(AnalyticsEvents.CALIBRATION_CONFIRMED);
            onOpenChange(false);
          }}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Looks Good!
          </Button>
        </DialogFooter>

        {isEditing && (
          <AddEditDebtDialog
            trigger={<div />}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

