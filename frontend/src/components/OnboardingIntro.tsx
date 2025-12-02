import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Calculator, BarChart3, Sparkles } from 'lucide-react';

interface OnboardingIntroProps {
  onComplete: () => void;
  onLoadDemo?: () => void;
}

export const OnboardingIntro = ({ onComplete, onLoadDemo }: OnboardingIntroProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Calculator,
      title: 'What is PathLight?',
      description: 'PathLight helps you understand, model, and optimize your debt repayment strategies through simple data entry, visual payoff modeling, and AI-powered guidance.',
    },
    {
      icon: Lightbulb,
      title: 'How AI Will Help',
      description: 'Our AI coach provides context-aware explanations and guidance. It will automatically summarize your situation, suggest corrections, and explain complex financial concepts in simple terms.',
    },
    {
      icon: BarChart3,
      title: 'What You Can Do',
      description: 'Explore different payoff strategies (Avalanche, Snowball, Custom), test "What If?" scenarios, view personalized recommendations, and get a clear path out of debt.',
    },
    {
      icon: Sparkles,
      title: 'Getting Started',
      description: 'We\'ll collect some basic financial information, then you can add your debts. You\'ll see a "Do these numbers look right?" step to verify everything, and then explore your payoff options.',
    },
  ];

  const Icon = steps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-center mt-2">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={currentStep > 0 ? 'flex-1' : 'flex-1 ml-auto'}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <button
              onClick={handleSkip}
              className="hover:underline"
            >
              Skip Introduction
            </button>
            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="hover:underline text-primary"
              >
                Try Demo Data
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


