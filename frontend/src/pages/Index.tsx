import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { OnboardingForm } from "@/components/OnboardingForm";
import { OnboardingIntro } from "@/components/OnboardingIntro";
import Dashboard from "./Dashboard";
import { useDemo } from "@/hooks/useDemo";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";

const Index = () => {
  const { financialContext } = useAppContext();
  const [showIntro, setShowIntro] = useState(!sessionStorage.getItem('has_seen_intro'));
  const { loadDemo, isLoading: isDemoLoading } = useDemo();
  const { track } = useAnalytics();

  const handleIntroComplete = () => {
    sessionStorage.setItem('has_seen_intro', 'true');
    setShowIntro(false);
    track(AnalyticsEvents.ONBOARDING_STARTED);
  };

  const handleLoadDemo = async () => {
    track(AnalyticsEvents.DEMO_LOADED);
    await loadDemo();
    setShowIntro(false);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
        <main className="py-8">
          <OnboardingIntro 
            onComplete={handleIntroComplete}
            onLoadDemo={handleLoadDemo}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
      <main className="py-8">
        {financialContext ? <Dashboard /> : <OnboardingForm />}
      </main>
    </div>
  );
};

export default Index;