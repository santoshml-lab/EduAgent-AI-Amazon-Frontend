const API_URL = "https://eduagent-ai-amazon.onrender.com";

let conversationHistory = [];


/* ================================
   DOM Elements
================================ */

const root = document.getElementById("root");


/* ================================
   Main Application
================================ */

root.innerHTML = `
    <div class="app">

        <div class="card">

            <div class="badge">
                Alexa+ Simulation
            </div>

            <h1>EduAgent AI</h1>

            <p class="subtitle">
                Your intelligent educational AI assistant
            </p>

            <div class="assistant-circle">
                <span>✦</span>
            </div>

            <div class="status">
                <span class="status-dot"></span>
                Ready to help
            </div>

            <div class="voice-area">
                <button
                    id="voice-button"
                    class="voice-button"
                    aria-label="Start voice input"
                >
                    🎙️
                </button>

                <p>Tap to speak</p>
            </div>

            <div class="input-area">

                <input
                    id="user-input"
                    type="text"
                    placeholder="Ask EduAgent anything..."
                    autocomplete="off"
                >

                <button id="ask-button">
                    Ask
                </button>

            </div>

            <div
                id="tool-indicator"
                class="tool-indicator"
            >
                No tool selected
            </div>

            <div class="quick-actions">

                <div class="quick-actions-title">
                    Quick Actions
                </div>

                <div class="quick-buttons">

                    <button
                        class="quick-button"
                        data-prompt="Create a 5 day study plan for Python"
                    >
                        📚 Study Plan
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="What are some good resources to learn mathematics?"
                    >
                        📖 Resources
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="What is 25% of 600?"
                    >
                        🧮 Calculator
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="Explain machine learning in simple words."
                    >
                        🤖 Ask AI
                    </button>

                </div>

            </div>

            <div id="response" class="response"></div>

            <div
                id="agent-activity"
                class="agent-activity"
            ></div>

            <div
                id="agent-workflow"
            ></div>

            <div
                id="conversation"
                class="conversation"
            ></div>

            <button
                id="clear-button"
                class="clear-button"
            >
                Clear Conversation
            </button>

        </div>

    </div>
`;


/* ================================
   Element References
================================ */

const userInput = document.getElementById("user-input");
const askButton = document.getElementById("ask-button");
const voiceButton = document.getElementById("voice-button");
const responseBox = document.getElementById("response");
const toolIndicator = document.getElementById("tool-indicator");
const conversationBox = document.getElementById("conversation");
const clearButton = document.getElementById("clear-button");
const agentActivity = document.getElementById("agent-activity");


/* ================================
   Ask Agent
================================ */

async function askAgent(prompt) {

    if (!prompt || !prompt.trim()) {
        return;
    }

    prompt = prompt.trim();

    userInput.value = prompt;

    responseBox.innerHTML = `
        <div class="response-loading">
            Thinking...
        </div>
    `;

    toolIndicator.textContent =
        "Agent is processing...";

    askButton.disabled = true;

    try {

        const response = await fetch(
            `${API_URL}/alexa-simulate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: prompt
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                `API request failed: ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "EduAgent API response:",
            data
        );

        renderResponse(data);

        renderAgentActivity(
            data.agent_result?.trace || []
        );

        const action =
            data.agent_result?.action || "general";

        try {

            await runWorkflowAnimation(action);

        } catch (workflowError) {

            console.error(
                "Workflow error:",
                workflowError
            );

            /*
             * The main AI response has already
             * been received successfully.
             * Therefore workflow errors should
             * not make the whole request fail.
             */

            const workflow =
                document.getElementById(
                    "agent-workflow"
                );

            if (workflow) {
                workflow.innerHTML = "";
            }
        }

        addConversationMessage(
            "You",
            prompt,
            "user"
        );

        addConversationMessage(
            "EduAgent AI",
            getResponseText(data),
            "assistant"
        );

        conversationHistory.push({
            role: "user",
            content: prompt
        });

        conversationHistory.push({
            role: "assistant",
            content: getResponseText(data)
        });

    } catch (error) {

        console.error(
            "EduAgent request error:",
            error
        );
       alert(error.message);

        responseBox.innerHTML = `
            <div class="response-error">
                Unable to connect to EduAgent AI.
                Please try again.
            </div>
        `;

        toolIndicator.textContent =
            "API connection error";

    } finally {

        askButton.disabled = false;

        userInput.focus();
    }
}

    
        
                
            
            


/* ================================
   Response Renderer
================================ */

function renderResponse(data) {

    const agentResult = data.agent_result || {};

    const action =
        agentResult.action || "general";

    const tool =
        agentResult.tool ||
        action;

    toolIndicator.textContent =
        `Tool: ${formatAction(tool)}`;

    let html = "";

    if (action === "study_plan") {

        html += `
            <div class="tool-label">
                📚 Study Plan
            </div>
        `;

        if (agentResult.topic) {
            html += `
                <h3>
                    ${escapeHTML(agentResult.topic)}
                </h3>
            `;
        }

        if (agentResult.days) {
            html += `
                <p>
                    ${agentResult.days}-day study plan
                </p>
            `;
        }

        if (Array.isArray(agentResult.plan)) {

            agentResult.plan.forEach(day => {

                html += `
                    <div class="plan-day">

                        <strong>
                            Day ${day.day}
                        </strong>

                        <div>
                            ${escapeHTML(day.focus || "")}
                        </div>

                        <small>
                            ${escapeHTML(day.task || "")}
                        </small>

                    </div>
                `;

            });
        }

    } else if (action === "learning_resources") {

        html += `
            <div class="tool-label">
                📖 Learning Resources
            </div>
        `;

        if (agentResult.topic) {
            html += `
                <h3>
                    ${escapeHTML(agentResult.topic)}
                </h3>
            `;
        }

        if (Array.isArray(agentResult.resources)) {

            agentResult.resources.forEach(resource => {

                html += `
                    <div class="resource-item">

                        <strong>
                            ${escapeHTML(resource.title || "")}
                        </strong>

                        <p>
                            ${escapeHTML(resource.purpose || "")}
                        </p>

                    </div>
                `;

            });
        }

    } else if (action === "calculator") {

        html += `
            <div class="tool-label">
                🧮 Calculator
            </div>
        `;

        if (agentResult.expression) {

            html += `
                <p>
                    <strong>
                        Expression:
                    </strong>

                    ${escapeHTML(
                        agentResult.expression
                    )}
                </p>
            `;
        }

        if (
            agentResult.result !== undefined &&
            agentResult.result !== null
        ) {

            html += `
                <div class="calculator-result">
                    ${escapeHTML(
                        String(agentResult.result)
                    )}
                </div>
            `;
        }

    } else {

        html += `
            <div class="tool-label">
                🤖 AI Response
            </div>
        `;

        html += `
            <p>
                ${escapeHTML(
                    getResponseText(data)
                )}
            </p>
        `;
    }

    responseBox.innerHTML = html;
}


/* ================================
   Get Response Text
================================ */

function getResponseText(data) {

    const agentResult =
        data.agent_result || {};

    if (agentResult.response) {

        if (
            typeof agentResult.response ===
            "string"
        ) {
            return agentResult.response;
        }

        if (
            typeof agentResult.response ===
            "object"
        ) {
            return (
                agentResult.response.answer ||
                agentResult.response.message ||
                JSON.stringify(
                    agentResult.response
                )
            );
        }
    }

    if (agentResult.answer) {
        return agentResult.answer;
    }

    if (agentResult.message) {
        return agentResult.message;
    }

    if (agentResult.result !== undefined) {
        return String(agentResult.result);
    }

    return "Response generated successfully.";
}


/* ================================
   Agent Activity
================================ */

function renderAgentActivity(trace) {

    if (!agentActivity) {
        return;
    }

    if (!Array.isArray(trace) || trace.length === 0) {

        agentActivity.innerHTML = "";

        return;
    }

    let html = `
        <div class="activity-title">
            Agent Activity
        </div>
    `;

    trace.forEach(item => {

        let icon = "•";

        if (item.step === 1) {
            icon = "👤";
        } else if (item.step === 2) {
            icon = "🧠";
        } else if (item.step === 3) {
            icon = "🔧";
        } else if (item.step === 4) {
            icon = "⚙️";
        } else if (item.step === 5) {
            icon = "✅";
        }

        html += `
            <div class="activity-item">

                <div class="activity-icon">
                    ${icon}
                </div>

                <div class="activity-content">

                    <strong>
                        ${escapeHTML(
                            getActivityTitle(
                                item.stage
                            )
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            item.message || ""
                        )}
                    </small>

                </div>

            </div>
        `;

    });

    agentActivity.innerHTML = html;
}


function getActivityTitle(stage) {

    const titles = {
        request: "Understanding your request",
        intent_detection: "Detecting user intent",
        tool_selection: "Selecting the appropriate tool",
        tool_execution: "Running the selected tool",
        response: "Response completed"
    };

    return titles[stage] || "Agent processing";
}


/* ================================
   Branching Workflow
================================ */

function buildWorkflow(action) {

    const workflow =
        document.getElementById(
            "agent-workflow"
        );

    if (!workflow) {
        return;
    }

    let selectedNode = "general";

    if (action === "study_plan") {
        selectedNode = "study_plan";
    } else if (action === "calculator") {
        selectedNode = "calculator";
    } else if (action === "learning_resources") {
        selectedNode = "learning_resources";
    }

    workflow.innerHTML = `
        <div class="branch-workflow">

            <div class="branch-workflow-title">
                Agent Workflow
            </div>

            <div class="branch-main">

                <div
                    class="branch-node pending"
                    data-branch-node="request"
                >
                    <div class="branch-icon">
                        👤
                    </div>

                    <strong>
                        User Request
                    </strong>

                    <small>
                        Input received
                    </small>
                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div
                    class="branch-node pending"
                    data-branch-node="brain"
                >
                    <div class="branch-icon">
                        🧠
                    </div>

                    <strong>
                        AI Brain
                    </strong>

                    <small>
                        Understand request
                    </small>
                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div
                    class="branch-node pending"
                    data-branch-node="router"
                >
                    <div class="branch-icon">
                        🔀
                    </div>

                    <strong>
                        Tool Router
                    </strong>

                    <small>
                        Select action
                    </small>
                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-tools">

                    ${createBranchTool(
                        "study_plan",
                        "📚",
                        "Study Plan",
                        "Create learning plan"
                    )}

                    ${createBranchTool(
                        "calculator",
                        "🧮",
                        "Calculator",
                        "Calculate result"
                    )}

                    ${createBranchTool(
                        "learning_resources",
                        "📖",
                        "Resources",
                        "Learning resources"
                    )}

                    ${createBranchTool(
                        "general",
                        "🤖",
                        "General AI",
                        "Generate response"
                    )}

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div
                    class="branch-node pending"
                    data-branch-node="result"
                >
                    <div class="branch-icon">
                        📦
                    </div>

                    <strong>
                        Tool Result
                    </strong>

                    <small>
                        Process result
                    </small>
                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div
                    class="branch-node pending"
                    data-branch-node="response"
                >
                    <div class="branch-icon">
                        ✅
                    </div>

                    <strong>
                        Response
                    </strong>

                    <small>
                        Answer delivered
                    </small>
                </div>

                <div
                    class="branch-status"
                    id="branch-workflow-status"
                >
                    Waiting for agent execution...
                </div>

            </div>

        </div>
    `;

    const selected =
        document.querySelector(
            `[data-branch-node="${selectedNode}"]`
        );

    if (selected) {
        selected.classList.add("selected");
    }
}


function createBranchTool(
    node,
    icon,
    title,
    description
) {

    return `
        <div class="branch-tool">

            <div class="branch-tool-line"></div>

            <div
                class="branch-node pending"
                data-branch-node="${node}"
            >
                <div class="branch-icon">
                    ${icon}
                </div>

                <strong>
                    ${title}
                </strong>

                <small>
                    ${description}
                </small>
            </div>

            <div class="branch-tool-arrow">
                ↘
            </div>

        </div>
    `;
}


function setBranchNodeState(
    node,
    state
) {

    if (!node) {
        return;
    }

    node.classList.remove(
        "pending",
        "running",
        "completed"
    );

    node.classList.add(state);

    const strong =
        node.querySelector("strong");

    if (!strong) {
        return;
    }

    const oldStatus =
        node.querySelector(
            ".branch-check, .branch-running"
        );

    if (oldStatus) {
        oldStatus.remove();
    }

    if (state === "completed") {

        strong.insertAdjacentHTML(
            "beforeend",
            `<span class="branch-check">✓</span>`
        );
    }

    if (state === "running") {

        strong.insertAdjacentHTML(
            "beforeend",
            `<span class="branch-running">●</span>`
        );
    }
}


async function runWorkflowAnimation(
    action
) {

    buildWorkflow(action);

    const status =
        document.getElementById(
            "branch-workflow-status"
        );

    let selectedNode = "general";

    if (action === "study_plan") {
        selectedNode = "study_plan";
    } else if (action === "calculator") {
        selectedNode = "calculator";
    } else if (
        action === "learning_resources"
    ) {
        selectedNode = "learning_resources";
    }

    const steps = [
        {
            node: "request",
            message:
                "Receiving user request..."
        },

        {
            node: "brain",
            message:
                "Understanding the request..."
        },

        {
            node: "router",
            message:
                "Routing request to the appropriate tool..."
        },

        {
            node: selectedNode,
            message:
                `Running ${getWorkflowToolName(
                    selectedNode
                )}...`
        },

        {
            node: "result",
            message:
                "Processing tool result..."
        },

        {
            node: "response",
            message:
                "Generating final response..."
        }
    ];

    for (const step of steps) {

        const node =
            document.querySelector(
                `[data-branch-node="${step.node}"]`
            );

        if (!node) {
            continue;
        }

        setBranchNodeState(
            node,
            "running"
        );

        if (status) {
            status.textContent =
                step.message;
        }

        await delay(500);

        setBranchNodeState(
            node,
            "completed"
        );
    }

    if (status) {

        status.textContent =
            `Workflow completed successfully • ${getWorkflowToolName(
                selectedNode
            )}`;
    }
}


function getWorkflowToolName(node) {

    const names = {
        study_plan: "Study Plan Tool",
        calculator: "Calculator Tool",
        learning_resources: "Resources Tool",
        general: "General AI"
    };

    return names[node] || "Agent";
}


/* ================================
   Conversation
================================ */

function addConversationMessage(
    sender,
    message,
    type
) {

    if (!conversationBox) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `conversation-message ${type}`;

    const header =
        document.createElement("div");

    header.className =
        "message-header";

    header.textContent =
        sender;

    const content =
        document.createElement("div");

    content.className =
        "message-content";

    content.textContent =
        message;

    wrapper.appendChild(header);
    wrapper.appendChild(content);

    conversationBox.appendChild(
        wrapper
    );

    conversationBox.scrollTop =
        conversationBox.scrollHeight;
}


/* ================================
   Quick Actions
================================ */

document
    .querySelectorAll(".quick-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt;

                askAgent(prompt);
            }
        );
    });


/* ================================
   Ask Button
================================ */

askButton.addEventListener(
    "click",
    () => {

        askAgent(
            userInput.value
        );
    }
);


/* ================================
   Enter Key
================================ */

userInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            askAgent(
                userInput.value
            );
        }
    }
);


/* ================================
   Clear Conversation
================================ */

clearButton.addEventListener(
    "click",
    () => {

        conversationHistory = [];

        conversationBox.innerHTML = "";

        responseBox.innerHTML = "";

        toolIndicator.textContent =
            "No tool selected";

        agentActivity.innerHTML = "";

        const workflow =
            document.getElementById(
                "agent-workflow"
            );

        if (workflow) {
            workflow.innerHTML = "";
        }

        userInput.value = "";

        userInput.focus();
    }
);


/* ================================
   Voice Input
================================ */

let recognition = null;

if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = () => {

        voiceButton.classList.add(
            "active"
        );
    };

    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;

        userInput.value =
            transcript;

        askAgent(transcript);
    };

    recognition.onerror = error => {

        console.error(
            "Speech recognition error:",
            error
        );

        voiceButton.classList.remove(
            "active"
        );
    };

    recognition.onend = () => {

        voiceButton.classList.remove(
            "active"
        );
    };
}


voiceButton.addEventListener(
    "click",
    () => {

        if (!recognition) {

            toolIndicator.textContent =
                "Voice input is not supported in this browser.";

            return;
        }

        recognition.start();
    }
);


/* ================================
   Utilities
================================ */

function formatAction(action) {

    const names = {
        study_plan: "Study Plan",
        learning_resources: "Learning Resources",
        calculator: "Calculator",
        general: "General AI"
    };

    return names[action] || action;
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function delay(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}












      

