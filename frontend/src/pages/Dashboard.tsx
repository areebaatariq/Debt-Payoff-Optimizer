import { DebtList } from "@/components/DebtList";
import { DebtSummary } from "@/components/DebtSummary";
import { PayoffScenario } from "@/components/PayoffScenario";
import { RecommendationsList } from "@/components/RecommendationsList";
import { WhatIfScenarios } from "@/components/WhatIfScenarios";
import { NextSteps } from "@/components/NextSteps";
import { ScenarioComparison } from "@/components/ScenarioComparison";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Debt Dashboard
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Here's a snapshot of your current debt situation. Add all your debts to get started.
          </p>
        </div>
        <DebtSummary />
        <DebtList />
        <PayoffScenario />
        <ScenarioComparison />
        <WhatIfScenarios />
        <RecommendationsList />
        <NextSteps />
      </div>
    </div>
  );
};

export default Dashboard;