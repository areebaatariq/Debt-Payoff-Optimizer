import { DebtList } from "@/components/DebtList";
import { DebtSummary } from "@/components/DebtSummary";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Debt Dashboard</h1>
        <p className="text-muted-foreground">
          Here's a snapshot of your current debt situation. Add all your debts to get started.
        </p>
      </div>
      <DebtSummary />
      <DebtList />
    </div>
  );
};

export default Dashboard;