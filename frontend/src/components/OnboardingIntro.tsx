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
      <Card className="shadow-elevated">
        <CardHeader>
          <div className="flex items-center justify-center mb-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-soft">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription className="text-center mt-4 text-base leading-relaxed max-w-lg mx-auto">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary w-8 shadow-sm'
                    : index < currentStep
                    ? 'bg-primary/60'
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
                size="lg"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={currentStep > 0 ? 'flex-1' : 'flex-1 ml-auto'}
              size="lg"
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




