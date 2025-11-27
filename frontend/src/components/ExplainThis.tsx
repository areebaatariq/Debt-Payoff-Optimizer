import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ExplainThisProps {
  explanation: React.ReactNode;
}

export const ExplainThis = ({ explanation }: ExplainThisProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{explanation}</p>
      </TooltipContent>
    </Tooltip>
  );
};