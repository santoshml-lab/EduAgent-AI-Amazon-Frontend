# EduAgent AI

> An adaptive agentic AI learning assistant that understands learning requests, plans actions, uses specialized tools, evaluates intermediate results, and adapts its next step.

## Amazon Developer Hackathon 2026

EduAgent AI was developed for the **Amazon Developer Hackathon 2026** under the **Alexa+** track.

The project demonstrates an **Alexa+ simulated experience** through a web application using a custom agentic AI architecture.

Instead of simply generating an answer, EduAgent AI can plan a workflow, execute tools, evaluate intermediate results, and dynamically decide what to do next.

---

## Live Demo

https://eduagent-amazon.vercel.app/

## Backend API

https://eduagent-ai-amazon.onrender.com

## GitHub

https://github.com/santoshml-lab/EduAgent-AI-Amazon

---

## Project Overview

Traditional AI assistants often follow a simple pattern:

```text
User Request
     ↓
LLM
     ↓
Final Answer

User Request
     ↓
AI Brain
     ↓
Planner
     ↓
Tool 1
     ↓
Adaptive Reasoning
     ↓
Tool 2
     ↓
Result Aggregator
     ↓
Final Response
The agent does not always follow the same sequence.
After a tool produces an intermediate result, the agent can evaluate that result and decide whether another tool is required.

Key Features
AI-powered learning assistance
Dynamic request understanding
Agentic workflow planning
Adaptive multi-tool reasoning
Study plan generation
Learning resource generation
Mathematical calculations
Web search
Tool validation
Workflow tracing
Result aggregation
Final learner-friendly responses
Alexa+ simulated web experience

                    ┌─────────────────┐
                    │   User Request  │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │    AI Brain     │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │     Planner     │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │   Tool Manager  │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │    Tool 1       │
                    └────────┬────────┘
                             ↓
                 ┌────────────────────────┐
                 │  Adaptive Reasoning    │
                 └────────────┬───────────┘
                              ↓
                    ┌─────────────────┐
                    │    Tool 2       │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Result Aggregator│
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Final Response  │
                    └─────────────────┘

Adaptive Reasoning
The main feature of EduAgent AI is its adaptive workflow.
For example, a learner can ask:
I have a mathematics exam in 7 days.
Create a study plan, then decide what resources I need based on the plan.
The agent can perform:
Step 1
Create a 7-day mathematics study plan.

        ↓

Step 2
Evaluate the generated study plan.

        ↓

Step 3
Determine that learning resources are required.

        ↓

Step 4
Generate resources related to the study plan.

        ↓

Final Response
Combine the results into a useful learning response.
This allows the agent to make decisions based on intermediate results instead of blindly following a predefined sequence.

Available Tools
1. Study Plan
Creates a structured day-by-day learning plan.
Example:
Topic: Mathematics
Duration: 7 days
The tool generates learning stages and practical tasks for each day.
2. Learning Resources
Generates structured resources for a learning topic.
The resource categories include:
Fundamentals
Practice
Revision
Mini Project
3. Calculator
Provides mathematical expression calculation.
Example:
125 * 48

4. Web Search
Uses the Tavily Search API to retrieve current web information when required.
The agent can use web search as part of a multi-tool workflow.
Alexa+ Simulated Experience
EduAgent AI demonstrates an Alexa+ simulated experience through a web application.
The simulation focuses on the agentic behavior rather than requiring Alexa hardware.
The experience demonstrates how an assistant-style interface can:
Understand a natural language request
Plan actions
Use specialized tools
Evaluate intermediate results
Adapt its next action
Aggregate information
Return a final response
The Alexa+ simulation is implemented using the project's own agentic architecture.

Technology Stack
Frontend
HTML
CSS
JavaScript
Backend
Python
FastAPI
AI
Groq
openai/gpt-oss-20b
Tools & APIs
Tavily Search API
Deployment
Vercel
Render
Version Control
GitHub

Project Structure
EduAgent-AI-Amazon/
│
├── app.py
├── agent.py
├── tool.py
├── tools.py
├── tools_registry.py
│
├── index.html
├── style.css
├── app.js
│
├── requirements.txt
├── README.md
└── LICENSE

Backend Architecture
The backend is built using FastAPI.
Main endpoints include:
GET  /
GET  /health
POST /agent
POST /groq-test
POST /alexa-simulate
/agent
Processes an educational request through the agent.
/groq-test
Tests the Groq LLM connection.
/alexa-simulate
Runs the request through the Alexa+ simulated experience.

Environment Variables
The backend requires environment variables for external APIs.
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key

Running Locally
1. Clone the repository
git clone https://github.com/santoshml-lab/EduAgent-AI-Amazon.git
cd EduAgent-AI-Amazon
2. Install dependencies
pip install -r requirements.txt
3. Configure environment variables
Create a .env file:
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
4. Start the backend
uvicorn app:app --reload
The backend will run at:
http://127.0.0.1:8000
5. Start the frontend
Open:
index.html
in a browser or serve the frontend using a local development server.

Example Workflow
User
I have a mathematics exam in 7 days.
Create a study plan, then decide what resources I need based on the plan.
Agent
AI Brain
    ↓
Planner
    ↓
Study Plan Tool
    ↓
Adaptive Reasoning
    ↓
Learning Resources Tool
    ↓
Result Aggregator
    ↓
Final Response
The final response combines the study plan and the resources selected based on the generated plan.

Reliability Features
The agent includes several mechanisms to make the workflow more reliable:
Tool validation
Supported-tool checks
Adaptive step limits
Error handling
Intermediate result tracking
Workflow tracing
Result aggregation
Final response construction
The adaptive workflow also prevents unsupported or repeated tool execution.

Why Agentic AI?
The goal of EduAgent AI is not simply to make an LLM answer questions.
The goal is to make the system capable of deciding:
What does the learner need?
        ↓
What action should happen first?
        ↓
What did the previous action produce?
        ↓
Is another action required?
        ↓
What should happen next?
This creates a more flexible learning assistant architecture.

Challenges
One of the biggest challenges was moving from a fixed tool-calling workflow to an adaptive workflow.
A fixed workflow assumes that every request follows the same sequence.
However, educational requests can vary significantly.
To address this, adaptive reasoning was introduced so the agent can inspect intermediate results and dynamically select the next tool.
Another challenge was making the agent's behavior visible.
The application therefore includes workflow tracing so users can see:
AI Brain
Planner
Tool Execution
Adaptive Reasoning
Result Aggregation
Final Response

What We Learned
This project demonstrated that agentic AI is more than connecting an LLM to several tools.
A reliable agent requires an orchestration layer around the model.
The core learning loop became:
Understand
    ↓
Plan
    ↓
Act
    ↓
Evaluate
    ↓
Adapt
    ↓
Aggregate
    ↓
Respond
We also learned how intermediate tool results can influence subsequent agent decisions.

Future Improvements
Future versions could include:
Persistent learner profiles
More educational tools
Personalized learning paths
Voice-based interaction
Richer resource retrieval
Additional agent skills
Progress tracking
Learning analytics
More advanced personalization
Integration with official Alexa+ technologies when generally available

Hackathon Submission
Hackathon: Amazon Developer Hackathon 2026
Track: Alexa+
Experience: Alexa+ simulated web experience
Project: EduAgent AI

