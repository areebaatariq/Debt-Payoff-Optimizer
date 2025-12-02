# Missing Features from PRD

> ⚠️ **NOTE:** This file is OUTDATED. See `CURRENT_STATUS.md` for accurate status.
> 
> Most features listed here have been implemented. This file is kept for reference only.

Based on the PRD requirements, here's what was originally missing:

---

## 🔴 **HIGH PRIORITY - Core PRD Requirements**

### 1. **Financial Context - Missing Fields**
**Status**: ❌ Not Implemented

**Missing:**
- `zipCode` - Not collected in onboarding
- `timeHorizonPreference` - Not collected
- Additional `primaryGoal` options:
  - Currently: `pay_faster`, `reduce_interest`
  - Missing: `lower_payment`, `avoid_default`

**Files to Update:**
- `backend/src/types/index.ts`
- `backend/src/routes/financialContext.ts`
- `frontend/src/types/index.ts`
- `frontend/src/components/OnboardingForm.tsx`

---

### 2. **Debt Tradeline - Missing Fields**
**Status**: ❌ Not Implemented

**Missing:**
- `nextPaymentDate` - Not stored (mentioned in PRD)

**Files to Update:**
- `backend/src/types/index.ts`
- `backend/src/routes/debts.ts`
- `frontend/src/types/index.ts`
- `frontend/src/components/AddEditDebtDialog.tsx`

---

### 3. **Debt Aggregation - Missing Metrics**
**Status**: ❌ Partially Implemented

**Missing:**
- `utilizationRate` - Credit utilization rate (not calculated)
- `numberOfAccounts` - Count of debt accounts (not in aggregation response)

**Files to Update:**
- `backend/src/utils/debtCalculations.ts`
- `backend/src/types/index.ts`

---

### 4. **Calibration Loop**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Do these numbers look right?" calibration step after initial payoff projection

**What's Needed:**
- Confirmation dialog after first payoff calculation
- Quick edit options: add/remove debt, adjust minimums
- Lightweight adjustment flow

**Component:** `CalibrationDialog.tsx` (new)

---

### 5. **Templated "What If?" Scenarios**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Pay $X more or less", "Consolidate debt X, Y & Z", "Explore debt settlement", "Do a credit card balance transfer"

**What's Needed:**
- Scenario builder component
- Pre-built templates:
  - Pay more/less per month
  - Consolidate specific debts
  - Debt settlement exploration
  - Balance transfer simulation
- Compare scenarios side-by-side

**Components:** `WhatIfScenarios.tsx` (new), `ScenarioComparison.tsx` (new)

---

### 6. **Visualizations - Missing Charts**
**Status**: ⚠️ Partially Implemented

**Missing:**
- Balance bar chart (only pie chart exists for debt composition)
- Scenario comparison charts
- Interest savings comparison bars

**Files to Update:**
- `frontend/src/components/DebtSummary.tsx`
- Add `BarChart` component

---

### 7. **Recommendations Display**
**Status**: ⚠️ Backend Ready, Frontend Missing

**What's Missing:**
- UI component to display recommendations from `/api/recommendations`
- Show fit scores, savings, reasoning
- Action buttons to explore recommendations as scenarios

**Component:** `RecommendationsList.tsx` (new)

---

### 8. **Context-Aware AI Auto-Activation**
**Status**: ⚠️ Partially Implemented

**What's Missing:**
- Auto-trigger AI guidance when:
  - Debt entry complete → summary
  - Inconsistent data detected → suggestions
  - User views recommendations → analysis
  - User interacts with scenario → impact explanation

**Files to Update:**
- `frontend/src/components/DebtList.tsx` - Add auto-summary after adding debts
- `frontend/src/hooks/useAIGuidance.ts` - Add auto-trigger logic

---

### 9. **Next Steps & Summary**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Guided summary of payoff plan", "Suggested next actions", "Optional PDF export"

**What's Needed:**
- Summary component with key insights
- Suggested next actions based on goal
- PDF export functionality

**Components:** `NextSteps.tsx` (new), PDF export utility

---

## 🟡 **MEDIUM PRIORITY - Configuration & Enhancements**

### 10. **JSON/YAML Configuration for Recommendations**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Thresholds & parameters in JSON/YAML: Min APR, Min balance, Credit score ranges, Eligible debt types"

**What's Needed:**
- Configuration file: `backend/config/recommendations.yaml`
- Load rules from config instead of hardcoded
- Make thresholds adjustable without code changes

**Files:**
- `backend/config/recommendations.yaml` (new)
- `backend/src/utils/recommendations.ts` - Update to load from config

---

### 11. **Demo Dataset Option**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Optional demo dataset" for testing

**What's Needed:**
- Pre-populated demo financial context
- Sample debts for quick testing
- "Try Demo" button in onboarding

**Component:** Demo data loader

---

### 12. **Analytics Tracking**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Track user behaviors & AI usage" (F9 - Priority 2)

**What's Needed:**
- Event tracking for key actions
- AI interaction tracking
- Analytics endpoint or integration

---

## 🟢 **LOW PRIORITY - Nice to Have**

### 13. **PDF Export**
**Status**: ❌ Not Implemented

**PRD Requirement:**
> "Optional PDF export" of summary and payoff plan

**What's Needed:**
- PDF generation library
- Export endpoint or client-side generation
- Include charts and summary

---

### 14. **Enhanced Onboarding Introduction**
**Status**: ⚠️ Partially Implemented

**PRD Requirement:**
> "Short structured flow explaining what PathLight does, how AI will assist, calibration loop & What If options"

**What's Missing:**
- Introduction/welcome screen
- Explanation of features
- Feature tour or tooltips

---

## 📊 **Summary Statistics**

| Priority | Missing Features | Status |
|----------|-----------------|--------|
| 🔴 High | 9 items | Critical for PRD compliance |
| 🟡 Medium | 3 items | Important for flexibility |
| 🟢 Low | 2 items | Nice to have |

**Total Missing**: 14 features/components

---

## 🎯 **Recommended Implementation Order**

### Phase 1 - Core Data Completeness (Day 1)
1. Add missing Financial Context fields (zipCode, timeHorizon, goals)
2. Add nextPaymentDate to debts
3. Add utilizationRate and numberOfAccounts to aggregation

### Phase 2 - Core Features (Day 2-3)
4. Calibration loop component
5. Recommendations display component
6. Balance bar chart

### Phase 3 - Advanced Features (Day 4-5)
7. What If scenarios
8. Context-aware AI auto-activation
9. Next Steps & Summary component

### Phase 4 - Configuration & Polish (Day 6)
10. JSON/YAML config for recommendations
11. Demo dataset
12. PDF export (if time permits)

---

## 📝 **Quick Reference**

**Backend Missing:**
- Utilization rate calculation
- Next payment date in debt schema
- Config file for recommendations

**Frontend Missing:**
- 7 new components (Calibration, What If, Recommendations, Next Steps, etc.)
- Missing form fields in onboarding
- Missing charts
- PDF export functionality

**Both Missing:**
- Analytics tracking
- Context-aware AI triggers

