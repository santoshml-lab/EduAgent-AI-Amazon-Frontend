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
                Your AI-powered educational assistant
            </p>

            <div class="assistant-circle">
                <span>AI</span>
            </div>

            <p class="status">
                Ready to help
            </p>

            <div class="input-area">
                <input
                    id="userInput"
                    type="text"
                    placeholder="Ask EduAgent anything..."
                />

                <button id="askButton">
                    Ask EduAgent
                </button>
            </div>

            <div id="response" class="response">
                Your response will appear here.
            </div>

        </section>
    </main>
`;


function formatAgentResult(agentResult) {
    if (!agentResult) {
        return "EduAgent completed the request.";
    }

    const toolResult = agentResult.tool_result;

    if (agentResult.action === "study_plan" && toolResult?.plan) {
        let output = `
            <h3>📚 ${toolResult.topic} — ${toolResult.days}-Day Study Plan</h3>
        `;

        toolResult.plan.forEach((day) => {
            output += `
                <div class="plan-day">
                    <strong>Day ${day.day}</strong>
                    <p>${day.focus}</p>
                    <small>${day.task}</small>
                </div>
            `;
        });

        return output;
    }

    if (
        agentResult.action === "learning_resources" &&
        toolResult?.resources
    ) {
        let output = `
            <h3>📖 Learning Resources for ${toolResult.topic}</h3>
        `;

        toolResult.resources.forEach((resource) => {
            output += `
                <div class="resource-item">
                    <strong>${resource.title}</strong>
                    <p>${resource.purpose}</p>
                </div>
            `;
        });

        return output;
    }

    if (agentResult.action === "calculator" && toolResult) {
        if (toolResult.error) {
            return `❌ ${toolResult.error}`;
        }

        return `
            <h3>🧮 Calculator</h3>
            <p>
                <strong>${toolResult.expression}</strong>
                = 
                <strong>${toolResult.result}</strong>
            </p>
        `;
    }

    if (agentResult.message) {
        return agentResult.message;
    }

    if (agentResult.response) {
        try {
            const parsedResponse = JSON.parse(agentResult.response);

            return (
                parsedResponse.response ||
                parsedResponse.message ||
                agentResult.response
            );
        } catch {
            return agentResult.response;
        }
    }

    return "EduAgent completed the request.";
}


document.getElementById("askButton").addEventListener("click", async () => {
    const input = document.getElementById("userInput");
    const response = document.getElementById("response");
    const button = document.getElementById("askButton");

    const userInput = input.value.trim();

    if (!userInput) {
        response.textContent = "Please enter a question.";
        return;
    }

    button.disabled = true;
    button.textContent = "Thinking...";
    response.textContent = "EduAgent is processing your request...";

    try {
        const result = await fetch(`${API_URL}/alexa-simulate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_input: userInput
            })
        });

        if (!result.ok) {
            throw new Error(`HTTP ${result.status}`);
        }

        const data = await result.json();

        response.innerHTML = formatAgentResult(
            data.agent_result
        );

    } catch (error) {
        console.error(error);

        response.textContent =
            "Unable to connect to EduAgent AI. Please try again.";

    } finally {
        button.disabled = false;
        button.textContent = "Ask EduAgent";
    }
});
