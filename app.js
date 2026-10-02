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

        response.textContent =
            data.agent_result?.message ||
            data.agent_result?.response ||
            "EduAgent completed the request.";

    } catch (error) {
        console.error(error);
        response.textContent =
            "Unable to connect to EduAgent AI. Please try again.";
    } finally {
        button.disabled = false;
        button.textContent = "Ask EduAgent";
    }
});
