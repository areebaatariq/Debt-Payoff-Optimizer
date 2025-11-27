import { useAppContext } from "@/contexts/AppContext";
import { OnboardingForm } from "@/components/OnboardingForm";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Dashboard = () => {
  // Placeholder for the main dashboard content
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Your Debt Dashboard</h1>
      <p className="text-muted-foreground">
        This is where your debt summary, tradeline management, and payoff scenarios will appear.
      </p>
    </div>
  );
};

const Index = () => {
  const { financialContext } = useAppContext();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="py-8">
        {financialContext ? <Dashboard /> : <OnboardingForm />}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;