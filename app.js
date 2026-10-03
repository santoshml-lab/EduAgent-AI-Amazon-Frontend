const API_URL = "https://eduagent-ai-amazon.onrender.com";

let conversationHistory = [];
let isListening = false;
let recognition = null;

const root = document.getElementById("root");


// ==================================================
// MAIN APPLICATION UI
// ==================================================

root.innerHTML = `
    <div class="app">

        <div class="card">

            <div class="badge">
                AMAZON DEVELOPER HACKATHON 2026
            </div>

            <div class="assistant-circle">
                AI
            </div>

            <div class="status">
                ● EduAgent AI Online
            </div>

            <h1>EduAgent AI</h1>

            <div class="subtitle">
                Alexa+ simulated educational AI assistant
            </div>

            <div class="voice-area">

                <button
                    id="voice-button"
                    class="voice-button"
                    type="button"
                    aria-label="Voice input"
                >
                    🎙️
                </button>

                <span>
                    Tap to speak
                </span>

            </div>

            <div class="input-area">

                <input
                    id="prompt-input"
                    type="text"
                    placeholder="Ask EduAgent anything..."
                    autocomplete="off"
                >

                <button
                    id="ask-button"
                    type="button"
                >
                    Ask
                </button>

            </div>

            <div class="tool-indicator">
                AI Brain • Planner • Tool Router • Agentic Tools
            </div>


            <!-- Quick Actions -->

            <div class="quick-actions">

                <div class="quick-title">
                    Try a quick action
                </div>

                <div class="quick-buttons">

                    <button
                        class="quick-button"
                        data-prompt="Create a 5 day study plan for mathematics"
                        type="button"
                    >
                        📚 Create Study Plan
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="Calculate 125 * 48"
                        type="button"
                    >
                        🧮 Calculate
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="Give me some resources to learn Python"
                        type="button"
                    >
                        📖 Learning Resources
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="Search the latest AI news"
                        type="button"
                    >
                        🌐 Search AI News
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="I have a mathematics exam in 7 days. Create a study plan and give me learning resources."
                        type="button"
                    >
                        🤖 Multi-Agent Study
                    </button>

                </div>

            </div>


            <!-- Response -->

            <div
                id="response"
                class="response"
            >
                <h3>Welcome to EduAgent AI</h3>

                <p>
                    Ask a question or choose a quick action to see
                    the agentic workflow in action.
                </p>
            </div>


            <!-- Conversation -->

            <div
                id="conversation"
                class="conversation"
            >
            </div>


            <!-- Agent Activity -->

            <div
                id="agent-activity"
                class="agent-workflow"
            >
            </div>


            <!-- Agent Workflow -->

            <div
                id="agent-workflow"
                class="branch-workflow"
            >
            </div>


            <!-- Clear -->

            <div class="conversation-area">

                <button
                    id="clear-button"
                    class="clear-button"
                    type="button"
                >
                    Clear Conversation
                </button>

            </div>

        </div>

    </div>
`;


// ==================================================
// DOM REFERENCES
// ==================================================

const responseContainer =
    document.getElementById("response");

const conversationContainer =
    document.getElementById("conversation");

const promptInput =
    document.getElementById("prompt-input");

const askButton =
    document.getElementById("ask-button");

const clearButton =
    document.getElementById("clear-button");

const voiceButton =
    document.getElementById("voice-button");

const workflowContainer =
    document.getElementById("agent-workflow");

const activityContainer =
    document.getElementById("agent-activity");


// ==================================================
// UTILITY FUNCTIONS
// ==================================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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


// ==================================================
// RESPONSE TEXT
// ==================================================

function getResponseText(agentResult) {

    if (!agentResult) {
        return "";
    }


    const action =
        agentResult.action ||
        agentResult.tool ||
        "";


    const toolResult =
        agentResult.tool_result ||
        {};


    // ----------------------------------------------
    // MULTI-TOOL
    // ----------------------------------------------

    if (action === "multi_tool") {

        if (agentResult.response) {

            return String(
                agentResult.response
            );
        }

        const toolResults =
            Array.isArray(
                agentResult.tool_results
            )
                ? agentResult.tool_results
                : [];

        if (toolResults.length > 0) {

            const tools =
                toolResults
                    .map(
                        item =>
                            item.tool
                    )
                    .join(", ");

            return (
                `Completed ${toolResults.length} `
                + `agentic tool steps: ${tools}.`
            );
        }

        return "Multi-tool workflow completed.";
    }


    // ----------------------------------------------
    // STUDY PLAN
    // ----------------------------------------------

    if (action === "study_plan") {

        const topic =
            toolResult.topic ||
            agentResult.topic ||
            "the requested topic";

        const days =
            toolResult.days ||
            agentResult.days ||
            "";

        return (
            `I've created a ${days}-day `
            + `study plan for ${topic}.`
        );
    }


    // ----------------------------------------------
    // LEARNING RESOURCES
    // ----------------------------------------------

    if (action === "learning_resources") {

        const topic =
            toolResult.topic ||
            agentResult.topic ||
            "the requested topic";

        return (
            `I've prepared learning resources `
            + `for ${topic}.`
        );
    }


    // ----------------------------------------------
    // CALCULATOR
    // ----------------------------------------------

    if (action === "calculator") {

        const expression =
            toolResult.expression ||
            agentResult.expression ||
            "";

        const result =
            toolResult.result ??
            agentResult.result;

        return `${expression} = ${result}`;
    }


    // ----------------------------------------------
    // WEB SEARCH
    // ----------------------------------------------

    if (action === "web_search") {

        return (
            toolResult.answer ||
            agentResult.answer ||
            "I've completed the web search and gathered the latest results."
        );
    }


    // ----------------------------------------------
    // RESPONSE FIELD
    // ----------------------------------------------

    if (
        typeof agentResult.response === "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    agentResult.response
                );

            return (
                parsed.summary ||
                parsed.response ||
                parsed.message ||
                agentResult.response
            );

        } catch {

            return agentResult.response;
        }
    }


    if (agentResult.message) {
        return agentResult.message;
    }


    if (
        agentResult.result !== undefined
    ) {

        return String(
            agentResult.result
        );
    }


    return "";
}


// ==================================================
// RESPONSE TYPE
// ==================================================

function getAction(agentResult) {

    return (
        agentResult?.action ||
        agentResult?.tool ||
        ""
    );
}


// ==================================================
// CONVERSATION
// ==================================================

function addConversationMessage(
    role,
    content
) {

    const message =
        document.createElement("div");

    message.className =
        `conversation-message ${role}`;

    const label =
        role === "user"
            ? "You"
            : "EduAgent AI";

    const time =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    message.innerHTML = `
        <div class="message-header">

            <strong>
                ${label}
            </strong>

            <small>
                ${time}
            </small>

        </div>

        <div class="message-content">
            ${content}
        </div>
    `;

    conversationContainer.appendChild(
        message
    );

    conversationContainer.scrollTop =
        conversationContainer.scrollHeight;
}


// ==================================================
// RESPONSE CONTAINER
// ==================================================

function showResponse(content) {

    responseContainer.innerHTML =
        content;

    responseContainer.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// ==================================================
// STUDY PLAN
// ==================================================

function buildStudyPlanHtml(
    toolResult
) {

    const result =
        toolResult || {};

    const topic =
        result.topic ||
        "Study Topic";

    const days =
        result.days ||
        0;

    const plan =
        Array.isArray(result.plan)
            ? result.plan
            : [];

    let html = `
        <span class="tool-label">
            📚 Study Plan Tool
        </span>

        <h3>
            ${escapeHtml(topic)}
            — ${escapeHtml(days)} Day Plan
        </h3>
    `;


    plan.forEach((item) => {

        html += `
            <div class="plan-day">

                <strong>
                    Day ${escapeHtml(item.day)}
                </strong>

                <p>
                    ${escapeHtml(item.focus)}
                </p>

                <small>
                    ${escapeHtml(item.task)}
                </small>

            </div>
        `;
    });


    return html;
}


function renderStudyPlan(agentResult) {

    const result =
        agentResult.tool_result ||
        agentResult;

    showResponse(
        buildStudyPlanHtml(result)
    );
}


// ==================================================
// LEARNING RESOURCES
// ==================================================

function buildLearningResourcesHtml(
    toolResult
) {

    const result =
        toolResult || {};

    const topic =
        result.topic ||
        "Learning Topic";

    const resources =
        Array.isArray(result.resources)
            ? result.resources
            : [];

    let html = `
        <span class="tool-label">
            📖 Learning Resources Tool
        </span>

        <h3>
            Resources for ${escapeHtml(topic)}
        </h3>
    `;


    resources.forEach((resource) => {

        html += `
            <div class="resource-item">

                <strong>
                    ${escapeHtml(resource.title)}
                </strong>

                <p>
                    ${escapeHtml(resource.purpose)}
                </p>

            </div>
        `;
    });


    return html;
}


function renderLearningResources(
    agentResult
) {

    const result =
        agentResult.tool_result ||
        agentResult;

    showResponse(
        buildLearningResourcesHtml(result)
    );
}


// ==================================================
// CALCULATOR
// ==================================================

function renderCalculator(
    agentResult
) {

    const result =
        agentResult.tool_result ||
        agentResult;

    const expression =
        result.expression ||
        "";

    const value =
        result.result;


    showResponse(`
        <span class="tool-label">
            🧮 Calculator Tool
        </span>

        <h3>
            Calculation Result
        </h3>

        <div class="plan-day">

            <strong>
                ${escapeHtml(expression)}
            </strong>

            <p>
                = ${escapeHtml(value)}
            </p>

        </div>
    `);
}


// ==================================================
// WEB SEARCH
// ==================================================

function renderWebSearch(
    agentResult
) {

    const result =
        agentResult.tool_result ||
        agentResult;

    const query =
        result.query ||
        "";

    const sources =
        Array.isArray(result.results)
            ? result.results
            : [];

    let summary =
        result.answer ||
        "";


    if (
        !summary &&
        agentResult.response
    ) {

        try {

            const parsed =
                JSON.parse(
                    agentResult.response
                );

            summary =
                parsed.summary ||
                parsed.answer ||
                parsed.response ||
                "";

        } catch {

            summary =
                agentResult.response;
        }
    }


    summary =
        cleanWebText(summary);


    let html = `
        <span class="tool-label">
            🌐 Web Search Tool
        </span>

        <h3>
            AI Research Summary
        </h3>

        <div class="web-search-query">
            <strong>Query:</strong>
            ${escapeHtml(query)}
        </div>
    `;


    if (summary) {

        html += `
            <div class="web-search-summary">

                <div class="web-summary-title">
                    Grounded Research
                </div>

                <p>
                    ${escapeHtml(summary)}
                </p>

            </div>
        `;
    }


    if (sources.length > 0) {

        html += `
            <div class="web-sources-title">
                Grounded Sources
            </div>

            <div class="web-sources">
        `;


        sources.forEach(
            (source, index) => {

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

                const url =
                    source.url ||
                    "";

                const score =
                    source.score !== undefined
                        ? `${Math.round(
                            Number(source.score) * 100
                        )}% relevance`
                        : "Source";


                const safeUrl =
                    isSafeUrl(url)
                        ? url
                        : "";


                html += `
                    <div class="web-source-card">

                        <div class="web-source-number">
                            ${index + 1}
                        </div>

                        <div class="web-source-content">

                            <strong>
                                ${escapeHtml(title)}
                            </strong>

                            <p>
                                ${escapeHtml(
                                    truncateText(
                                        content,
                                        240
                                    )
                                )}
                            </p>

                            <div class="web-source-meta">

                                <span>
                                    ${escapeHtml(score)}
                                </span>

                                ${
                                    safeUrl
                                        ? `
                                            <a
                                                href="${escapeHtml(
                                                    safeUrl
                                                )}"
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
            }
        );


        html += `
            </div>
        `;

    } else {

        html += `
            <div class="web-search-summary">

                <p>
                    No individual sources were returned
                    for this search.
                </p>

            </div>
        `;
    }


    showResponse(html);
}


// ==================================================
// MULTI-TOOL RESPONSE
// ==================================================

function renderMultiTool(
    agentResult
) {

    const toolResults =
        Array.isArray(
            agentResult.tool_results
        )
            ? agentResult.tool_results
            : [];


    let html = `

        <span class="tool-label">
            🤖 Multi-Agent Workflow
        </span>

        <h3>
            Agentic Learning Workflow Completed
        </h3>

        <p>
            EduAgent planned and executed
            multiple tools for your request.
        </p>

    `;


    toolResults.forEach(
        (item, index) => {

            const tool =
                item.tool || "";

            const result =
                item.result || {};


            html += `

                <div class="plan-day">

                    <strong>
                        Step ${index + 1} —
                        ${escapeHtml(
                            getToolDisplayName(tool)
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            getToolStatus(result)
                        )}
                    </p>

                </div>

            `;


            if (
                tool === "study_plan"
            ) {

                html += `
                    <div class="multi-tool-section">
                        ${buildStudyPlanHtml(result)}
                    </div>
                `;
            }


            if (
                tool === "learning_resources"
            ) {

                html += `
                    <div class="multi-tool-section">
                        ${buildLearningResourcesHtml(result)}
                    </div>
                `;
            }


            if (
                tool === "calculator"
            ) {

                const expression =
                    result.expression ||
                    "";

                const value =
                    result.result;


                html += `

                    <div class="multi-tool-section">

                        <span class="tool-label">
                            🧮 Calculator
                        </span>

                        <p>
                            ${escapeHtml(
                                expression
                            )}
                            =
                            ${escapeHtml(
                                value
                            )}
                        </p>

                    </div>

                `;
            }


            if (
                tool === "web_search"
            ) {

                const summary =
                    cleanWebText(
                        result.answer ||
                        ""
                    );


                html += `

                    <div class="multi-tool-section">

                        <span class="tool-label">
                            🌐 Web Research
                        </span>

                        <p>
                            ${escapeHtml(
                                summary ||
                                "Web research completed."
                            )}
                        </p>

                    </div>

                `;
            }

        }
    );


    if (agentResult.response) {

        html += `

            <div class="web-search-summary">

                <div class="web-summary-title">
                    Final Agent Response
                </div>

                <p>
                    ${formatAgentText(
                        agentResult.response
                    )}
                </p>

            </div>

        `;
    }


    showResponse(html);
}


function getToolDisplayName(
    tool
) {

    const names = {

        study_plan:
            "Study Plan Tool",

        learning_resources:
            "Learning Resources Tool",

        calculator:
            "Calculator Tool",

        web_search:
            "Web Search Tool"

    };


    return (
        names[tool] ||
        "Agent Tool"
    );
}


function getToolStatus(
    result
) {

    if (
        result &&
        result.error
    ) {

        return (
            "Tool execution returned an error."
        );
    }


    if (
        result &&
        result.message
    ) {

        return result.message;
    }


    return "Tool executed successfully.";
}


function formatAgentText(
    text
) {

    return escapeHtml(
        String(text || "")
    ).replace(
        /\n/g,
        "<br>"
    );
}


// ==================================================
// GENERAL AI
// ==================================================

function renderGeneralResponse(
    agentResult
) {

    const text =
        getResponseText(agentResult);

    const formatted =
        formatAgentText(text);


    showResponse(`

        <span class="tool-label">
            🤖 General AI
        </span>

        <h3>
            EduAgent AI
        </h3>

        <p>
            ${formatted}
        </p>

    `);
}


// ==================================================
// RESPONSE ROUTER
// ==================================================

function renderResponse(
    agentResult
) {

    const action =
        getAction(agentResult);


    switch (action) {

        case "study_plan":

            renderStudyPlan(
                agentResult
            );

            break;


        case "learning_resources":

            renderLearningResources(
                agentResult
            );

            break;


        case "calculator":

            renderCalculator(
                agentResult
            );

            break;


        case "web_search":

            renderWebSearch(
                agentResult
            );

            break;


        case "multi_tool":

            renderMultiTool(
                agentResult
            );

            break;


        case "general":

        default:

            renderGeneralResponse(
                agentResult
            );

            break;
    }
}


// ==================================================
// AGENT ACTIVITY
// ==================================================

function renderAgentActivity(
    agentResult
) {

    const action =
        getAction(agentResult);


    if (
        action === "multi_tool"
    ) {

        const toolResults =
            Array.isArray(
                agentResult.tool_results
            )
                ? agentResult.tool_results
                : [];


        const toolNames =
            toolResults
                .map(
                    item =>
                        getToolDisplayName(
                            item.tool
                        )
                )
                .join(" + ");


        activityContainer.innerHTML = `

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

                    <small>
                        Completed ✓
                    </small>

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

                    <small>
                        Intent detected ✓
                    </small>

                </div>

                <div class="branch-arrow">
                    ↓
                </div>

                <div class="branch-node selected">

                    <div class="branch-icon">
                        📋
                    </div>

                    <strong>
                        Planner
                    </strong>

                    <small>
                        ${escapeHtml(
                            `${toolResults.length} steps`
                        )}
                    </small>

                </div>

            </div>

            <div class="branch-status">
                Multi-tool plan executed:
                ${escapeHtml(toolNames)}
            </div>
        `;

        return;
    }


    const toolName =
        getWorkflowToolName(
            agentResult
        );


    activityContainer.innerHTML = `

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

                <small>
                    Completed ✓
                </small>

            </div>

            <div class="branch-arrow">
                ↓
            </div>

            <div class="branch-node completed">

                <div class="branch-icon">
                    🧠
                </div>

                <strong>
                    Detecting Intent
                </strong>

                <small>
                    Completed ✓
                </small>

            </div>

            <div class="branch-arrow">
                ↓
            </div>

            <div class="branch-node selected">

                <div class="branch-icon">
                    🔧
                </div>

                <strong>
                    Tool Router
                </strong>

                <small>
                    ${escapeHtml(toolName)}
                </small>

            </div>

        </div>

        <div class="branch-status">
            Agent execution completed successfully.
        </div>
    `;
}


// ==================================================
// WORKFLOW TOOL NAME
// ==================================================

function getWorkflowToolName(
    agentResult
) {

    const action =
        getAction(agentResult);


    const names = {

        study_plan:
            "Study Plan Tool",

        learning_resources:
            "Learning Resources Tool",

        calculator:
            "Calculator Tool",

        web_search:
            "Web Search Tool",

        general:
            "General AI",

        multi_tool:
            "Multi-Agent Planner"

    };


    return (
        names[action] ||
        "AI Response"
    );
}


// ==================================================
// MULTI-TOOL WORKFLOW
// ==================================================

function buildMultiToolWorkflow(
    agentResult
) {

    const toolResults =
        Array.isArray(
            agentResult.tool_results
        )
            ? agentResult.tool_results
            : [];


    const toolActions =
        toolResults.map(
            item => item.tool
        );


    let toolNodes = "";


    toolResults.forEach(
        (item, index) => {

            const tool =
                item.tool;


            toolNodes += `

                <div class="branch-tool">

                    <div
                        class="branch-node selected"
                    >

                        <div class="branch-icon">
                            ${getToolIcon(tool)}
                        </div>

                        <strong>
                            ${escapeHtml(
                                getToolShortName(
                                    tool
                                )
                            )}
                        </strong>

                        <small>
                            Step ${index + 1} ✓
                        </small>

                    </div>

                </div>

            `;
        }
    );


    const toolSummary =
        toolActions
            .map(
                tool =>
                    getToolDisplayName(tool)
            )
            .join(" + ");


    workflowContainer.innerHTML = `

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

                <small>
                    Completed ✓
                </small>

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

                <small>
                    Intent detected ✓
                </small>

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

                <small>
                    ${toolResults.length} tool steps ✓
                </small>

            </div>

            <div class="branch-arrow">
                ↓
            </div>


            <div class="branch-tools">

                ${toolNodes}

            </div>


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

                <small>
                    Results combined ✓
                </small>

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

                <small>
                    Completed ✓
                </small>

            </div>

        </div>

        <div class="branch-status">
            Multi-agent workflow completed •
            ${escapeHtml(toolSummary)}
        </div>
    `;
}


function getToolIcon(
    tool
) {

    const icons = {

        study_plan:
            "📚",

        learning_resources:
            "📖",

        calculator:
            "🧮",

        web_search:
            "🌐"

    };


    return (
        icons[tool] ||
        "🔧"
    );
}


function getToolShortName(
    tool
) {

    const names = {

        study_plan:
            "Study Plan",

        learning_resources:
            "Resources",

        calculator:
            "Calculator",

        web_search:
            "Web Search"

    };


    return (
        names[tool] ||
        "Tool"
    );
}


// ==================================================
// SINGLE TOOL WORKFLOW
// ==================================================

function buildSingleToolWorkflow(
    agentResult
) {

    const action =
        getAction(agentResult);

    const toolName =
        getWorkflowToolName(
            agentResult
        );


    workflowContainer.innerHTML = `

        <div class="branch-workflow-title">
            Agent Workflow
        </div>

        <div class="branch-main">

            <div class="branch-node completed">

                <div class="branch-icon">
                    👤
                </div>

                <strong>
                    User Request
                </strong>

                <small>
                    Completed ✓
                </small>

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

                <small>
                    Intent detected ✓
                </small>

            </div>

            <div class="branch-arrow">
                ↓
            </div>

            <div class="branch-node completed">

                <div class="branch-icon">
                    🔀
                </div>

                <strong>
                    Tool Router
                </strong>

                <small>
                    Tool selected ✓
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
                    action
                )}

                ${createBranchTool(
                    "calculator",
                    "🧮",
                    "Calculator",
                    action
                )}

                ${createBranchTool(
                    "learning_resources",
                    "📖",
                    "Resources",
                    action
                )}

                ${createBranchTool(
                    "web_search",
                    "🌐",
                    "Web Search",
                    action
                )}

                ${createBranchTool(
                    "general",
                    "🤖",
                    "General AI",
                    action
                )}

            </div>

            <div class="branch-arrow">
                ↓
            </div>

            <div class="branch-node completed">

                <div class="branch-icon">
                    ⚙️
                </div>

                <strong>
                    Tool Result
                </strong>

                <small>
                    ${escapeHtml(toolName)}
                </small>

            </div>

            <div class="branch-arrow">
                ↓
            </div>

            <div class="branch-node completed">

                <div class="branch-icon">
                    💬
                </div>

                <strong>
                    Response
                </strong>

                <small>
                    Completed ✓
                </small>

            </div>

        </div>

        <div class="branch-status">
            Workflow completed successfully •
            ${escapeHtml(toolName)}
        </div>
    `;
}


function createBranchTool(
    action,
    icon,
    label,
    selectedAction
) {

    const selected =
        action === selectedAction;


    return `

        <div class="branch-tool">

            <div
                class="branch-node ${
                    selected
                        ? "selected"
                        : "pending"
                }"
            >

                <div class="branch-icon">
                    ${icon}
                </div>

                <strong>
                    ${label}
                </strong>

                <small>
                    ${
                        selected
                            ? "Selected ✓"
                            : "Available"
                    }
                </small>

            </div>

        </div>
    `;
}


// ==================================================
// BUILD WORKFLOW ROUTER
// ==================================================

function buildWorkflow(
    agentResult
) {

    const action =
        getAction(agentResult);


    if (
        action === "multi_tool"
    ) {

        buildMultiToolWorkflow(
            agentResult
        );

        return;
    }


    buildSingleToolWorkflow(
        agentResult
    );
}


// ==================================================
// API REQUEST
// ==================================================

async function sendMessage(
    prompt
) {

    const cleanPrompt =
        String(prompt || "").trim();


    if (!cleanPrompt) {
        return;
    }


    addConversationMessage(
        "user",
        escapeHtml(cleanPrompt)
    );


    conversationHistory.push({
        role: "user",
        content: cleanPrompt
    });


    promptInput.value = "";

    askButton.disabled = true;

    askButton.textContent =
        "Thinking...";


    showResponse(`

        <span class="tool-label">
            🧠 AI Brain
        </span>

        <h3>
            Processing your request...
        </h3>

        <p>
            EduAgent is understanding your request,
            planning the required tools,
            and executing the agentic workflow.
        </p>

    `);


    try {

        const response =
            await fetch(
                `${API_URL}/alexa-simulate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        user_input:
                            cleanPrompt
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                `Request failed with status ${response.status}`
            );
        }


        const agentResult =
            data.agent_result ||
            data;


        // Render main result

        renderResponse(
            agentResult
        );


        // Render activity

        renderAgentActivity(
            agentResult
        );


        // Render workflow

        buildWorkflow(
            agentResult
        );


        // Conversation text

        const assistantText =
            getResponseText(
                agentResult
            );


        conversationHistory.push({
            role: "assistant",
            content:
                assistantText
        });


        addConversationMessage(
            "assistant",
            escapeHtml(
                assistantText ||
                "Response completed."
            ).replace(
                /\n/g,
                "<br>"
            )
        );


    } catch (error) {

        console.error(
            "EduAgent request failed:",
            error
        );


        showResponse(`

            <span class="tool-label">
                ⚠️ Error
            </span>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHtml(
                    error.message
                )}
            </p>

        `);

    } finally {

        askButton.disabled =
            false;

        askButton.textContent =
            "Ask";

        promptInput.focus();
    }
}


// ==================================================
// QUICK ACTIONS
// ==================================================

function setupQuickActions() {

    const buttons =
        document.querySelectorAll(
            "[data-prompt]"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const prompt =
                        button.getAttribute(
                            "data-prompt"
                        );

                    sendMessage(
                        prompt
                    );
                }
            );
        }
    );
}


// ==================================================
// VOICE RECOGNITION
// ==================================================

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        voiceButton.style.display =
            "none";

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.lang =
        "en-US";


    recognition.onstart = () => {

        isListening = true;

        voiceButton.classList.add(
            "listening"
        );

        voiceButton.textContent =
            "🔴";
    };


    recognition.onresult = (
        event
    ) => {

        const transcript =
            event.results[0][0]
                .transcript;

        promptInput.value =
            transcript;
    };


    recognition.onerror = (
        event
    ) => {

        console.error(
            "Voice recognition error:",
            event.error
        );
    };


    recognition.onend = () => {

        isListening = false;

        voiceButton.classList.remove(
            "listening"
        );

        voiceButton.textContent =
            "🎙️";
    };


    voiceButton.addEventListener(
        "click",
        () => {

            if (isListening) {

                recognition.stop();

                return;
            }


            try {

                recognition.start();

            } catch (error) {

                console.error(
                    "Voice start error:",
                    error
                );
            }
        }
    );
}


// ==================================================
// CLEAR CONVERSATION
// ==================================================

function clearConversation() {

    conversationHistory = [];

    conversationContainer.innerHTML =
        "";


    responseContainer.innerHTML = `

        <h3>
            Welcome to EduAgent AI
        </h3>

        <p>
            Ask a question or choose a quick
            action to see the agentic workflow
            in action.
        </p>

    `;


    activityContainer.innerHTML =
        "";

    workflowContainer.innerHTML =
        "";

    promptInput.value =
        "";

    promptInput.focus();
}


// ==================================================
// EVENT LISTENERS
// ==================================================

askButton.addEventListener(
    "click",
    () => {

        sendMessage(
            promptInput.value
        );
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


clearButton.addEventListener(
    "click",
    clearConversation
);


// ==================================================
// INITIALIZATION
// ==================================================

setupQuickActions();

setupVoiceRecognition();

console.log(
    "EduAgent AI multi-agent frontend initialized successfully."
);











      

