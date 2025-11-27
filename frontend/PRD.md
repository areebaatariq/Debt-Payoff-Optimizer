---
title: Product Requirements Document
app: quick-raccoon-chirp
created: 2025-11-27T20:00:47.490Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY
*   **Product Vision:** PathLight is a web application designed to help consumers understand, model, and optimize their debt repayment strategies. It provides clarity and reduces financial stress through simple data entry, visual payoff modeling, and contextual, empathetic AI guidance.
*   **Core Purpose:** To solve the overwhelming feeling consumers have about their debt by providing a clear snapshot of their financial situation, modeling different payoff strategies (Avalanche, Snowball), and offering easy-to-understand explanations to build trust and confidence.
*   **Target Users:** U.S. consumers with various unsecured debts (credit cards, personal loans, etc.) who feel overwhelmed and need a clear starting point for their debt repayment journey.
*   **Key Features (MVP):**
    *   Financial Context Entry (User-Generated Content)
    *   Manual Debt Tradeline Management (User-Generated Content)
    *   Debt Summary Dashboard (System-Generated Content)
    *   Payoff Scenario Modeling (System-Generated Content)
    *   On-Demand AI Explanations (System-Generated Content)
*   **Complexity Assessment:** Simple
    *   **State Management:** Local (Session-based only, no persistent user accounts).
    *   **External Integrations:** 1 (AI service for explanations).
    *   **Business Logic:** Simple (Standard, self-contained financial calculations for debt amortization).
    *   **Data Synchronization:** None.
*   **MVP Success Metrics:**
    *   Users can complete the core workflow: enter financial context, add debts, and generate a payoff scenario.
    *   The system accurately calculates and visualizes debt summaries and payoff timelines for Avalanche and Snowball strategies.
    *   The on-demand AI explanation feature is functional and provides relevant information for key financial terms and calculations.

## 1. USERS & PERSONAS
*   **Primary Persona:**
    *   **Name:** Alex, The Overwhelmed Planner
    *   **Context:** Alex has multiple sources of unsecured debt (a few credit cards, a personal loan) and finds it difficult to see the big picture. They earn a steady income but feel like they aren't making progress.
    *   **Goals:**
        *   To understand their total debt situation in one place.
        *   To find the fastest or cheapest way to pay off their debt.
        *   To feel in control of their financial future.
    *   **Needs:** A simple, non-judgmental tool that provides a clear, actionable plan and explains financial concepts without jargon.

## 2. FUNCTIONAL REQUIREMENTS (MVP)
*   **2.1 Core MVP Features (All are Priority 0)**
    *   **FR-001: Financial Context Management**
        *   **Description:** A user can input their basic financial information to set the stage for debt modeling. This includes monthly take-home income, monthly expenses, liquid savings, and a credit score range. The user can also state their primary goal (e.g., pay off faster, reduce interest).
        *   **Entity Type:** User-Generated Content
        *   **User Benefit:** Provides the system with the necessary data to generate personalized and realistic debt payoff scenarios.
        *   **Primary User:** Alex, The Overwhelmed Planner
        *   **Lifecycle Operations:**
            *   **Create:** User enters their financial details in a simple onboarding form.
            *   **View:** The system uses this data for calculations; it is not displayed on a dedicated profile page.
            *   **Edit:** User can modify their financial context information to see how it impacts their plan.
            *   **Delete:** Data is cleared when the user session ends.
        *   **Acceptance Criteria:**
            *   - [ ] Given a new session, when a user provides their income, expenses, savings, and goal, then the system stores this information for the session.
            *   - [ ] Given existing context data, when a user edits their income, then all subsequent calculations reflect the updated value.

    *   **FR-002: Manual Debt Tradeline Management**
        *   **Description:** A user can manually add, view, edit, and delete individual debt accounts (tradelines). Each entry includes debt type, current balance, APR, and minimum monthly payment.
        *   **Entity Type:** User-Generated Content
        *   **User Benefit:** Allows users to build a complete and accurate picture of their total debt obligations.
        *   **Primary User:** Alex, The Overwhelmed Planner
        *   **Lifecycle Operations:**
            *   **Create:** User fills out a form to add a new debt tradeline.
            *   **View:** User can see details of a specific tradeline.
            *   **Edit:** User can modify the details of an existing tradeline.
            *   **Delete:** User can remove a tradeline from their list.
            *   **List/Search:** User can see a list of all their entered tradelines on the main dashboard.
        *   **Acceptance Criteria:**
            *   - [ ] Given the user is on the dashboard, when they add a new debt with valid details, then it appears in the tradeline list.
            *   - [ ] Given a tradeline exists, when the user edits its balance, then the dashboard summary and any payoff scenarios are recalculated.
            *   - [ ] Given a tradeline exists, when the user deletes it, then it is removed from the list and all calculations are updated.
            *   - [ ] The tradeline list displays the key details for each debt account.

    *   **FR-003: Debt Summary Dashboard**
        *   **Description:** After entering their debts, the user is presented with a dashboard that summarizes their overall debt situation. It includes key metrics (Total Debt, Weighted Average APR) and a visual breakdown of their debt composition (e.g., a pie chart).
        *   **Entity Type:** System-Generated Content
        *   **User Benefit:** Provides an immediate, easy-to-understand snapshot of their financial situation, solving the pain point of not knowing where they stand.
        *   **Primary User:** Alex, The Overwhelmed Planner
        *   **Lifecycle Operations:** This is a read-only view generated by the system. It updates automatically when underlying data (tradelines, financial context) changes.
        *   **Acceptance Criteria:**
            *   - [ ] Given the user has entered at least one debt, when they view the dashboard, then they see the correct Total Debt amount.
            *   - [ ] Given the user has entered multiple debts, when they view the dashboard, then they see the correct Weighted Average APR.
            *   - [ ] The dashboard displays a pie chart accurately representing the proportion of each debt type.

    *   **FR-004: Payoff Scenario Modeling**
        *   **Description:** A user can select a debt repayment strategy (Avalanche or Snowball) and specify a total monthly budget to apply towards their debt. The system will then calculate and display a projected payoff plan, including the payoff date and total interest paid.
        *   **Entity Type:** System-Generated Content
        *   **User Benefit:** Empowers users to see a clear path out of debt and understand the impact of different strategies on their timeline and costs.
        *   **Primary User:** Alex, The Overwhelmed Planner
        *   **Lifecycle Operations:** This is a read-only view generated by the system. A new scenario is created/updated whenever the user changes an input parameter (strategy, budget, or underlying debt).
        *   **Acceptance Criteria:**
            *   - [ ] Given the user has entered debts, when they select the "Avalanche" strategy, then the system generates a payoff timeline prioritizing the highest APR debts.
            *   - [ ] Given the user has entered debts, when they select the "Snowball" strategy, then the system generates a payoff timeline prioritizing the smallest balance debts.
            *   - [ ] Given a generated scenario, when the user increases their monthly debt budget, then the payoff timeline shortens and the total interest paid decreases.
            *   - [ ] The scenario view clearly displays the projected payoff date, total interest paid, and a line chart visualizing the balance reduction over time.

    *   **FR-005: On-Demand AI Explanations**
        *   **Description:** Throughout the application, the user can click an "Explain This" button next to key terms (e.g., "Weighted APR," "Avalanche Method") or results. This action triggers a call to an AI service to provide a simple, empathetic, and factual explanation in a pop-up or sidebar.
        *   **Entity Type:** System-Generated Content
        *   **User Benefit:** Builds trust and understanding by demystifying financial jargon and calculations, making the tool feel transparent and helpful.
        *   **Primary User:** Alex, The Overwhelmed Planner
        *   **Lifecycle Operations:** This is a system function, not a data entity.
        *   **Acceptance Criteria:**
            *   - [ ] Given the user is viewing the dashboard, when they click "Explain This" next to "Weighted APR," then a clear definition is displayed.
            *   - [ ] Given the user is viewing a payoff scenario, when they click "Explain This" next to the "Avalanche" strategy name, then an explanation of how it works is displayed.
            *   - [ ] The AI responses are factual, empathetic in tone, and do not provide financial advice.

*   **2.2 Essential Market Features**
    *   **FR-006: User Authentication**
        *   **Description:** For the MVP, this is explicitly out of scope. The application will be session-based, and no user data will be persisted between visits. This simplifies the initial build and focuses on the core modeling functionality.

## 3. USER WORKFLOWS
*   **3.1 Primary Workflow: Creating a Debt Payoff Plan**
    *   **Trigger:** A new user visits the PathLight web application.
    *   **Outcome:** The user has a clear understanding of their debt situation and a visualized payoff plan based on a chosen strategy.
    *   **Steps:**
        1.  User is greeted with an onboarding screen explaining what the tool does.
        2.  User enters their financial context (income, expenses, savings, goal).
        3.  System displays the main dashboard.
        4.  User clicks "Add Debt" and manually enters the details for their first tradeline.
        5.  System updates the dashboard with a summary and visualizations based on the entered debt.
        6.  User repeats step 4 for all their debt accounts.
        7.  User navigates to the "Payoff Plan" section.
        8.  User selects a strategy (e.g., "Avalanche") and confirms their monthly debt payment budget.
        9.  System calculates and displays the full payoff scenario, including a timeline chart, final payoff date, and total interest paid.
        10. User clicks "Explain This" next to the payoff date to understand why it is what it is.
        11. System displays an AI-generated explanation.
        12. User adjusts their monthly budget to see how it impacts the plan.
        13. System instantly recalculates and updates the scenario visualization.

## 4. BUSINESS RULES
*   **Entity Lifecycle Rules:**
    *   **Financial Context & Debt Tradeline:**
        *   **Who can create/edit/delete:** The current session user.
        *   **What happens on deletion:** Data is removed from the current session. All data is lost when the session ends.
*   **Access Control:**
    *   All data is confined to the user's current browser session. There is no cross-user data visibility.
*   **Data Rules:**
    *   Debt Tradeline fields (Balance, APR, Minimum Payment) must be positive numerical values.
    *   Monthly income must be greater than or equal to monthly expenses for a valid budget calculation.
*   **Process Rules:**
    *   The default payoff strategy presented will be the "Avalanche" method, as it typically saves the most money on interest.
    *   The AI Coach must only explain or clarify the user's current view. It is forbidden from giving prescriptive financial advice.

## 5. DATA REQUIREMENTS
*   **Core Entities:**
    *   **UserSession**
        *   **Type:** System/Configuration
        *   **Attributes:** session_id, monthly_income, monthly_expenses, liquid_savings, credit_score_range, primary_goal
        *   **Relationships:** Has many DebtTradelines
        *   **Lifecycle:** Created on visit, deleted on session end.
    *   **DebtTradeline**
        *   **Type:** User-Generated Content
        *   **Attributes:** id, debt_type, balance, apr, minimum_payment
        *   **Relationships:** Belongs to UserSession
        *   **Lifecycle:** Full CRUD within a user session.

## 6. INTEGRATION REQUIREMENTS
*   **External Systems:**
    *   **AI Service (e.g., Google Gemini via Vertex AI)**
        *   **Purpose:** To generate simple, contextual explanations of financial terms and calculations.
        *   **Data Exchange:** The application sends a structured prompt containing the user's non-PII context (e.g., "Explain Avalanche method") and receives a text-based explanation in return.
        *   **Frequency:** On-demand, whenever a user clicks an "Explain This" button.

## 7. FUNCTIONAL VIEWS/AREAS
*   **Primary Views:**
    *   **Onboarding View:** A multi-step form to collect the user's initial financial context.
    *   **Dashboard View:** The main screen displaying the debt summary (metrics, charts) and the list of debt tradelines.
    *   **Payoff Scenario View:** A dedicated area to select a strategy, adjust the budget, and view the resulting payoff timeline chart and summary metrics.
*   **Modal/Overlay Needs:**
    *   **Add/Edit Debt Form:** A modal form for creating or editing a debt tradeline.
    *   **AI Explanation Popup:** A modal or popover to display the text from the AI explanation service.
    *   **Delete Confirmation:** A confirmation dialog before a user deletes a debt tradeline.

## 8. MVP SCOPE & DEFERRED FEATURES
*   **8.1 MVP Success Definition**
    *   The core workflow of entering financial context and debts to generate a complete, visualized payoff plan for both Snowball and Avalanche strategies is fully functional and end-to-end.
    *   All features defined as "Core MVP" in Section 2.1 are implemented and working reliably.

*   **8.2 In Scope for MVP**
    *   FR-001: Financial Context Management
    *   FR-002: Manual Debt Tradeline Management
    *   FR-003: Debt Summary Dashboard
    *   FR-004: Payoff Scenario Modeling (Avalanche & Snowball only)
    *   FR-005: On-Demand AI Explanations

*   **8.3 Deferred Features (Post-MVP Roadmap)**
    *   **DF-001: CSV Debt Upload**
        *   **Description:** Allow users to upload a CSV file with their debt information instead of manual entry.
        *   **Reason for Deferral:** Not essential for the core validation flow. Manual entry is sufficient for an MVP and validates the user's willingness to engage.
    *   **DF-002: Advanced "What If?" Scenarios**
        *   **Description:** Allow users to model complex scenarios like debt consolidation, balance transfers, or debt settlement.
        *   **Reason for Deferral:** High complexity. The MVP must first validate the core value of understanding and modeling existing debt with standard strategies.
    *   **DF-003: Product Recommendation Engine**
        *   **Description:** A rules-based engine to suggest financial products (e.g., consolidation loans) to the user.
        *   **Reason for Deferral:** Not part of the core user validation journey, which is about understanding and planning, not finding new products.
    *   **DF-004: Context-Aware (Automatic) AI Guidance**
        *   **Description:** AI that proactively provides insights based on user actions (e.g., summarizing debt after entry is complete).
        *   **Reason for Deferral:** Secondary 'nice-to-have' enhancement. The on-demand "Explain This" feature is sufficient to validate the core AI help concept with less implementation complexity.
    *   **DF-005: PDF Export**
        *   **Description:** Allow users to export their summary and payoff plan as a PDF document.
        *   **Reason for Deferral:** Secondary utility feature. Not critical to the core interactive modeling experience.
    *   **DF-006: Persistent User Accounts**
        *   **Description:** The ability for users to create an account, log in, and have their data saved across sessions.
        *   **Reason for Deferral:** Adds significant complexity (authentication, database, security). A session-based model is sufficient to validate the product's core functionality.
    *   **DF-007: Custom Payoff Order**
        *   **Description:** Allow users to manually re-order their debts for a custom payoff plan.
        *   **Reason for Deferral:** Adds secondary value. Snowball and Avalanche cover the primary, most common use cases for an MVP.

## 9. ASSUMPTIONS & DECISIONS
*   **Access Model:** The application is for individual, anonymous use. All data is stored locally in the browser session and is not persisted on a server.
*   **Entity Lifecycle Decisions:**
    *   **Debt Tradeline:** Full CRUD is allowed within a session to enable users to correct mistakes and fully model their situation. Data is ephemeral.
*   **Key Assumptions Made:**
    *   Users are willing to manually enter their debt information for the benefit of a clear, actionable plan.
    *   A session-based tool is valuable enough to validate the core product hypotheses without requiring persistent accounts.
    *   Simple, on-demand explanations are a sufficient test of the AI's value proposition for the MVP.

PRD Complete - Ready for development