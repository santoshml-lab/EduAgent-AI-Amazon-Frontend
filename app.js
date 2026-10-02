const API_URL = "https://eduagent-ai-amazon.onrender.com";

const root = document.getElementById("root");

root.innerHTML = `
    <main class="app">
        <section class="card">

            <div class="badge">
                Alexa+ Simulation
            </div>

            <h1>EduAgent AI</h1>

            <p class="subtitle">
                Your intelligent educational assistant
            </p>

            <div class="assistant-circle" id="assistantCircle">
                AI
            </div>

            <p class="status" id="status">
                Ready to help
            </p>

            <div class="input-area">

                <input
                    id="userInput"
                    type="text"
                    placeholder="Ask EduAgent anything..."
                    autocomplete="off"
                />

                <button id="askButton">
                    Ask EduAgent
                </button>

            </div>

            <div id="response" class="response">
                Ask me for a study plan, learning resources,
                calculations, or an educational explanation.
            </div>

        </section>
    </main>
`;


const input = document.getElementById("userInput");
const button = document.getElementById("askButton");
const response = document.getElementById("response");
const status = document.getElementById("status");
const assistantCircle = document.getElementById("assistantCircle");


function setStatus(message, color = "") {
    status.textContent = message;

    if (color) {
        status.style.color = color;
    } else {
        status.style.color = "";
    }
}


function showThinkingState() {
    setStatus("Thinking...", "#facc15");

    assistantCircle.textContent = "...";
}


function showReadyState() {
    setStatus("Ready to help", "#4ade80");

    assistantCircle.textContent = "AI";
}


function formatAgentResult(agentResult) {

    if (!agentResult) {
        return "EduAgent completed the request.";
    }

    const toolResult = agentResult.tool_result;

    /*
     * Study Plan
     */

    if (
        agentResult.action === "study_plan" &&
        toolResult?.plan
    ) {

        let output = `
            <h3>
                📚 ${toolResult.topic} —
                ${toolResult.days}-Day Study Plan
            </h3>

            <div class="tool-label">
                Tool: Study Plan
            </div>
        `;

        toolResult.plan.forEach((day) => {

            output += `
                <div class="plan-day">

                    <strong>
                        Day ${day.day}
                    </strong>

                    <p>
                        ${day.focus}
                    </p>

                    <small>
                        ${day.task}
                    </small>

                </div>
            `;
        });

        return output;
    }


    /*
     * Learning Resources
     */

    if (
        agentResult.action === "learning_resources" &&
        toolResult?.resources
    ) {

        let output = `
            <h3>
                📖 Learning Resources for
                ${toolResult.topic}
            </h3>

            <div class="tool-label">
                Tool: Learning Resources
            </div>
        `;

        toolResult.resources.forEach((resource) => {

            output += `
                <div class="resource-item">

                    <strong>
                        ${resource.title}
                    </strong>

                    <p>
                        ${resource.purpose}
                    </p>

                </div>
            `;
        });

        return output;
    }


    /*
     * Calculator
     */

    if (
        agentResult.action === "calculator" &&
        toolResult
    ) {

        if (toolResult.error) {

            return `
                <h3>🧮 Calculator</h3>

                <p>
                    ❌ ${toolResult.error}
                </p>
            `;
        }

        return `
            <h3>
                🧮 Calculator
            </h3>

            <div class="tool-label">
                Tool: Calculator
            </div>

            <p>
                <strong>
                    ${toolResult.expression}
                </strong>

                =

                <strong>
                    ${toolResult.result}
                </strong>
            </p>
        `;
    }


    /*
     * General AI response
     */

    if (agentResult.response) {

        try {

            const parsedResponse =
                JSON.parse(agentResult.response);

            return (
                parsedResponse.response ||
                parsedResponse.answer ||
                parsedResponse.message ||
                "EduAgent completed the request."
            );

        } catch {

            return agentResult.response;
        }
    }


    if (agentResult.message) {
        return agentResult.message;
    }


    return "EduAgent completed the request.";
}


async function askEduAgent() {

    const userInput = input.value.trim();

    if (!userInput) {

        response.textContent =
            "Please enter a question.";

        input.focus();

        return;
    }


    button.disabled = true;
    input.disabled = true;

    button.textContent = "Thinking...";

    response.textContent =
        "EduAgent is processing your request...";

    showThinkingState();


    try {

        const result = await fetch(
            `${API_URL}/alexa-simulate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_input: userInput
                })
            }
        );


        if (!result.ok) {

            throw new Error(
                `HTTP ${result.status}`
            );
        }


        const data = await result.json();


        response.innerHTML =
            formatAgentResult(
                data.agent_result
            );


        setStatus(
            "Response ready",
            "#4ade80"
        );


        assistantCircle.textContent = "✓";


    } catch (error) {

        console.error(
            "EduAgent error:",
            error
        );


        response.innerHTML = `
            <h3>
                Connection Error
            </h3>

            <p>
                Unable to connect to EduAgent AI.
                Please try again.
            </p>
        `;


        setStatus(
            "Connection error",
            "#f87171"
        );


        assistantCircle.textContent = "!";


    } finally {

        button.disabled = false;
        input.disabled = false;

        button.textContent =
            "Ask EduAgent";

        input.focus();
    }
}


/*
 * Button click
 */

button.addEventListener(
    "click",
    askEduAgent
);


/*
 * Enter key
 */

input.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            askEduAgent();
        }

    }
);
