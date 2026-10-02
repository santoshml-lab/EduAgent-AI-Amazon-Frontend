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

document.getElementById("askButton").addEventListener("click", () => {
    const input = document.getElementById("userInput");
    const response = document.getElementById("response");

    if (!input.value.trim()) {
        response.textContent = "Please enter a question.";
        return;
    }

    response.textContent = "Ready to connect with EduAgent AI...";
});
