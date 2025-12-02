import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface RecommendationConfig {
  credit_score_ranges: {
    poor: [number, number];
    fair: [number, number];
    good: [number, number];
    excellent: [number, number];
  };
  consolidation: {
    enabled: boolean;
    min_debts: number;
    min_apr: number;
    max_total_debt: number;
    eligible_credit_scores: string[];
    debt_types: string[];
    estimated_apr: number;
    payment_percentage: number;
  };
  balance_transfer: {
    enabled: boolean;
    min_debts: number;
    min_apr: number;
    max_total_debt: number;
    eligible_credit_scores: string[];
    debt_types: string[];
    estimated_promo_apr: number;
    transfer_fee_percentage: number;
    promo_period_months: number;
  };
  settlement: {
    enabled: boolean;
    eligible_credit_scores: string[];
    min_apr: number;
    max_balance: number;
    estimated_settlement_percentage: number;
    settlement_period_months: number;
  };
  refinancing: {
    enabled: boolean;
    min_balance: number;
    min_apr: number;
    eligible_credit_scores: string[];
    excluded_debt_types: string[];
    apr_improvement_estimate: number;
    evaluation_period_months: number;
  };
  fit_score_thresholds: {
    high: {
      savings_min: number;
      credit_score_requirement?: string;
    };
    medium: {
      savings_min: number;
    };
    low: {
      savings_max: number;
    };
  };
}

let configCache: RecommendationConfig | null = null;

export const loadRecommendationConfig = (): RecommendationConfig => {
  if (configCache) {
    return configCache;
  }

  try {
    // Try multiple possible paths (dev vs production)
    const possiblePaths = [
      path.join(__dirname, '../../config/recommendations.yaml'),
      path.join(process.cwd(), 'config/recommendations.yaml'),
      path.join(process.cwd(), 'backend/config/recommendations.yaml'),
    ];

    let configPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath;
        break;
      }
    }

    if (!configPath) {
      console.warn('Recommendation config file not found, using defaults');
      return getDefaultConfig();
    }

    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as RecommendationConfig;
    configCache = config;
    return config;
  } catch (error) {
    console.error('Error loading recommendation config:', error);
    // Return default config if file can't be loaded
    return getDefaultConfig();
  }
};

const getDefaultConfig = (): RecommendationConfig => {
  return {
    credit_score_ranges: {
      poor: [0, 579],
      fair: [580, 669],
      good: [670, 739],
      excellent: [740, 850],
    },
    consolidation: {
      enabled: true,
      min_debts: 3,
      min_apr: 15,
      max_total_debt: 50000,
      eligible_credit_scores: ['fair', 'good'],
      debt_types: ['credit_card'],
      estimated_apr: 18,
      payment_percentage: 0.02,
    },
    balance_transfer: {
      enabled: true,
      min_debts: 2,
      min_apr: 18,
      max_total_debt: 30000,
      eligible_credit_scores: ['good', 'excellent'],
      debt_types: ['credit_card'],
      estimated_promo_apr: 3,
      transfer_fee_percentage: 0.03,
      promo_period_months: 18,
    },
    settlement: {
      enabled: true,
      eligible_credit_scores: ['poor'],
      min_apr: 20,
      max_balance: 10000,
      estimated_settlement_percentage: 0.5,
      settlement_period_months: 12,
    },
    refinancing: {
      enabled: true,
      min_balance: 10000,
      min_apr: 10,
      eligible_credit_scores: ['good', 'excellent'],
      excluded_debt_types: ['credit_card'],
      apr_improvement_estimate: 3,
      evaluation_period_months: 60,
    },
    fit_score_thresholds: {
      high: {
        savings_min: 1500,
      },
      medium: {
        savings_min: 500,
      },
      low: {
        savings_max: 499,
      },
    },
  };
};

