# NextStep — AI Decision Assistant

A full-stack AI-powered decision assistant designed to help users handle stressful situations involving multiple problems, changing information, and limited time.

Built for the HAZHTeq Innovations — Full Stack Developer Technical Challenge.

## 🚀 Features

- AI-based decision generation
- Handles multiple problems and constraints
- Immutable situation history and version tracking
- Automatic comparison between old and new inputs
- Protection against prompt injection
- Structured AI responses with schema validation
- JSON repair for malformed AI responses
- Rule-based fallback when the AI provider is unavailable
- Server-side idempotency to prevent duplicate submissions
- Equal-priority handling without forcing an artificial ranking
- Local draft recovery for unstable mobile networks
- Complete user-data purge support

## 🛠️ Tech Stack

Frontend
- React
- JavaScript / TypeScript
- CSS

Backend
- Node.js
- Express
- Zod

Data
- Situations
- Version history
- Audit logs
- Prompt logs

## ▶️ Run Locally

### Install

bash npm run setup 

### Start Backend

bash npm run dev:server 

Runs on:

text http://localhost:5000 

### Start Frontend

In another terminal:

bash npm run dev:client 

Frontend:

text http://localhost:3000 

### Run Scenario Tests

bash npm run test:scenarios 

## 🧠 How the System Works

text User Input    ↓ API Gateway    ↓ Input & Security Checks    ↓ AI Reasoning    ↓ JSON Repair + Schema Validation    ↓ Fallback Engine if AI fails    ↓ Version Creation    ↓ Delta Calculation    ↓ Decision Response 

Each new assessment creates a separate version instead of overwriting previous information. This makes it possible to understand what changed between two decisions.

## 🔐 Reliability & Safety

### Idempotency
Requests use an idempotency key so repeated submissions do not create duplicate situations.

### AI Failure Handling
If the AI provider returns malformed data, rate limits, or fails, the system uses validation, repair and a rule-based fallback.

### Conflicting Updates
When users provide different information later, the latest explicit information is used while the previous version remains available for comparison.

### Privacy
A dedicated purge endpoint removes the user's stored situations, versions and related logs.

### Network Recovery
User drafts are stored locally, and the same idempotency key can be reused after a connection failure to recover an already-processed request.

## 📊 Test Scenarios

The application was tested against scenarios covering:

- Multiple simultaneous problems
- Hinglish input
- Conflicting deadlines
- Emotional/high-stress situations
- Irrelevant requests
- Prompt-injection attempts
- Problems that become worse after taking an action

Result: 7/7 scenarios passed.

## 📈 Scaling Considerations

At higher traffic, the main bottlenecks would be AI-provider limits and request latency.

Possible next steps:

- Redis + BullMQ for background processing
- Worker-based AI requests
- SSE/WebSocket updates
- Semantic caching
- More efficient conversation summarization

## 🤖 AI Development Disclosure

AI-assisted development was used for parts of the implementation, including scaffolding, type definitions, validation structures and test setup.

The generated suggestions were reviewed and modified where required, particularly around deadline conflict handling and equal-priority decisions.

## ❤️ Challenge Note

The main focus of this project was not only generating an AI response, but making the complete system reliable when users provide messy information, repeat requests, lose connectivity, or when the AI service becomes unreliable

NextStep was developed as an end-to-end full-stack implementation for the HAZHTeq Innovations technical challenge, with special attention to unreliable AI responses, changing user information, duplicate requests, privacy requirements, and real-world network conditions.
