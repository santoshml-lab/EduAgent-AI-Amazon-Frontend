const API_URL = "https://eduagent-ai-amazon.onrender.com";

const root = document.getElementById("root");

let conversation = [];


root.innerHTML = `
<div class="app">

    <div class="card">

        <div class="badge">
            AMAZON HACKATHON • ALEXA+ SIMULATION
        </div>

        <h1>EduAgent AI</h1>

        <p class="subtitle">
            Agentic AI learning assistant
        </p>

        <div class="assistant-circle">
            🧠
        </div>

        <div class="status">
            Ready to help
        </div>

        <div class="tool-indicator">
            AI Brain • Planner • Adaptive Reasoning • Agentic Tools
        </div>

        <div class="voice-area">
            <button
                id="voiceButton"
                class="voice-button"
            >
                🎙️
            </button>

            <div id="voiceStatus">
                Tap to speak
            </div>
        </div>

        <div class="input-area">

            <input
                id="userInput"
                type="text"
                placeholder="Ask EduAgent anything..."
            >

            <button id="sendButton">
                Send
            </button>

        </div>

        <div class="quick-actions">

            <div class="quick-title">
                Quick Actions
            </div>

            <div class="quick-buttons">

                <button
                    class="quick-button"
                    data-prompt="Create a 7 day study plan for Python."
                >
                    📚 Study Plan
                </button>

                <button
                    class="quick-button"
                    data-prompt="Give me learning resources for machine learning."
                >
                    📖 Resources
                </button>

                <button
                    class="quick-button"
                    data-prompt="Calculate 125 * 48."
                >
                    🧮 Calculator
                </button>

                <button
                    class="quick-button"
                    data-prompt="Search the latest AI news."
                >
                    🌐 Web Search
                </button>

                <button
                    class="quick-button"
                    data-prompt="I have a mathematics exam in 7 days. Create a study plan, then decide what resources I need based on the plan."
                >
                    🤖 Adaptive Study Agent
                </button>

            </div>

        </div>

        <div
            id="response"
            class="response"
        ></div>

        <div
            id="agentActivity"
            class="agent-workflow"
        ></div>

        <div
            id="conversationArea"
            class="conversation-area"
        >

            <div class="conversation">

                <div class="conversation-message assistant">

                    <div class="message-header">
                        EduAgent AI
                    </div>

                    <div class="message-content">
                        Hello! I can help you with study planning,
                        learning resources, calculations and research.
                    </div>

                </div>

            </div>

            <button
                id="clearButton"
                class="clear-button"
            >
                Clear Conversation
            </button>

        </div>

    </div>

</div>
`;


const userInput = document.getElementById(
    "userInput"
);

const sendButton = document.getElementById(
    "sendButton"
);

const responseContainer = document.getElementById(
    "response"
);

const agentActivity = document.getElementById(
    "agentActivity"
);

const voiceButton = document.getElementById(
    "voiceButton"
);

const voiceStatus = document.getElementById(
    "voiceStatus"
);

const conversationElement = document.querySelector(
    ".conversation"
);

const clearButton = document.getElementById(
    "clearButton"
);


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatAgentText(text) {

    if (!text) {
        return "";
    }

    let formatted = escapeHtml(text);

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );

    return formatted;
}


function getToolDisplayName(tool) {

    const names = {
        study_plan: "Study Plan",
        learning_resources: "Learning Resources",
        calculator: "Calculator",
        web_search: "Web Search"
    };

    return names[tool] || tool;
}


function getToolIcon(tool) {

    const icons = {
        study_plan: "📚",
        learning_resources: "📖",
        calculator: "🧮",
        web_search: "🌐"
    };

    return icons[tool] || "🔧";
}


function getToolShortName(tool) {

    const names = {
        study_plan: "Study Plan",
        learning_resources: "Resources",
        calculator: "Calculator",
        web_search: "Web Search"
    };

    return names[tool] || tool;
}


function buildStudyPlanHtml(result) {

    if (!result) {
        return "";
    }

    const plan = result.plan || [];

    if (!plan.length) {
        return "";
    }

    return `
        <div class="multi-tool-section">

            <h3>
                📚 ${escapeHtml(
                    result.days || plan.length
                )}-Day Study Plan
            </h3>

            ${plan.map(day => `
                <div class="plan-day">

                    <strong>
                        Day ${escapeHtml(day.day)}
                    </strong>

                    <p>
                        ${escapeHtml(day.focus)}
                    </p>

                    <small>
                        ${escapeHtml(day.task)}
                    </small>

                </div>
            `).join("")}

        </div>
    `;
}


function buildLearningResourcesHtml(result) {

    if (!result) {
        return "";
    }

    const resources = result.resources || [];

    if (!resources.length) {
        return "";
    }

    return `
        <div class="multi-tool-section">

            <h3>
                📖 Learning Resources
            </h3>

            ${resources.map(resource => `
                <div class="resource-item">

                    <strong>
                        ${escapeHtml(resource.title)}
                    </strong>

                    <p>
                        ${escapeHtml(resource.purpose)}
                    </p>

                </div>
            `).join("")}

        </div>
    `;
}


function buildCalculatorHtml(result) {

    if (!result) {
        return "";
    }

    return `
        <div class="multi-tool-section">

            <h3>🧮 Calculation</h3>

            <p>
                <strong>
                    Expression:
                </strong>
                ${escapeHtml(result.expression)}
            </p>

            <p>
                <strong>
                    Result:
                </strong>
                ${escapeHtml(result.result)}
            </p>

        </div>
    `;
}


function buildWebSearchHtml(result) {

    if (!result) {
        return "";
    }

    const answer = result.answer || "";
    const results = result.results || [];

    return `
        <div class="multi-tool-section">

            <h3>🌐 Web Search</h3>

            ${
                answer
                    ? `<p>${formatAgentText(answer)}</p>`
                    : ""
            }

            ${
                results.length
                    ? `
                        <div class="web-sources">

                            ${results.map((item, index) => `
                                <div class="web-source-card">

                                    <div class="web-source-number">
                                        ${index + 1}
                                    </div>

                                    <div class="web-source-content">

                                        <strong>
                                            ${escapeHtml(
                                                item.title || "Source"
                                            )}
                                        </strong>

                                        <p>
                                            ${escapeHtml(
                                                item.content || ""
                                            )}
                                        </p>

                                    </div>

                                </div>
                            `).join("")}

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}


function getResponseText(agentResult) {

    if (!agentResult) {
        return "No response received.";
    }

    if (agentResult.response) {
        return agentResult.response;
    }

    if (agentResult.message) {
        return agentResult.message;
    }

    return "The agent completed the request.";
}


function renderSingleTool(agentResult) {

    const action = agentResult.action;
    const result = agentResult.tool_result;

    let html = `
        <div class="tool-label">
            ${getToolIcon(action)}
            ${escapeHtml(
                getToolDisplayName(action)
            )}
        </div>
    `;

    if (action === "study_plan") {
        html += buildStudyPlanHtml(result);
    }

    else if (action === "learning_resources") {
        html += buildLearningResourcesHtml(result);
    }

    else if (action === "calculator") {
        html += buildCalculatorHtml(result);
    }

    else if (action === "web_search") {
        html += buildWebSearchHtml(result);
    }

    html += `
        <div class="final-response">

            <h3>
                Final Agent Response
            </h3>

            <div>
                ${formatAgentText(
                    getResponseText(agentResult)
                )}
            </div>

        </div>
    `;

    responseContainer.innerHTML = html;
}


function renderMultiTool(agentResult) {

    const results = agentResult.tool_results || [];

    let html = "";

    const isAdaptive =
        agentResult.workflow === "adaptive";

    html += `
        <div class="tool-label">
            🤖
            ${isAdaptive
                ? "Adaptive Multi-Agent Workflow"
                : "Multi-Agent Workflow"
            }
        </div>
    `;

    results.forEach((item, index) => {

        const tool = item.tool;
        const result = item.result;

        html += `
            <div class="multi-tool-step">

                <div class="tool-label">

                    ${getToolIcon(tool)}

                    Step ${index + 1}:
                    ${escapeHtml(
                        getToolDisplayName(tool)
                    )}

                </div>

        `;

        if (tool === "study_plan") {
            html += buildStudyPlanHtml(result);
        }

        else if (tool === "learning_resources") {
            html += buildLearningResourcesHtml(result);
        }

        else if (tool === "calculator") {
            html += buildCalculatorHtml(result);
        }

        else if (tool === "web_search") {
            html += buildWebSearchHtml(result);
        }

        html += `
            </div>
        `;
    });

    html += `
        <div class="final-response">

            <h3>
                Final Agent Response
            </h3>

            <div>
                ${formatAgentText(
                    getResponseText(agentResult)
                )}
            </div>

        </div>
    `;

    responseContainer.innerHTML = html;
}


function renderResponse(agentResult) {

    if (!agentResult) {
        responseContainer.innerHTML = `
            <p>
                No response received from EduAgent.
            </p>
        `;

        return;
    }

    if (
        agentResult.action === "multi_tool"
    ) {

        renderMultiTool(
            agentResult
        );

        return;
    }

    if (
        agentResult.action === "general"
    ) {

        responseContainer.innerHTML = `
            <div class="final-response">

                <h3>
                    Final Agent Response
                </h3>

                <div>
                    ${formatAgentText(
                        agentResult.response
                    )}
                </div>

            </div>
        `;

        return;
    }

    renderSingleTool(
        agentResult
    );
}


function getToolStatus(trace, tool) {

    if (!trace) {
        return "pending";
    }

    const found = trace.some(
        item =>
            item.stage === "tool_execution" &&
            item.message &&
            item.message.includes(tool)
    );

    return found
        ? "completed"
        : "pending";
}


function buildAdaptiveWorkflow(
    agentResult
) {

    const trace = agentResult.trace || [];

    const results =
        agentResult.tool_results || [];

    let html = `
        <div class="branch-workflow">

            <div class="branch-workflow-title">
                Adaptive Multi-Agent Workflow
            </div>

            <div class="branch-main">

                <div class="branch-node completed">

                    <div class="branch-icon">
                        👤
                    </div>

                    <strong>
                        User Request
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🧠
                    </div>

                    <strong>
                        AI Brain
                    </strong>

                    <span>
                        Intent detected ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        📋
                    </div>

                    <strong>
                        Planner
                    </strong>

                    <span>
                        Adaptive planning ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

    `;

    results.forEach((item, index) => {

        const status =
            getToolStatus(
                trace,
                item.tool
            );

        html += `
            <div class="branch-node ${status}">

                <div class="branch-icon">
                    ${getToolIcon(item.tool)}
                </div>

                <strong>
                    ${escapeHtml(
                        getToolShortName(item.tool)
                    )}
                </strong>

                <span>
                    Step ${index + 1} ✓
                </span>

            </div>
        `;

        if (index < results.length - 1) {

            html += `
                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🧠
                    </div>

                    <strong>
                        Adaptive Reasoning
                    </strong>

                    <span>
                        Intermediate result evaluated ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>
            `;
        }
    });

    html += `

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🔗
                    </div>

                    <strong>
                        Result Aggregator
                    </strong>

                    <span>
                        Results combined ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        💬
                    </div>

                    <strong>
                        Final Response
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

            </div>

            <div class="workflow-status">
                Adaptive agent workflow completed •
                ${results.length} tool execution(s)
            </div>

        </div>
    `;

    return html;
}


function buildMultiToolWorkflow(
    agentResult
) {

    const trace = agentResult.trace || [];
    const results = agentResult.tool_results || [];

    let html = `
        <div class="branch-workflow">

            <div class="branch-workflow-title">
                Multi-Agent Workflow
            </div>

            <div class="branch-main">

                <div class="branch-node completed">

                    <div class="branch-icon">
                        👤
                    </div>

                    <strong>
                        User Request
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🧠
                    </div>

                    <strong>
                        AI Brain
                    </strong>

                    <span>
                        Intent detected ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        📋
                    </div>

                    <strong>
                        Planner
                    </strong>

                    <span>
                        ${results.length} tool steps ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>
    `;

    results.forEach((item, index) => {

        html += `
            <div class="branch-node completed">

                <div class="branch-icon">
                    ${getToolIcon(item.tool)}
                </div>

                <strong>
                    ${escapeHtml(
                        getToolShortName(item.tool)
                    )}
                </strong>

                <span>
                    Step ${index + 1} ✓
                </span>

            </div>
        `;

        if (index < results.length - 1) {

            html += `
                <div class="branch-arrow">
                    ↓
                </div>
            `;
        }
    });

    html += `

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🔗
                    </div>

                    <strong>
                        Result Aggregator
                    </strong>

                    <span>
                        Results combined ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        💬
                    </div>

                    <strong>
                        Final Response
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

            </div>

            <div class="workflow-status">
                Multi-agent workflow completed •
                ${results.map(
                    item =>
                        getToolDisplayName(
                            item.tool
                        )
                ).join(" + ")}
            </div>

        </div>
    `;

    return html;
}


function buildSingleToolWorkflow(
    agentResult
) {

    const action =
        agentResult.action || "general";

    return `
        <div class="agent-workflow">

            <div class="workflow-title">
                Agent Workflow
            </div>

            <div class="workflow-canvas">

                <div class="workflow-node completed">

                    <div class="workflow-icon">
                        👤
                    </div>

                    <strong>
                        User Request
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

                <div class="workflow-arrow">
                    ↓
                </div>

                <div class="workflow-node completed">

                    <div class="workflow-icon">
                        🧠
                    </div>

                    <strong>
                        AI Brain
                    </strong>

                    <span>
                        Intent detected ✓
                    </span>

                </div>

                <div class="workflow-arrow">
                    ↓
                </div>

                <div class="workflow-node completed">

                    <div class="workflow-icon">
                        🔧
                    </div>

                    <strong>
                        ${escapeHtml(
                            getToolDisplayName(action)
                        )}
                    </strong>

                    <span>
                        Tool executed ✓
                    </span>

                </div>

                <div class="workflow-arrow">
                    ↓
                </div>

                <div class="workflow-node completed">

                    <div class="workflow-icon">
                        💬
                    </div>

                    <strong>
                        Final Response
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

            </div>

        </div>
    `;
}


function buildWorkflow(agentResult) {

    if (
        agentResult &&
        agentResult.action === "multi_tool"
    ) {

        if (
            agentResult.workflow === "adaptive"
        ) {

            return buildAdaptiveWorkflow(
                agentResult
            );
        }

        return buildMultiToolWorkflow(
            agentResult
        );
    }

    return buildSingleToolWorkflow(
        agentResult
    );
}


function renderAgentActivity(
    agentResult
) {

    if (!agentResult) {
        agentActivity.innerHTML = "";
        return;
    }

    const trace =
        agentResult.trace || [];

    let activityHtml = `
        <div class="branch-workflow">

            <div class="branch-workflow-title">
                Agent Activity
            </div>

            <div class="branch-main">

                <div class="branch-node completed">

                    <div class="branch-icon">
                        👤
                    </div>

                    <strong>
                        Understanding Request
                    </strong>

                    <span>
                        Completed ✓
                    </span>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🧠
                    </div>

                    <strong>
                        AI Brain
                    </strong>

                    <span>
                        Intent detected ✓
                    </span>

                </div>
    `;

    if (
        agentResult.action === "multi_tool"
    ) {

        const adaptive =
            agentResult.workflow === "adaptive";

        activityHtml += `

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        📋
                    </div>

                    <strong>
                        Planner
                    </strong>

                    <span>
                        ${
                            adaptive
                                ? "Adaptive planning"
                                : (
                                    agentResult
                                        .tool_results
                                        ?.length || 0
                                ) + " steps"
                        }
                    </span>

                </div>
        `;

        if (adaptive) {

            activityHtml += `
                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node completed">

                    <div class="branch-icon">
                        🧠
                    </div>

                    <strong>
                        Adaptive Reasoning
                    </strong>

                    <span>
                        Intermediate results evaluated ✓
                    </span>

                </div>
            `;
        }
    }

    activityHtml += `

            </div>

        </div>
    `;

    agentActivity.innerHTML =
        activityHtml;

    const workflowHtml =
        buildWorkflow(
            agentResult
        );

    agentActivity.innerHTML +=
        workflowHtml;
}


async function sendMessage(
    prompt = null
) {

    const message =
        prompt ||
        userInput.value.trim();

    if (!message) {
        return;
    }

    userInput.value = "";

    responseContainer.innerHTML = `
        <div class="tool-label">
            🧠 EduAgent is thinking...
        </div>

        <p>
            Understanding request, planning tools
            and executing the workflow...
        </p>
    `;

    agentActivity.innerHTML = "";

    addConversationMessage(
        "user",
        message
    );

    try {

        sendButton.disabled = true;

        const response =
            await fetch(
                `${API_URL}/alexa-simulate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        user_input: message
                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }

        const data =
            await response.json();

        const agentResult =
            data.agent_result || data;

        conversation.push({
            user: message,
            agent: agentResult
        });

        renderResponse(
            agentResult
        );

        renderAgentActivity(
            agentResult
        );

        addConversationMessage(
            "assistant",
            getResponseText(
                agentResult
            )
        );

    }

    catch (error) {

        responseContainer.innerHTML = `
            <div class="final-response">

                <h3>
                    Error
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>
        `;

        addConversationMessage(
            "assistant",
            "I could not connect to the EduAgent backend."
        );

    }

    finally {

        sendButton.disabled = false;

        userInput.focus();
    }
}


function addConversationMessage(
    role,
    message
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        `conversation-message ${role}`;

    wrapper.innerHTML = `

        <div class="message-header">

            ${
                role === "user"
                    ? "You"
                    : "EduAgent AI"
            }

        </div>

        <div class="message-content">

            ${formatAgentText(
                message
            )}

        </div>

    `;

    conversationElement.appendChild(
        wrapper
    );

    wrapper.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


sendButton.addEventListener(
    "click",
    () => sendMessage()
);


userInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            sendMessage();
        }

    }
);


document.querySelectorAll(
    ".quick-button"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt;

                sendMessage(
                    prompt
                );

            }
        );

    }
);


clearButton.addEventListener(
    "click",
    () => {

        conversation = [];

        conversationElement.innerHTML = `
            <div class="conversation-message assistant">

                <div class="message-header">
                    EduAgent AI
                </div>

                <div class="message-content">
                    Conversation cleared. Ready for your next request.
                </div>

            </div>
        `;

        responseContainer.innerHTML = "";

        agentActivity.innerHTML = "";

    }
);


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

    recognition.interimResults =
        false;

    recognition.continuous =
        false;

    recognition.onstart =
        () => {

            voiceButton.classList.add(
                "listening"
            );

            voiceStatus.textContent =
                "Listening...";
        };

    recognition.onresult =
        event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript;

            userInput.value =
                transcript;

            voiceStatus.textContent =
                "Voice captured";

            sendMessage(
                transcript
            );
        };

    recognition.onerror =
        () => {

            voiceStatus.textContent =
                "Voice input failed";

            voiceButton.classList.remove(
                "listening"
            );
        };

    recognition.onend =
        () => {

            voiceButton.classList.remove(
                "listening"
            );

            if (
                voiceStatus.textContent ===
                "Listening..."
            ) {

                voiceStatus.textContent =
                    "Tap to speak";
            }
        };

}


voiceButton.addEventListener(
    "click",
    () => {

        if (!recognition) {

            voiceStatus.textContent =
                "Voice input is not supported in this browser.";

            return;
        }

        recognition.start();

    }
);











      

