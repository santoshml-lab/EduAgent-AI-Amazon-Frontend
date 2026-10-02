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

            <div class="voice-area">

                <button
                    id="voiceButton"
                    class="voice-button"
                    type="button"
                    aria-label="Start voice input"
                >
                    🎙
                </button>

                <span id="voiceStatus">
                    Tap to simulate voice input
                </span>

            </div>

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

            <div
                id="toolIndicator"
                class="tool-indicator"
            >
                Ready
            </div>


            <!-- Quick Actions -->

            <div class="quick-actions">

                <p class="quick-title">
                    Try asking EduAgent
                </p>

                <div class="quick-buttons">

                    <button
                        class="quick-button"
                        type="button"
                        data-prompt="Create a 5 day study plan for Python"
                    >
                        📚 Study Plan
                    </button>

                    <button
                        class="quick-button"
                        type="button"
                        data-prompt="What are some good resources to learn mathematics?"
                    >
                        📖 Learning Resources
                    </button>

                    <button
                        class="quick-button"
                        type="button"
                        data-prompt="What is 25% of 800?"
                    >
                        🧮 Calculator
                    </button>

                    <button
                        class="quick-button"
                        type="button"
                        data-prompt="Explain machine learning in simple words."
                    >
                        🤖 Explain Concept
                    </button>

                </div>

            </div>


            <!-- Current Response -->

            <div
                id="response"
                class="response"
            >
                Ask me for a study plan, learning resources,
                calculations, or an educational explanation.
            </div>


            <!-- Conversation History -->

            <div
                id="conversation"
                class="conversation"
            ></div>


            <!-- Clear -->

            <div class="conversation-area">

                <button
                    id="clearButton"
                    class="clear-button"
                    type="button"
                >
                    Clear Conversation
                </button>

            </div>

        </section>
    </main>
`;


/* ==============================
   DOM ELEMENTS
================================ */

const input =
    document.getElementById("userInput");

const button =
    document.getElementById("askButton");

const response =
    document.getElementById("response");

const status =
    document.getElementById("status");

const assistantCircle =
    document.getElementById("assistantCircle");

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");

const toolIndicator =
    document.getElementById("toolIndicator");

const clearButton =
    document.getElementById("clearButton");

const conversation =
    document.getElementById("conversation");

const quickButtons =
    document.querySelectorAll(".quick-button");


/* ==============================
   STATE
================================ */

let conversationHistory = [];


/* ==============================
   STATUS
================================ */

function setStatus(message, color = "") {

    status.textContent = message;

    if (color) {
        status.style.color = color;
    } else {
        status.style.color = "";
    }
}


function setTool(message) {

    toolIndicator.textContent = message;
}


function showThinkingState() {

    setStatus(
        "Thinking...",
        "#facc15"
    );

    assistantCircle.textContent = "...";

    setTool(
        "EduAgent is selecting a tool..."
    );
}


function showReadyState() {

    setStatus(
        "Ready to help",
        "#4ade80"
    );

    assistantCircle.textContent = "AI";

    setTool("Ready");
}


/* ==============================
   CONVERSATION
================================ */

function addConversationMessage(
    type,
    content
) {

    conversationHistory.push({

        type: type,

        content: content,

        time: new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        )

    });

    renderConversation();
}


function renderConversation() {

    conversation.innerHTML = "";


    conversationHistory.forEach(
        (message) => {

            const messageElement =
                document.createElement("div");


            messageElement.className =
                `conversation-message ${message.type}`;


            messageElement.innerHTML = `

                <div class="message-header">

                    <strong>
                        ${
                            message.type === "user"
                                ? "You"
                                : "EduAgent AI"
                        }
                    </strong>

                    <small>
                        ${message.time}
                    </small>

                </div>

                <div class="message-content">
                    ${message.content}
                </div>

            `;


            conversation.appendChild(
                messageElement
            );

        }
    );
}


/* ==============================
   TOOL INDICATOR
================================ */

function updateToolIndicator(action) {

    const toolNames = {

        study_plan:
            "Using Study Plan Tool",

        learning_resources:
            "Using Learning Resources Tool",

        calculator:
            "Using Calculator Tool",

        general:
            "Using EduAgent AI"

    };


    setTool(
        toolNames[action] ||
        "Processing request..."
    );
}


/* ==============================
   FORMAT AGENT RESPONSE
================================ */

function formatAgentResult(agentResult) {

    if (!agentResult) {

        return (
            "EduAgent completed the request."
        );
    }


    const toolResult =
        agentResult.tool_result;


    /* Study Plan */

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
                Study Plan Tool
            </div>

        `;


        toolResult.plan.forEach(
            (day) => {

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
            }
        );


        return output;
    }


    /* Learning Resources */

    if (
        agentResult.action ===
            "learning_resources" &&
        toolResult?.resources
    ) {

        let output = `

            <h3>
                📖 Learning Resources for
                ${toolResult.topic}
            </h3>

            <div class="tool-label">
                Learning Resources Tool
            </div>

        `;


        toolResult.resources.forEach(
            (resource) => {

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
            }
        );


        return output;
    }


    /* Calculator */

    if (
        agentResult.action ===
            "calculator" &&
        toolResult
    ) {

        if (toolResult.error) {

            return `

                <h3>
                    🧮 Calculator
                </h3>

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
                Calculator Tool
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


    /* General AI */

    if (agentResult.response) {

        try {

            const parsedResponse =
                JSON.parse(
                    agentResult.response
                );


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


    return (
        "EduAgent completed the request."
    );
}


/* ==============================
   ASK EDUAGENT
================================ */

async function askEduAgent() {

    const userInput =
        input.value.trim();


    if (!userInput) {

        response.textContent =
            "Please enter a question.";

        input.focus();

        return;
    }


    /* Add user message */

    addConversationMessage(
        "user",
        userInput
    );


    /* Disable controls */

    button.disabled = true;

    input.disabled = true;

    voiceButton.disabled = true;


    button.textContent =
        "Thinking...";


    response.textContent =
        "EduAgent is processing your request...";


    showThinkingState();


    try {

        const result = await fetch(

            `${API_URL}/alexa-simulate`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    user_input:
                        userInput

                })

            }

        );


        if (!result.ok) {

            throw new Error(
                `HTTP ${result.status}`
            );
        }


        const data =
            await result.json();


        const agentResult =
            data.agent_result;


        /* Show selected tool */

        updateToolIndicator(
            agentResult?.action
        );


        /* Format response */

        const formattedResponse =
            formatAgentResult(
                agentResult
            );


        /* Show response */

        response.innerHTML =
            formattedResponse;


        /* Add AI message */

        addConversationMessage(
            "assistant",
            formattedResponse
        );


        setStatus(
            "Response ready",
            "#4ade80"
        );


        assistantCircle.textContent =
            "✓";


    } catch (error) {

        console.error(
            "EduAgent error:",
            error
        );


        const errorMessage = `

            <h3>
                Connection Error
            </h3>

            <p>
                Unable to connect to
                EduAgent AI.
                Please try again.
            </p>

        `;


        response.innerHTML =
            errorMessage;


        addConversationMessage(
            "assistant",
            errorMessage
        );


        setStatus(
            "Connection error",
            "#f87171"
        );


        assistantCircle.textContent =
            "!";


        setTool(
            "Request failed"
        );


    } finally {

        button.disabled = false;

        input.disabled = false;

        voiceButton.disabled = false;


        button.textContent =
            "Ask EduAgent";


        input.value = "";

        input.focus();

    }
}


/* ==============================
   QUICK ACTIONS
================================ */

quickButtons.forEach(
    (quickButton) => {

        quickButton.addEventListener(
            "click",
            () => {

                const prompt =
                    quickButton.dataset.prompt;


                input.value = prompt;

                input.focus();

            }
        );

    }
);


/* ==============================
   VOICE SIMULATION
================================ */

voiceButton.addEventListener(
    "click",
    () => {

        voiceButton.classList.add(
            "listening"
        );


        voiceStatus.textContent =
            "Listening...";


        setStatus(
            "Listening...",
            "#67e8f9"
        );


        assistantCircle.textContent =
            "🎙";


        setTimeout(
            () => {

                voiceButton.classList.remove(
                    "listening"
                );


                voiceStatus.textContent =
                    "Voice simulation ready";


                setStatus(
                    "Ready to help",
                    "#4ade80"
                );


                assistantCircle.textContent =
                    "AI";


                input.focus();

            },
            1800
        );

    }
);


/* ==============================
   ASK BUTTON
================================ */

button.addEventListener(
    "click",
    askEduAgent
);


/* ==============================
   ENTER KEY
================================ */

input.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            askEduAgent();

        }

    }
);


/* ==============================
   CLEAR CONVERSATION
================================ */

clearButton.addEventListener(
    "click",
    () => {

        conversationHistory = [];

        conversation.innerHTML = "";

        input.value = "";

        response.textContent =
            "Ask me for a study plan, learning resources, calculations, or an educational explanation.";

        voiceStatus.textContent =
            "Tap to simulate voice input";

        showReadyState();

        input.focus();

    }
);
