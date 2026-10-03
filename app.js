const API_URL = "https://eduagent-ai-amazon.onrender.com";

let conversationHistory = [];
let isListening = false;
let recognition = null;

const chatContainer = document.getElementById("chat-container");
const promptInput = document.getElementById("prompt-input");
const askButton = document.getElementById("ask-button");
const clearButton = document.getElementById("clear-button");
const voiceButton = document.getElementById("voice-button");
const workflowContainer = document.getElementById("workflow-container");
const activityContainer = document.getElementById("activity-container");


// --------------------------------------------------
// Utility Functions
// --------------------------------------------------

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHtml(value);
}


function cleanWebText(text) {
    return String(text || "")
        .replace(/#{1,6}\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


function truncateText(text, maxLength = 240) {
    const value = String(text || "");

    if (value.length <= maxLength) {
        return value;
    }

    return `${value.substring(0, maxLength)}...`;
}


function isSafeUrl(url) {
    try {
        const parsed = new URL(url);

        return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        );
    } catch {
        return false;
    }
}


function getResponseText(agentResult) {
    if (!agentResult) {
        return "";
    }

    if (typeof agentResult.response === "string") {
        try {
            const parsed = JSON.parse(agentResult.response);

            if (parsed.summary) {
                return parsed.summary;
            }

            if (parsed.response) {
                return parsed.response;
            }

            if (parsed.message) {
                return parsed.message;
            }
        } catch {
            return agentResult.response;
        }
    }

    if (agentResult.message) {
        return agentResult.message;
    }

    if (agentResult.result !== undefined) {
        return String(agentResult.result);
    }

    return "";
}


// --------------------------------------------------
// Chat Rendering
// --------------------------------------------------

function addUserMessage(message) {
    const messageElement = document.createElement("div");

    messageElement.className = "message user-message";

    messageElement.innerHTML = `
        <div class="message-label">You</div>
        <div class="message-content">
            ${escapeHtml(message)}
        </div>
    `;

    chatContainer.appendChild(messageElement);
    scrollToBottom();
}


function addAssistantMessage(content) {
    const messageElement = document.createElement("div");

    messageElement.className = "message assistant-message";

    messageElement.innerHTML = `
        <div class="message-label">EduAgent AI</div>
        <div class="message-content">
            ${content}
        </div>
    `;

    chatContainer.appendChild(messageElement);
    scrollToBottom();
}


function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// --------------------------------------------------
// Loading State
// --------------------------------------------------

function showLoading() {
    const loadingElement = document.createElement("div");

    loadingElement.id = "loading-message";
    loadingElement.className = "message assistant-message";

    loadingElement.innerHTML = `
        <div class="message-label">EduAgent AI</div>
        <div class="message-content">
            <div class="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div>Thinking and selecting the right tool...</div>
        </div>
    `;

    chatContainer.appendChild(loadingElement);
    scrollToBottom();
}


function hideLoading() {
    const loadingElement = document.getElementById("loading-message");

    if (loadingElement) {
        loadingElement.remove();
    }
}


// --------------------------------------------------
// Agent Activity
// --------------------------------------------------

function renderAgentActivity(agentResult) {
    if (!activityContainer) {
        return;
    }

    const toolName = getWorkflowToolName(agentResult);

    activityContainer.innerHTML = `
        <div class="activity-header">
            <span>Agent Activity</span>
        </div>

        <div class="activity-step completed">
            <span class="activity-icon">👤</span>
            <span>Understanding your request</span>
            <span class="activity-status">Step 1</span>
        </div>

        <div class="activity-step completed">
            <span class="activity-icon">🧠</span>
            <span>Detecting user intent</span>
            <span class="activity-status">Step 2</span>
        </div>

        <div class="activity-step completed">
            <span class="activity-icon">🔧</span>
            <span>Selecting the appropriate tool</span>
            <span class="activity-status">Step 3</span>
        </div>

        <div class="activity-step completed">
            <span class="activity-icon">⚙️</span>
            <span>Running ${escapeHtml(toolName)}</span>
            <span class="activity-status">Step 4</span>
        </div>

        <div class="activity-step completed">
            <span class="activity-icon">✅</span>
            <span>Response completed</span>
            <span class="activity-status">Step 5</span>
        </div>
    `;
}


// --------------------------------------------------
// Workflow
// --------------------------------------------------

function getWorkflowToolName(agentResult) {
    const action =
        agentResult?.action ||
        agentResult?.tool ||
        agentResult?.agent_result?.action ||
        agentResult?.agent_result?.tool ||
        "";

    const names = {
        study_plan: "Study Plan Tool",
        learning_resources: "Learning Resources Tool",
        calculator: "Calculator Tool",
        web_search: "Web Search Tool",
        general: "General AI"
    };

    return names[action] || "AI Response";
}


function buildWorkflow(agentResult) {
    if (!workflowContainer) {
        return;
    }

    const toolName = getWorkflowToolName(agentResult);

    workflowContainer.innerHTML = `
        <div class="workflow-title">
            Agent Workflow
        </div>

        <div class="workflow-flow">

            <div class="workflow-node completed">
                <div class="workflow-icon">👤</div>
                <div class="workflow-label">User Request</div>
                <div class="workflow-status">✓</div>
            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-node completed">
                <div class="workflow-icon">🧠</div>
                <div class="workflow-label">AI Brain</div>
                <div class="workflow-status">✓</div>
            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-node completed">
                <div class="workflow-icon">🔀</div>
                <div class="workflow-label">Tool Router</div>
                <div class="workflow-status">✓</div>
            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-branches">

                ${createBranchTool(
                    "study_plan",
                    "📚",
                    "Study Plan",
                    toolName
                )}

                ${createBranchTool(
                    "calculator",
                    "🧮",
                    "Calculator",
                    toolName
                )}

                ${createBranchTool(
                    "learning_resources",
                    "📖",
                    "Resources",
                    toolName
                )}

                ${createBranchTool(
                    "web_search",
                    "🌐",
                    "Web Search",
                    toolName
                )}

                ${createBranchTool(
                    "general",
                    "🤖",
                    "General AI",
                    toolName
                )}

            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-node completed">
                <div class="workflow-icon">⚙️</div>
                <div class="workflow-label">Tool Result</div>
                <div class="workflow-status">✓</div>
            </div>

            <div class="workflow-arrow">→</div>

            <div class="workflow-node completed">
                <div class="workflow-icon">💬</div>
                <div class="workflow-label">Response</div>
                <div class="workflow-status">✓</div>
            </div>

        </div>

        <div class="workflow-footer">
            Workflow completed successfully • ${escapeHtml(toolName)}
        </div>
    `;
}


function createBranchTool(action, icon, label, activeToolName) {
    const isActive = activeToolName === getToolDisplayName(action);

    return `
        <div class="branch-tool ${isActive ? "active" : ""}">
            <div class="branch-icon">${icon}</div>
            <div class="branch-label">${label}</div>
            ${isActive ? '<div class="branch-check">✓</div>' : ""}
        </div>
    `;
}


function getToolDisplayName(action) {
    const names = {
        study_plan: "Study Plan Tool",
        calculator: "Calculator Tool",
        learning_resources: "Learning Resources Tool",
        web_search: "Web Search Tool",
        general: "General AI"
    };

    return names[action] || "";
}


function setBranchNodeState(action) {
    const nodes = document.querySelectorAll(".branch-tool");

    nodes.forEach((node) => {
        node.classList.remove("active");
    });
}


function runWorkflowAnimation(agentResult) {
    buildWorkflow(agentResult);
}


// --------------------------------------------------
// Study Plan Renderer
// --------------------------------------------------

function renderStudyPlan(agentResult) {
    const toolResult =
        agentResult.tool_result ||
        agentResult.agent_result?.tool_result ||
        agentResult;

    const topic = toolResult.topic || "Study Topic";
    const days = toolResult.days || 0;
    const plan = Array.isArray(toolResult.plan)
        ? toolResult.plan
        : [];

    let html = `
        <div class="response-card study-plan-card">

            <div class="response-card-header">
                <div>
                    <div class="response-card-title">
                        Study Plan
                    </div>

                    <div class="response-card-subtitle">
                        ${escapeHtml(topic)} • ${days} days
                    </div>
                </div>

                <div class="response-card-icon">
                    📚
                </div>
            </div>

            <div class="study-plan-list">
    `;

    plan.forEach((item) => {
        html += `
            <div class="study-day">
                <div class="study-day-number">
                    Day ${escapeHtml(item.day)}
                </div>

                <div class="study-day-content">
                    <div class="study-day-focus">
                        ${escapeHtml(item.focus)}
                    </div>

                    <div class="study-day-task">
                        ${escapeHtml(item.task)}
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    addAssistantMessage(html);
}


// --------------------------------------------------
// Learning Resources Renderer
// --------------------------------------------------

function renderLearningResources(agentResult) {
    const toolResult =
        agentResult.tool_result ||
        agentResult.agent_result?.tool_result ||
        agentResult;

    const topic = toolResult.topic || "Learning Topic";

    const resources = Array.isArray(toolResult.resources)
        ? toolResult.resources
        : [];

    let html = `
        <div class="response-card resources-card">

            <div class="response-card-header">
                <div>
                    <div class="response-card-title">
                        Learning Resources
                    </div>

                    <div class="response-card-subtitle">
                        Resources for ${escapeHtml(topic)}
                    </div>
                </div>

                <div class="response-card-icon">
                    📖
                </div>
            </div>

            <div class="resource-list">
    `;

    resources.forEach((resource) => {
        html += `
            <div class="resource-item">

                <div class="resource-icon">
                    ${getResourceIcon(resource.type)}
                </div>

                <div class="resource-content">

                    <div class="resource-title">
                        ${escapeHtml(resource.title)}
                    </div>

                    <div class="resource-purpose">
                        ${escapeHtml(resource.purpose)}
                    </div>

                </div>

            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    addAssistantMessage(html);
}


function getResourceIcon(type) {
    const icons = {
        fundamentals: "🧠",
        practice: "✏️",
        revision: "🔁",
        project: "🛠️"
    };

    return icons[type] || "📘";
}


// --------------------------------------------------
// Calculator Renderer
// --------------------------------------------------

function renderCalculator(agentResult) {
    const toolResult =
        agentResult.tool_result ||
        agentResult.agent_result?.tool_result ||
        agentResult;

    const expression = toolResult.expression || "";
    const result = toolResult.result;

    let html = `
        <div class="response-card calculator-card">

            <div class="response-card-header">
                <div>
                    <div class="response-card-title">
                        Calculator
                    </div>

                    <div class="response-card-subtitle">
                        Mathematical calculation
                    </div>
                </div>

                <div class="response-card-icon">
                    🧮
                </div>
            </div>

            <div class="calculator-expression">
                ${escapeHtml(expression)}
            </div>

            <div class="calculator-equals">
                =
            </div>

            <div class="calculator-result">
                ${escapeHtml(result)}
            </div>

        </div>
    `;

    addAssistantMessage(html);
}


// --------------------------------------------------
// Web Search Renderer
// --------------------------------------------------

function renderWebSearch(agentResult) {
    const toolResult =
        agentResult.tool_result ||
        agentResult.agent_result?.tool_result ||
        {};

    const query = toolResult.query || agentResult.query || "";

    const results = Array.isArray(toolResult.results)
        ? toolResult.results
        : [];

    let summary = toolResult.answer || "";

    if (!summary && agentResult.response) {
        try {
            const parsed = JSON.parse(agentResult.response);

            summary =
                parsed.summary ||
                parsed.answer ||
                parsed.response ||
                "";
        } catch {
            summary = agentResult.response;
        }
    }

    summary = cleanWebText(summary);

    let html = `
        <div class="response-card web-search-card">

            <div class="response-card-header">

                <div>
                    <div class="response-card-title">
                        AI Research Summary
                    </div>

                    <div class="response-card-subtitle">
                        Live web research via Tavily
                    </div>
                </div>

                <div class="response-card-icon">
                    🌐
                </div>

            </div>

            <div class="search-query">
                <strong>Query:</strong>
                ${escapeHtml(query)}
            </div>
    `;

    if (summary) {
        html += `
            <div class="search-summary">
                ${escapeHtml(summary)}
            </div>
        `;
    }

    if (results.length > 0) {
        html += `
            <div class="sources-heading">
                Grounded Sources
            </div>

            <div class="source-list">
        `;

        results.forEach((source, index) => {
            const title =
                cleanWebText(
                    source.title ||
                    `Source ${index + 1}`
                );

            const content =
                cleanWebText(
                    source.content ||
                    source.snippet ||
                    ""
                );

            const url = source.url || "";

            const relevance =
                source.score !== undefined
                    ? `${Math.round(Number(source.score) * 100)}% relevance`
                    : "Source";

            const safeUrl = isSafeUrl(url)
                ? url
                : "";

            html += `
                <div class="source-card">

                    <div class="source-number">
                        ${index + 1}
                    </div>

                    <div class="source-main">

                        <div class="source-title">
                            ${escapeHtml(title)}
                        </div>

                        <div class="source-content">
                            ${escapeHtml(
                                truncateText(content, 240)
                            )}
                        </div>

                        <div class="source-footer">

                            <span class="source-relevance">
                                ${escapeHtml(relevance)}
                            </span>

                            ${
                                safeUrl
                                    ? `
                                        <a
                                            class="source-link"
                                            href="${escapeAttribute(safeUrl)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Source
                                        </a>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                </div>
            `;
        });

        html += `
            </div>
        `;
    } else {
        html += `
            <div class="search-empty">
                No individual sources were returned for this search.
            </div>
        `;
    }

    html += `
        </div>
    `;

    addAssistantMessage(html);
}


// --------------------------------------------------
// General AI Renderer
// --------------------------------------------------

function renderGeneralResponse(agentResult) {
    const text = getResponseText(agentResult);

    const formattedText = escapeHtml(text)
        .replace(/\n/g, "<br>");

    addAssistantMessage(`
        <div class="response-card general-card">

            <div class="response-card-header">

                <div>
                    <div class="response-card-title">
                        EduAgent AI
                    </div>

                    <div class="response-card-subtitle">
                        AI-powered educational response
                    </div>
                </div>

                <div class="response-card-icon">
                    🤖
                </div>

            </div>

            <div class="general-response">
                ${formattedText}
            </div>

        </div>
    `);
}


// --------------------------------------------------
// Response Router
// --------------------------------------------------

function renderResponse(agentResult) {
    const action =
        agentResult?.action ||
        agentResult?.agent_result?.action ||
        agentResult?.tool ||
        agentResult?.agent_result?.tool ||
        "";

    switch (action) {

        case "study_plan":
            renderStudyPlan(agentResult);
            break;

        case "learning_resources":
            renderLearningResources(agentResult);
            break;

        case "calculator":
            renderCalculator(agentResult);
            break;

        case "web_search":
            renderWebSearch(agentResult);
            break;

        case "general":
            renderGeneralResponse(agentResult);
            break;

        default:
            renderGeneralResponse(agentResult);
            break;
    }
}


// --------------------------------------------------
// API Request
// --------------------------------------------------

async function sendMessage(prompt) {
    if (!prompt || !prompt.trim()) {
        return;
    }

    const cleanPrompt = prompt.trim();

    addUserMessage(cleanPrompt);

    conversationHistory.push({
        role: "user",
        content: cleanPrompt
    });

    promptInput.value = "";
    showLoading();

    if (askButton) {
        askButton.disabled = true;
    }

    try {
        const response = await fetch(
            `${API_URL}/alexa-simulate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_input: cleanPrompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                data.message ||
                `Request failed with status ${response.status}`
            );
        }

        hideLoading();

        const agentResult =
            data.agent_result || data;

        conversationHistory.push({
            role: "assistant",
            content: getResponseText(agentResult)
        });

        renderResponse(agentResult);

        renderAgentActivity(agentResult);

        runWorkflowAnimation(agentResult);

    } catch (error) {

        hideLoading();

        console.error(
            "EduAgent request failed:",
            error
        );

        addAssistantMessage(`
            <div class="response-card error-card">

                <div class="response-card-header">

                    <div>
                        <div class="response-card-title">
                            Something went wrong
                        </div>

                        <div class="response-card-subtitle">
                            EduAgent could not complete the request.
                        </div>
                    </div>

                    <div class="response-card-icon">
                        ⚠️
                    </div>

                </div>

                <div class="error-message">
                    ${escapeHtml(error.message)}
                </div>

            </div>
        `);

    } finally {

        if (askButton) {
            askButton.disabled = false;
        }

        promptInput.focus();
    }
}


// --------------------------------------------------
// Quick Actions
// --------------------------------------------------

function setupQuickActions() {
    const quickButtons =
        document.querySelectorAll(
            "[data-prompt]"
        );

    quickButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.getAttribute(
                        "data-prompt"
                    );

                if (prompt) {
                    sendMessage(prompt);
                }
            }
        );

    });
}


// --------------------------------------------------
// Voice Input
// --------------------------------------------------

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if (voiceButton) {
            voiceButton.style.display = "none";
        }

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {

        isListening = true;

        if (voiceButton) {
            voiceButton.classList.add("listening");
            voiceButton.setAttribute(
                "aria-label",
                "Listening"
            );
        }
    };


    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        promptInput.value = transcript;
    };


    recognition.onerror = (event) => {

        console.error(
            "Voice recognition error:",
            event.error
        );

        isListening = false;

        if (voiceButton) {
            voiceButton.classList.remove(
                "listening"
            );
        }
    };


    recognition.onend = () => {

        isListening = false;

        if (voiceButton) {
            voiceButton.classList.remove(
                "listening"
            );

            voiceButton.setAttribute(
                "aria-label",
                "Voice input"
            );
        }
    };


    voiceButton.addEventListener(
        "click",
        () => {

            if (isListening) {
                recognition.stop();
                return;
            }

            recognition.start();
        }
    );
}


// --------------------------------------------------
// Clear Conversation
// --------------------------------------------------

function clearConversation() {

    conversationHistory = [];

    chatContainer.innerHTML = "";

    if (activityContainer) {
        activityContainer.innerHTML = "";
    }

    if (workflowContainer) {
        workflowContainer.innerHTML = "";
    }

    promptInput.value = "";

    promptInput.focus();
}


// --------------------------------------------------
// Event Listeners
// --------------------------------------------------

askButton.addEventListener(
    "click",
    () => {
        sendMessage(promptInput.value);
    }
);


promptInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendMessage(
                promptInput.value
            );
        }
    }
);


if (clearButton) {
    clearButton.addEventListener(
        "click",
        clearConversation
    );
}


// --------------------------------------------------
// Initialization
// --------------------------------------------------

setupQuickActions();
setupVoiceRecognition();

console.log(
    "EduAgent AI frontend initialized."
);











      

