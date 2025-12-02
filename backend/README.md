# PathLight Backend

Backend server for PathLight - Debt Management Calculator & Guide

## Features

- **Session Management**: Temporary in-memory sessions (24-hour timeout)
- **Financial Context**: Store user's income, expenses, savings, and goals
- **Debt Management**: CRUD operations for debt tradelines
- **CSV Upload**: Bulk debt import with validation
- **Debt Aggregation**: Calculate total debt, average APR, DTI ratio
- **Payoff Simulation**: Avalanche, Snowball, and Custom strategies
- **Recommendations**: Hybrid rule-based engine for debt consolidation/settlement/refinancing
- **AI Guidance**: Context-aware explanations (Gemini or rule-based fallback)
- **Chart Data**: Pre-formatted data for pie, line, and bar charts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Set your Gemini API key (optional, for AI guidance):
```
GEMINI_API_KEY=your_key_here
GEMINI_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

4. Run in development mode:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Session
- `POST /api/session` - Create a new session
- `GET /api/session/:sessionId` - Get session info

### Financial Context
- `POST /api/financial-context` - Save financial context (requires X-Session-Id header)
- `GET /api/financial-context` - Get financial context (requires X-Session-Id header)

### Debts
- `GET /api/debts` - Get all debts with aggregation
- `POST /api/debts` - Add a debt
- `PUT /api/debts/:id` - Update a debt
- `DELETE /api/debts/:id` - Delete a debt
- `POST /api/debts/upload` - Upload CSV file (multipart/form-data)

### Payoff Simulation
- `POST /api/payoff/simulate` - Run payoff simulation with strategy

### Recommendations
- `GET /api/recommendations` - Get debt management recommendations

### Charts
- `GET /api/charts/data` - Get chart data (optional query: strategy, monthlyPayment)

### AI Guidance
- `POST /api/ai/guidance` - Get AI-powered explanation (body: { action?, scenario? })

## Session Management

Sessions are temporary and stored in-memory. They expire after 24 hours of inactivity. Include the session ID in the `X-Session-Id` header for authenticated requests.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **CSV Parsing**: PapaParse
- **AI**: Gemini API (optional, via Vertex AI or REST API)
