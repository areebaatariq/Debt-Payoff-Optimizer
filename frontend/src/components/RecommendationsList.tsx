import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { useAIGuidance } from '@/hooks/useAIGuidance';

const FIT_SCORE_COLORS = {
  high: 'bg-green-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-500',
};

const FIT_SCORE_LABELS = {
  high: 'High Match',
  medium: 'Medium Match',
  low: 'Low Match',
};

export const RecommendationsList = () => {
  const { recommendations, isLoading, error } = useRecommendations();
  const [showAIGuidance, setShowAIGuidance] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const { getGuidanceAsync } = useAIGuidance();

  // Auto-trigger AI guidance when recommendations are viewed
  useEffect(() => {
    if (recommendations.length > 0 && !showAIGuidance) {
      getGuidanceAsync({
        action: `I'm looking at ${recommendations.length} recommendation${recommendations.length > 1 ? 's' : ''}. Can you help me understand the trade-offs between these options?`,
      }).then((result) => {
        setAiGuidance(result.guidance);
        setShowAIGuidance(true);
      });
    }
  }, [recommendations.length, showAIGuidance, getGuidanceAsync]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load recommendations. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Personalized recommendations based on your debt profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Add more debts to get personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <CardDescription>
          Personalized recommendations based on your debt profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAIGuidance && aiGuidance && (
          <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium mb-1">💡 AI Analysis</p>
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
        {recommendations.map((rec, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{rec.description}</CardTitle>
                  <Badge 
                    className={`mt-2 ${FIT_SCORE_COLORS[rec.fitScore]}`}
                    variant="secondary"
                  >
                    {FIT_SCORE_LABELS[rec.fitScore]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Savings</p>
                    <p className="font-semibold text-green-600">
                      ${rec.estimatedSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">New Monthly Payment</p>
                    <p className="font-semibold">
                      ${rec.newMonthlyPayment.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {rec.type === 'consolidate' && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Debts included: {rec.debtIds.length} account{rec.debtIds.length > 1 ? 's' : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // Track recommendation exploration
                    }}
                  >
                    Explore This Option
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

