import { DebtTradeline, FinancialContext } from '../types';
import { calculateDebtAggregation, calculateTotalDebt } from './debtCalculations';

interface GuidanceContext {
  action?: string;
  debts: DebtTradeline[];
  financialContext: FinancialContext | null;
  scenario?: {
    strategy: string;
    monthlyPayment: number;
    payoffMonths: number;
  };
}

export const generateAIGuidance = async (
  context: GuidanceContext,
  geminiApiKey?: string,
  geminiUrl?: string
): Promise<string> => {
  const { action, debts, financialContext, scenario } = context;

  // If no Gemini API key, use rule-based guidance
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    return generateRuleBasedGuidance(context);
  }

  try {
    const aggregation = calculateDebtAggregation(
      debts,
      financialContext?.monthlyIncome || 0
    );

    const systemInstruction = `You are a helpful financial assistant for PathLight, a debt management tool. 
Your role is to EXPLAIN financial concepts clearly and simply, not to give financial advice.
Keep explanations friendly, empathetic, and easy to understand. Use simple language.
If something seems unusual, gently point it out.`;

    const userPrompt = buildPrompt(context, aggregation);
    const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;

    // Use the provided Gemini URL or default, append API key as query parameter
    const baseUrl = geminiUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const apiUrl = `${baseUrl}?key=${geminiApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      return generatedText.trim();
    }

    return generateRuleBasedGuidance(context);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateRuleBasedGuidance(context);
  }
};

const buildPrompt = (context: GuidanceContext, aggregation: any): string => {
  const { action, debts, financialContext, scenario } = context;

  let prompt = `User's financial situation:
- Total debt: $${aggregation.totalDebt.toLocaleString()}
- Average APR: ${aggregation.averageApr.toFixed(2)}%
- DTI: ${aggregation.dti.toFixed(1)}%
- Number of debts: ${debts.length}`;

  if (financialContext) {
    prompt += `
- Monthly income: $${financialContext.monthlyIncome.toLocaleString()}
- Monthly expenses: $${financialContext.monthlyExpenses.toLocaleString()}
- Credit score: ${financialContext.creditScoreRange}
- Primary goal: ${financialContext.primaryGoal === 'pay_faster' ? 'Pay off faster' : 'Reduce interest'}`;
  }

  if (scenario) {
    prompt += `

User is viewing a payoff scenario:
- Strategy: ${scenario.strategy}
- Monthly payment: $${scenario.monthlyPayment.toLocaleString()}
- Payoff time: ${scenario.payoffMonths} months`;
  }

  if (action) {
    prompt += `\n\nUser wants to understand: ${action}`;
  } else {
    prompt += `\n\nProvide a brief, friendly explanation of their current situation and what they can do.`;
  }

  return prompt;
};

const generateRuleBasedGuidance = (context: GuidanceContext): string => {
  const { action, debts, financialContext, scenario } = context;
  const aggregation = calculateDebtAggregation(
    debts,
    financialContext?.monthlyIncome || 0
  );

  if (action) {
    // Specific action-based guidance
    if (action.toLowerCase().includes('snowball')) {
      return `The Snowball method focuses on paying off your smallest debts first, regardless of interest rate. 
This can give you quick wins and psychological motivation as you see debts disappear. 
However, you might pay more in interest overall compared to the Avalanche method.`;
    }
    
    if (action.toLowerCase().includes('avalanche')) {
      return `The Avalanche method focuses on paying off debts with the highest interest rates first. 
This typically saves you the most money in interest over time, but it may take longer to see your first debt paid off. 
It's mathematically the most efficient strategy.`;
    }
    
    if (action.toLowerCase().includes('dti') || action.toLowerCase().includes('debt-to-income')) {
      return `Your Debt-to-Income (DTI) ratio of ${aggregation.dti.toFixed(1)}% shows how much of your monthly income goes toward minimum debt payments. 
A DTI below 36% is generally considered manageable. 
If yours is higher, focusing on paying down debt can help improve your financial flexibility.`;
    }
  }

  // General guidance based on situation
  if (debts.length === 0) {
    return `Great start! Add your debts to see a complete picture of your financial situation. 
Once you've added them, we'll help you calculate the best payoff strategy.`;
  }

  if (aggregation.dti > 40) {
    return `Your Debt-to-Income ratio is ${aggregation.dti.toFixed(1)}%, which is on the higher side. 
This means a significant portion of your income goes to debt payments. 
Consider strategies to either increase your income or reduce your debt payments.`;
  }

  if (aggregation.averageApr > 20) {
    return `Your average interest rate is ${aggregation.averageApr.toFixed(2)}%, which is quite high. 
High-interest debt grows quickly, so focusing on paying it off faster can save you a lot of money. 
The Avalanche method (paying highest APR first) might be particularly beneficial for you.`;
  }

  if (scenario) {
    const years = Math.floor(scenario.payoffMonths / 12);
    const months = scenario.payoffMonths % 12;
    
    return `With your ${scenario.strategy} strategy and $${scenario.monthlyPayment.toLocaleString()} monthly payment, 
you'll be debt-free in about ${years > 0 ? `${years} year${years > 1 ? 's' : ''} ` : ''}${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}. 
Stay consistent with your payments, and you'll reach your goal!`;
  }

  return `You have ${debts.length} debt${debts.length > 1 ? 's' : ''} totaling $${aggregation.totalDebt.toLocaleString()}. 
Explore different payoff strategies to see which one works best for your situation and goals.`;
};

