# PathLight - Complete Features & Functionality Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [User Workflows](#user-workflows)
4. [Component Features](#component-features)
5. [AI Features](#ai-features)
6. [Data Management](#data-management)
7. [Analytics & Tracking](#analytics--tracking)
8. [Export & Sharing](#export--sharing)
9. [Technical Features](#technical-features)

---

## Overview

**PathLight** is a comprehensive debt optimization web application designed to help consumers understand, model, and optimize their debt repayment strategies. The application provides clarity and reduces financial stress through simple data entry, visual payoff modeling, and contextual, empathetic AI guidance.

### Key Characteristics
- **Session-based**: No user accounts required - all data is stored in browser session
- **Privacy-focused**: No persistent data storage between sessions
- **AI-powered**: Context-aware AI guidance throughout the application
- **Visual**: Rich charts and graphs for debt visualization
- **Comprehensive**: Full debt management and optimization toolkit

---

## Core Features

### 1. Onboarding & Financial Context

#### 1.1 Introduction Flow
- **4-step introduction screens** explaining:
  - What PathLight does
  - How AI will assist
  - Available features
  - Getting started guide
- **Progress indicators** showing current step
- **Skip option** to bypass introduction
- **Demo data option** available from intro screen

#### 1.2 Financial Context Collection
Users provide their financial snapshot:
- **Zip Code** (optional) - for location-based recommendations
- **Monthly Take-Home Income** - required
- **Monthly Expenses** - required
- **Liquid Savings** - required
- **Credit Score Range** - options:
  - Poor (<580)
  - Fair (580-669)
  - Good (670-739)
  - Excellent (740+)
- **Primary Goal** - select one:
  - Pay off debt faster
  - Reduce total interest paid
  - Lower monthly payment
  - Avoid default/collections
- **Time Horizon Preference** (optional) - target months for payoff

**Features:**
- Form validation with error messages
- Default values for quick start
- One-click demo data loading
- Editable after initial entry

---

### 2. Debt Management

#### 2.1 Manual Debt Entry
Users can add individual debt accounts with:
- **Debt Type**:
  - Credit Card
  - Personal Loan
  - Student Loan
  - Auto Loan
  - Other
- **Current Balance** ($)
- **APR** (Annual Percentage Rate) (%)
- **Minimum Payment** ($/month)
- **Next Payment Date** (date picker)
- **Credit Limit** (for credit cards) ($)

#### 2.2 CSV Upload
- **Template-based upload** - users download CSV template
- **Bulk import** of multiple debts at once
- **Validation** - checks for required fields and data types
- **Error handling** - shows specific errors for invalid rows
- **Success feedback** - displays number of debts imported

#### 2.3 Debt List Management
- **View all debts** in a sortable table
- **Edit debts** - click edit icon to modify any debt
- **Delete debts** - with confirmation dialog
- **Reorder debts** - for custom payoff strategy (drag up/down arrows)
- **Real-time updates** - dashboard recalculates automatically

#### 2.4 Demo Dataset
- **One-click demo loading** - pre-populated realistic data
- **Includes**:
  - Financial context (income, expenses, savings)
  - 4 sample debts (2 credit cards, 1 personal loan, 1 auto loan)
  - Credit limits and payment dates
- **Great for** testing and demonstrations

---

### 3. Debt Summary Dashboard

#### 3.1 Key Metrics Cards
Displays four primary metrics with visual indicators:
- **Total Debt** - sum of all debt balances
- **Weighted Average APR** - interest rate weighted by balance
- **Utilization Rate** - credit card utilization percentage
- **Number of Accounts** - total debt accounts

Each card features:
- Colored left border for visual distinction
- Large, readable numbers
- Uppercase labels with tracking

#### 3.2 Debt Composition Chart
- **Pie chart** showing debt breakdown by type
- **Interactive tooltips** showing exact amounts
- **Color-coded** by debt type
- **Legend** for easy identification
- **Responsive** - adapts to screen size

#### 3.3 Balance Bar Chart
- **Bar chart** showing balance per account
- **X-axis** - debt types/accounts
- **Y-axis** - balance amounts
- **Tooltips** with formatted currency
- **Grid lines** for easy reading

---

### 4. Payoff Scenario Modeling

#### 4.1 Strategy Selection
Users can choose from three payoff strategies:

**Avalanche Method:**
- Pays off highest APR debts first
- Minimizes total interest paid
- Best for saving money

**Snowball Method:**
- Pays off smallest balance debts first
- Provides psychological wins
- Best for motivation

**Custom Method:**
- User-defined payoff order
- Manual reordering of debts
- Full control over priority

#### 4.2 Monthly Payment Configuration
- **Input field** for total monthly payment
- **Default value** - sum of all minimum payments
- **Adjustable** - increase/decrease to see impact
- **Real-time calculation** - updates immediately

#### 4.3 Payoff Visualization
- **Line chart** showing balance reduction over time
- **Payoff timeline** - months to complete payoff
- **Total interest paid** - calculated amount
- **Monthly breakdown** - see progress month-by-month
- **Interactive tooltips** on chart

#### 4.4 Scenario Results Display
Shows:
- **Payoff Date** - estimated completion date
- **Total Interest** - amount paid in interest
- **Total Months** - time to payoff
- **Monthly Payment** - amount applied
- **Strategy Used

#### 4.5 Payment Comparison
- **Side-by-side comparison** of different payment amounts
- **Visual bars** showing interest savings
- **Quick scenarios**:
  - Current payment
  - -$50/month
  - +$50/month
  - +$100/month
  - +$200/month

---

### 5. What-If Scenarios

#### 5.1 Pay More Scenario
- **Test extra payments** - see impact of paying more
- **Quick buttons** - +$50, +$100, +$200, +$500
- **Custom amount** - enter any amount
- **Results show**:
  - New payoff timeline
  - Interest savings
  - Time saved

#### 5.2 Debt Consolidation
- **Select multiple debts** to consolidate
- **Configure consolidation loan**:
  - New APR
  - Loan terms
- **Calculate savings**:
  - New monthly payment
  - Interest savings
  - Estimated savings over time
- **Comparison** - before vs. after

#### 5.3 Balance Transfer
- **Select credit card** to transfer
- **Configure transfer**:
  - Promo APR (%)
  - Transfer fee (%)
  - Promo period (months)
- **Calculate**:
  - Transfer fee amount
  - Net savings after fees
  - Post-promo APR impact
- **Important notes** displayed

#### 5.4 Debt Settlement
- **Select debts** for settlement
- **Configure settlement**:
  - Settlement rate (% of balance)
- **Calculate**:
  - Settlement amount
  - Total savings
  - Credit impact warnings
- **Risk information** displayed

---

### 6. Scenario Comparison

#### 6.1 Multi-Strategy Comparison
- **Compare multiple strategies** side-by-side:
  - Avalanche vs. Snowball
  - Different payment amounts
  - Custom scenarios
- **Comparison table** showing:
  - Strategy name
  - Payoff time (months)
  - Total interest paid
  - Estimated savings
  - Monthly payment

#### 6.2 Visual Comparison Charts
- **Interest savings bar chart** - compare interest paid
- **Payoff time comparison** - see time differences
- **Color-coded** for easy identification
- **Interactive tooltips**

#### 6.3 Key Insights
- **Highlights best options** automatically
- **Recommendations** displayed
- **Savings calculations** relative to baseline

---

### 7. Recommendations Engine

#### 7.1 Personalized Recommendations
System generates recommendations based on:
- Debt profile
- Credit score
- Financial context
- Goals

#### 7.2 Recommendation Types

**Debt Consolidation:**
- Eligibility check
- Minimum debt requirements
- APR thresholds
- Fit score calculation

**Balance Transfer:**
- Credit score requirements
- Balance limits
- Promo APR opportunities
- Fee considerations

**Debt Settlement:**
- Credit score impact warnings
- Balance thresholds
- Settlement percentage recommendations
- Risk assessment

**Refinancing:**
- Loan balance requirements
- APR improvement potential
- Eligibility criteria

#### 7.3 Fit Scores
Each recommendation includes:
- **High Match** - strongly recommended
- **Medium Match** - worth considering
- **Low Match** - may not be ideal
- **Visual indicators** (color-coded badges)

#### 7.4 Recommendation Details
- **Title** and description
- **Eligibility status**
- **Potential savings**
- **Requirements** to qualify
- **Next steps** guidance

---

### 8. AI Guidance & Explanations

#### 8.1 On-Demand Explanations
- **"Explain This" buttons** throughout the app
- **Context-aware** - understands current view
- **Simple explanations** - no financial jargon
- **Empathetic tone** - supportive and helpful
- **No financial advice** - educational only

#### 8.2 Context-Aware AI
AI automatically provides guidance when:
- **Debts are added** - summarizes situation
- **Inconsistencies detected** - flags potential errors
- **Recommendations viewed** - explains trade-offs
- **Scenarios generated** - provides insights
- **Key actions taken** - offers relevant tips

#### 8.3 AI Features
- **Auto-triggered summaries** after debt entry
- **Proactive suggestions** for data corrections
- **Contextual help** based on user actions
- **Educational content** for financial terms
- **Strategy explanations** - how methods work

---

### 9. Calibration Loop

#### 9.1 "Do These Numbers Look Right?" Dialog
- **Appears after debt entry** - verification step
- **Shows summary** of entered data
- **Allows corrections** - edit any debt
- **Confirms accuracy** before proceeding
- **Optional step** - can be dismissed

#### 9.2 Data Verification
- **Highlights potential issues**:
  - Unusually low minimum payments
  - High APRs
  - Large balances
- **AI suggestions** for review
- **Easy editing** from dialog

---

### 10. Next Steps & Summary

#### 10.1 Actionable Next Steps
Provides personalized suggestions:
- **Immediate actions** - what to do now
- **Short-term goals** - next 30 days
- **Long-term strategy** - overall plan
- **Goal-specific** - based on user's primary goal

#### 10.2 Summary Information
- **Financial overview** recap
- **Debt summary** - key numbers
- **Payoff plan** summary
- **Progress indicators**

#### 10.3 PDF Export
- **Generate PDF** of complete plan
- **Multi-page document** includes:
  - Financial overview
  - Debt list with details
  - Payoff plan
  - Recommendations summary
  - Next steps
- **Professional formatting**
- **Downloadable** file

---

## User Workflows

### Primary Workflow: Creating a Debt Payoff Plan

1. **User visits application**
   - Sees introduction (4 steps) or skips
   - Option to load demo data

2. **Financial Context Entry**
   - Enters income, expenses, savings
   - Selects credit score range
   - Chooses primary goal
   - Optional: time horizon

3. **Debt Entry**
   - Adds debts manually or uploads CSV
   - Can use demo dataset
   - Edits/deletes as needed

4. **Dashboard Review**
   - Views debt summary
   - Sees charts and metrics
   - Reviews debt list

5. **Calibration**
   - "Do these numbers look right?" dialog
   - Verifies accuracy
   - Makes corrections if needed

6. **Payoff Planning**
   - Selects strategy (Avalanche/Snowball/Custom)
   - Sets monthly payment
   - Views payoff scenario
   - Sees timeline and interest

7. **What-If Analysis**
   - Tests different scenarios
   - Compares strategies
   - Explores consolidation/transfer options

8. **Recommendations Review**
   - Views personalized recommendations
   - Reviews fit scores
   - Considers recommendations

9. **Export & Next Steps**
   - Downloads PDF summary
   - Reviews actionable next steps
   - Plans implementation

---

## Component Features

### AddEditDebtDialog
- **Modal form** for adding/editing debts
- **All debt fields** with validation
- **Date picker** for payment dates
- **Type selection** dropdown
- **Save/Cancel** actions

### CSVUploadDialog
- **File upload** interface
- **Template download** link
- **Validation** and error display
- **Progress feedback**
- **Success confirmation**

### DebtList
- **Table view** of all debts
- **Sortable columns**
- **Action buttons** (edit, delete, reorder)
- **Empty state** message
- **AI summary** alert

### DebtSummary
- **Metric cards** with key numbers
- **Pie chart** for composition
- **Bar chart** for balances
- **Responsive layout**
- **Empty state** handling

### PayoffScenario
- **Strategy selector**
- **Payment input**
- **Chart visualization**
- **Results display**
- **Comparison options**
- **AI guidance triggers**

### WhatIfScenarios
- **Tabbed interface** for different scenarios
- **Interactive forms** for configuration
- **Results display**
- **Savings calculations**
- **Risk warnings**

### ScenarioComparison
- **Multi-scenario setup**
- **Comparison table**
- **Visual charts**
- **Key insights**
- **Best option highlighting**

### RecommendationsList
- **Card-based display**
- **Fit score badges**
- **Eligibility indicators**
- **Details expansion**
- **AI guidance integration**

### NextSteps
- **Action list**
- **PDF export button**
- **Summary information**
- **Goal-based suggestions**

### OnboardingIntro
- **4-step carousel**
- **Progress indicators**
- **Navigation buttons**
- **Skip option**
- **Demo data link**

### OnboardingForm
- **Multi-field form**
- **Validation**
- **Default values**
- **Demo option**
- **Submit handling**

### CalibrationDialog
- **Summary display**
- **Edit links**
- **Confirmation**
- **Skip option**

### ExplainThis
- **Tooltip/popover** display
- **AI explanation** loading
- **Context passing**
- **Error handling**

---

## AI Features

### AI Service Integration
- **Google Gemini** via Vertex AI
- **Context-aware prompts**
- **Structured responses**
- **Error handling**

### AI Capabilities
1. **Term Explanations**
   - Financial jargon simplified
   - Strategy explanations
   - Calculation clarifications

2. **Situation Summaries**
   - Debt profile overview
   - Key insights
   - Action suggestions

3. **Proactive Guidance**
   - Auto-triggered on actions
   - Inconsistency detection
   - Helpful suggestions

4. **Recommendation Explanations**
   - Trade-off analysis
   - Option comparisons
   - Decision support

### AI Guidelines
- **Educational only** - no financial advice
- **Empathetic tone** - supportive
- **Factual** - based on data
- **Context-aware** - understands situation
- **Non-prescriptive** - explains, doesn't dictate

---

## Data Management

### Session-Based Storage
- **No persistent accounts** - session-only
- **Browser storage** - sessionStorage/localStorage
- **Session ID** - tracked for analytics
- **Data cleared** on session end

### Data Entities

**Financial Context:**
- zipCode (optional)
- monthlyIncome
- monthlyExpenses
- liquidSavings
- creditScoreRange
- primaryGoal
- timeHorizonPreference (optional)

**Debt Tradeline:**
- id (unique)
- debtType
- balance
- apr
- minimumPayment
- nextPaymentDate
- creditLimit (optional)

**Aggregation (calculated):**
- totalDebt
- averageApr (weighted)
- utilizationRate
- numberOfAccounts
- totalMinimumPayment
- dti (debt-to-income ratio)

### Data Operations
- **Create** - add new debts/context
- **Read** - view all data
- **Update** - edit existing entries
- **Delete** - remove entries
- **Calculate** - automatic aggregations

---

## Analytics & Tracking

### Event Tracking
Comprehensive analytics for:
- **Onboarding started/completed**
- **Debt added/edited/deleted**
- **CSV uploaded**
- **Demo loaded**
- **Strategy selected**
- **Scenario generated**
- **Recommendations viewed**
- **PDF exported**
- **AI guidance requested**

### Session Tracking
- **Session ID** generation
- **User journey** tracking
- **Feature usage** metrics
- **Error tracking

### Analytics Integration
- **Event-based** system
- **Ready for** analytics platforms
- **Privacy-focused** - no PII
- **Session-scoped** data

---

## Export & Sharing

### PDF Export
- **Multi-page document**
- **Professional formatting**
- **Includes**:
  - Financial overview
  - Debt details
  - Payoff plan
  - Recommendations
  - Next steps
- **Downloadable** file
- **Date-stamped**

### Export Features
- **One-click generation**
- **Formatted tables**
- **Charts included** (as data)
- **Complete summary**
- **Printable format**

---

## Technical Features

### Frontend
- **React + TypeScript**
- **Tailwind CSS** - modern styling
- **shadcn/ui** - component library
- **Recharts** - data visualization
- **React Query** - data fetching
- **React Hook Form** - form management
- **Zod** - validation
- **jsPDF** - PDF generation

### Backend
- **Express + TypeScript**
- **Session management**
- **RESTful API**
- **YAML configuration**
- **AI integration**
- **Calculation utilities**

### Configuration
- **YAML-based** recommendations
- **Configurable thresholds**
- **No code changes** needed for adjustments
- **Easy updates**

### Responsive Design
- **Mobile-first** approach
- **Desktop optimized**
- **Tablet support**
- **Touch-friendly** interactions

### Performance
- **Optimized calculations**
- **Efficient rendering**
- **Lazy loading** where applicable
- **Fast response times**

---

## Feature Status

### ✅ Fully Implemented (100%)

**High Priority:**
- ✅ Financial Context Management
- ✅ Debt Tradeline Management
- ✅ Debt Summary Dashboard
- ✅ Payoff Scenario Modeling
- ✅ On-Demand AI Explanations
- ✅ Calibration Loop
- ✅ What-If Scenarios
- ✅ Recommendations Engine
- ✅ Context-Aware AI

**Medium Priority:**
- ✅ CSV Upload
- ✅ Demo Dataset
- ✅ Analytics Tracking
- ✅ YAML Configuration

**Low Priority:**
- ✅ Enhanced PDF Export
- ✅ Enhanced Onboarding
- ✅ Scenario Comparison
- ✅ Next Steps Component

---

## User Benefits

### Clarity
- **Clear snapshot** of debt situation
- **Visual representations** of data
- **Easy-to-understand** metrics
- **Transparent calculations**

### Control
- **Full debt management** - add, edit, delete
- **Multiple strategies** to choose from
- **Custom scenarios** to explore
- **Flexible planning**

### Confidence
- **AI guidance** for support
- **Educational content** for learning
- **Recommendations** for options
- **Actionable next steps**

### Convenience
- **No account required** - start immediately
- **Session-based** - privacy-focused
- **Export options** - take plan with you
- **Demo data** - try before entering real data

---

## Summary

PathLight is a **comprehensive debt optimization tool** that provides:

1. **Complete debt management** - entry, editing, organization
2. **Multiple payoff strategies** - Avalanche, Snowball, Custom
3. **Advanced scenario modeling** - what-if analysis, consolidation, transfers
4. **Personalized recommendations** - based on profile and goals
5. **AI-powered guidance** - context-aware help throughout
6. **Visual analytics** - charts and graphs for understanding
7. **Export capabilities** - PDF generation for planning
8. **User-friendly design** - modern, clean, professional interface

The application is **fully functional** and ready for use, providing users with everything they need to understand, model, and optimize their debt repayment strategies.

---

*Last Updated: 2025*
*Version: 1.0*
*Status: Production Ready*

