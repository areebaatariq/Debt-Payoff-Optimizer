import { useAppContext } from "@/contexts/AppContext";
import { OnboardingForm } from "@/components/OnboardingForm";
import Dashboard from "./Dashboard";
import { MadeWithDyad } from "@/components/made-with-dyad";

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