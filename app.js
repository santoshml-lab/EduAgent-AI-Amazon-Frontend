const API_URL =
    "https://eduagent-ai-amazon.onrender.com";

const root =
    document.getElementById("root");

root.innerHTML = `
    <div class="app">
        <div class="card">

            <div class="badge">
                AMAZON DEVELOPER HACKATHON 2026
            </div>

            <h1>EduAgent AI</h1>

            <p class="subtitle">
                Alexa+ Simulated Educational AI Experience
            </p>

            <div
                class="assistant-circle"
                id="assistantCircle"
            >
                AI
            </div>

            <div
                class="status"
                id="status"
            >
                Ready
            </div>

            <div class="voice-area">

                <button
                    class="voice-button"
                    id="voiceButton"
                    type="button"
                >
                    🎙
                </button>

                <span id="voiceStatus">
                    Voice input
                </span>

            </div>

            <div class="input-area">

                <input
                    id="userInput"
                    type="text"
                    placeholder="Ask EduAgent anything..."
                    autocomplete="off"
                >

                <button
                    id="askButton"
                    type="button"
                >
                    Ask EduAgent
                </button>

            </div>

            <div
                class="tool-indicator"
                id="toolIndicator"
            >
                No tool selected
            </div>


            <!-- n8n-style Agent Workflow -->

            <div
                class="agent-workflow"
                id="agentWorkflow"
                style="display:none;"
            >

                <div class="workflow-title">
                    Agent Workflow
                </div>

                <div
                    class="workflow-canvas"
                    id="workflowCanvas"
                ></div>

                <div
                    class="workflow-status"
                    id="workflowStatus"
                >
                    Waiting for request...
                </div>

            </div>


            <!-- Agent Activity -->

            <div
                class="agent-activity"
                id="agentActivity"
                style="display:none;"
            >

                <div class="activity-title">
                    Agent Activity
                </div>

                <div
                    class="activity-list"
                    id="activityList"
                ></div>

            </div>


            <div class="quick-actions">

                <div class="quick-title">
                    Quick Actions
                </div>

                <div class="quick-buttons">

                    <button
                        class="quick-button"
                        data-prompt="Create a 5 day study plan for Python"
                    >
                        📚 5-day Python study plan
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="What are some good resources to learn mathematics?"
                    >
                        📖 Mathematics resources
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="What is 25% of 800?"
                    >
                        🧮 Calculate 25% of 800
                    </button>

                    <button
                        class="quick-button"
                        data-prompt="Explain machine learning in simple words."
                    >
                        🧠 Explain machine learning
                    </button>

                </div>

            </div>


            <div
                class="response"
                id="response"
            >
                <p>
                    Ask EduAgent a question to begin.
                </p>
            </div>


            <div
                class="conversation-area"
                id="conversationArea"
                style="display:none;"
            >

                <button
                    class="clear-button"
                    id="clearButton"
                    type="button"
                >
                    Clear Conversation
                </button>

            </div>


            <div
                class="conversation"
                id="conversation"
            ></div>

        </div>
    </div>
`;


const input =
    document.getElementById("userInput");

const askButton =
    document.getElementById("askButton");

const responseBox =
    document.getElementById("response");

const statusText =
    document.getElementById("status");

const assistantCircle =
    document.getElementById("assistantCircle");

const toolIndicator =
    document.getElementById("toolIndicator");

const conversation =
    document.getElementById("conversation");

const conversationArea =
    document.getElementById("conversationArea");

const clearButton =
    document.getElementById("clearButton");

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");

const agentActivity =
    document.getElementById("agentActivity");

const activityList =
    document.getElementById("activityList");

const agentWorkflow =
    document.getElementById("agentWorkflow");

const workflowCanvas =
    document.getElementById("workflowCanvas");

const workflowStatus =
    document.getElementById("workflowStatus");


function setStatus(
    message,
    color = "#4ade80"
) {

    statusText.textContent =
        message;

    statusText.style.color =
        color;
}


function setToolIndicator(action) {

    const labels = {

        study_plan:
            "📚 Study Plan Tool",

        learning_resources:
            "📖 Learning Resources Tool",

        calculator:
            "🧮 Calculator Tool",

        general:
            "🧠 General AI Reasoning"

    };

    toolIndicator.textContent =
        labels[action] ||
        "No tool selected";
}


function getActivityIcon(stage) {

    const icons = {

        request: "👤",

        intent_detection: "🧠",

        tool_selection: "🔧",

        tool_execution: "⚙️",

        reasoning: "🧠",

        response: "✅",

        error: "❌"

    };

    return icons[stage] || "•";
}


function formatActivityMessage(item) {

    const messages = {

        request:
            "Understanding your request",

        intent_detection:
            "Detecting user intent",

        tool_selection:
            "Selecting the appropriate tool",

        tool_execution:
            "Running the selected tool",

        reasoning:
            "Generating an educational response",

        response:
            "Response completed",

        error:
            "An error occurred"

    };

    return (
        messages[item.stage] ||
        item.message ||
        "Processing request"
    );
}


function renderTrace(trace) {

    if (
        !Array.isArray(trace) ||
        trace.length === 0
    ) {

        agentActivity.style.display =
            "none";

        return;
    }

    agentActivity.style.display =
        "block";

    activityList.innerHTML = "";

    trace.forEach(
        (item, index) => {

            const activity =
                document.createElement(
                    "div"
                );

            activity.className =
                "activity-item";

            activity.innerHTML = `
                <div class="activity-icon">
                    ${getActivityIcon(item.stage)}
                </div>

                <div class="activity-content">

                    <strong>
                        ${formatActivityMessage(item)}
                    </strong>

                    <small>
                        Step ${item.step}
                    </small>

                </div>
            `;

            activity.style.animationDelay =
                `${index * 0.08}s`;

            activityList.appendChild(
                activity
            );

        }
    );
}


function getWorkflowTool(action) {

    const tools = {

        study_plan: {
            icon: "📚",
            title: "Study Plan",
            subtitle: "Tool"
        },

        learning_resources: {
            icon: "📖",
            title: "Resources",
            subtitle: "Tool"
        },

        calculator: {
            icon: "🧮",
            title: "Calculator",
            subtitle: "Tool"
        },

        general: {
            icon: "🧠",
            title: "AI Response",
            subtitle: "Reasoning"
        }

    };

    return (
        tools[action] ||
        tools.general
    );
}


function createWorkflowNode(
    icon,
    title,
    subtitle,
    className = ""
) {

    const node =
        document.createElement("div");

    node.className =
        `workflow-node ${className}`;

    node.innerHTML = `
        <div class="workflow-icon">
            ${icon}
        </div>

        <strong>
            ${title}
        </strong>

        <small>
            ${subtitle}
        </small>
    `;

    return node;
}


function createWorkflowArrow() {

    const arrow =
        document.createElement("div");

    arrow.className =
        "workflow-arrow";

    arrow.textContent =
        "→";

    return arrow;
}


function renderWorkflow(action) {

    const tool =
        getWorkflowTool(action);

    agentWorkflow.style.display =
        "block";

    workflowCanvas.innerHTML = "";

    const requestNode =
        createWorkflowNode(
            "👤",
            "User Request",
            "Input",
            "completed"
        );

    const brainNode =
        createWorkflowNode(
            "🧠",
            "AI Brain",
            "Intent",
            "completed"
        );

    const routerNode =
        createWorkflowNode(
            "🔀",
            "Tool Router",
            "Decision",
            "completed"
        );

    const toolNode =
        createWorkflowNode(
            tool.icon,
            tool.title,
            tool.subtitle,
            "completed"
        );

    const resultNode =
        createWorkflowNode(
            "📦",
            "Tool Result",
            "Output",
            "completed"
        );

    const responseNode =
        createWorkflowNode(
            "✅",
            "Response",
            "AI",
            "completed"
        );

    const nodes = [

        requestNode,

        createWorkflowArrow(),

        brainNode,

        createWorkflowArrow(),

        routerNode,

        createWorkflowArrow(),

        toolNode,

        createWorkflowArrow(),

        resultNode,

        createWorkflowArrow(),

        responseNode

    ];

    nodes.forEach(node => {

        workflowCanvas.appendChild(
            node
        );

    });

    workflowStatus.textContent =
        `Workflow completed using ${tool.title}.`;
}


function formatGeneralResponse(
    response
) {

    try {

        const parsed =
            JSON.parse(response);

        if (
            parsed.answer !== undefined
        ) {
            return String(
                parsed.answer
            );
        }

        if (
            parsed.response !== undefined
        ) {
            return String(
                parsed.response
            );
        }

        if (
            parsed.message !== undefined
        ) {
            return String(
                parsed.message
            );
        }

        return JSON.stringify(
            parsed,
            null,
            2
        );

    } catch {

        return response;

    }
}


function renderResponse(data) {

    responseBox.innerHTML = "";


    if (
        data.action ===
        "study_plan"
    ) {

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            `${data.days}-Day Study Plan: ${data.topic}`;

        responseBox.appendChild(
            title
        );


        const label =
            document.createElement(
                "div"
            );

        label.className =
            "tool-label";

        label.textContent =
            "Study Plan Tool";

        responseBox.appendChild(
            label
        );


        const plan =
            data.tool_result?.plan ||
            [];


        plan.forEach(day => {

            const dayBox =
                document.createElement(
                    "div"
                );

            dayBox.className =
                "plan-day";

            dayBox.innerHTML = `
                <strong>
                    Day ${day.day}
                </strong>

                <p>
                    ${day.focus}
                </p>

                <small>
                    ${day.task}
                </small>
            `;

            responseBox.appendChild(
                dayBox
            );

        });

        return;
    }


    if (
        data.action ===
        "learning_resources"
    ) {

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            `Learning Resources: ${data.topic}`;

        responseBox.appendChild(
            title
        );


        const label =
            document.createElement(
                "div"
            );

        label.className =
            "tool-label";

        label.textContent =
            "Learning Resources Tool";

        responseBox.appendChild(
            label
        );


        const resources =
            data.tool_result?.resources ||
            [];


        resources.forEach(
            resource => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "resource-item";

                item.innerHTML = `
                    <strong>
                        ${resource.title}
                    </strong>

                    <p>
                        ${resource.purpose}
                    </p>
                `;

                responseBox.appendChild(
                    item
                );

            }
        );

        return;
    }


    if (
        data.action ===
        "calculator"
    ) {

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            "Calculation Result";

        responseBox.appendChild(
            title
        );


        const label =
            document.createElement(
                "div"
            );

        label.className =
            "tool-label";

        label.textContent =
            "Calculator Tool";

        responseBox.appendChild(
            label
        );


        const result =
            data.tool_result?.result ??
            data.result;


        const expression =
            data.tool_result?.expression ??
            data.expression;


        const paragraph =
            document.createElement(
                "p"
            );

        paragraph.innerHTML =
            `<strong>${expression}</strong> = ${result}`;

        responseBox.appendChild(
            paragraph
        );

        return;
    }


    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        "EduAgent AI";

    responseBox.appendChild(
        title
    );


    const content =
        document.createElement(
            "p"
        );

    content.textContent =
        formatGeneralResponse(
            data.response || ""
        );

    responseBox.appendChild(
        content
    );
}


function addConversationMessage(
    role,
    content
) {

    const message =
        document.createElement(
            "div"
        );

    message.className =
        `conversation-message ${role}`;


    const header =
        document.createElement(
            "div"
        );

    header.className =
        "message-header";


    const name =
        document.createElement(
            "strong"
        );

    name.textContent =
        role === "user"
            ? "You"
            : "EduAgent AI";


    const time =
        document.createElement(
            "small"
        );

    time.textContent =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    header.appendChild(name);

    header.appendChild(time);


    const body =
        document.createElement(
            "div"
        );

    body.className =
        "message-content";

    body.textContent =
        content;


    message.appendChild(header);

    message.appendChild(body);

    conversation.appendChild(
        message
    );


    conversation.scrollTop =
        conversation.scrollHeight;


    conversationArea.style.display =
        "block";
}


function getConversationText(
    data
) {

    if (
        data.action ===
        "calculator"
    ) {

        const result =
            data.tool_result?.result ??
            data.result;

        return `Result: ${result}`;
    }


    if (
        data.action ===
        "study_plan"
    ) {

        return (
            data.tool_result?.message ||
            "Study plan created."
        );
    }


    if (
        data.action ===
        "learning_resources"
    ) {

        return (
            `Learning resources prepared for ${data.topic}.`
        );
    }


    return formatGeneralResponse(
        data.response || ""
    );
}


async function askEduAgent() {

    const userInput =
        input.value.trim();


    if (!userInput) {
        return;
    }


    addConversationMessage(
        "user",
        userInput
    );


    askButton.disabled =
        true;

    input.disabled =
        true;


    setStatus(
        "EduAgent is thinking...",
        "#67e8f9"
    );


    assistantCircle.textContent =
        "•••";


    toolIndicator.textContent =
        "Analyzing request...";


    agentActivity.style.display =
        "none";

    agentWorkflow.style.display =
        "none";


    activityList.innerHTML = "";

    workflowCanvas.innerHTML = "";


    responseBox.innerHTML = `
        <p>
            Processing your request...
        </p>
    `;


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
                            userInput
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const result =
            data.agent_result;


        if (!result) {

            throw new Error(
                "Invalid agent response."
            );

        }


        renderTrace(
            result.trace
        );


        renderWorkflow(
            result.action
        );


        setToolIndicator(
            result.action
        );


        renderResponse(
            result
        );


        addConversationMessage(
            "assistant",
            getConversationText(
                result
            )
        );


        setStatus(
            "Ready",
            "#4ade80"
        );


        assistantCircle.textContent =
            "AI";

    } catch (error) {

        console.error(
            "EduAgent error:",
            error
        );


        responseBox.innerHTML = `
            <h3>
                Something went wrong
            </h3>

            <p>
                Unable to connect to EduAgent.
                Please try again.
            </p>
        `;


        setStatus(
            "Connection error",
            "#f87171"
        );


        assistantCircle.textContent =
            "!";

    } finally {

        askButton.disabled =
            false;

        input.disabled =
            false;

        input.focus();

    }
}


askButton.addEventListener(
    "click",
    askEduAgent
);


input.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            askEduAgent();

        }

    }
);


document
    .querySelectorAll(
        ".quick-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                input.value =
                    button.dataset.prompt;

                input.focus();

            }
        );

    });


clearButton.addEventListener(
    "click",
    () => {

        conversation.innerHTML =
            "";

        conversationArea.style.display =
            "none";

    }
);


/* Browser voice capability */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    recognition.onstart = () => {

        voiceButton.classList.add(
            "listening"
        );

        voiceStatus.textContent =
            "Listening... Speak now";

        setStatus(
            "Listening...",
            "#67e8f9"
        );

        assistantCircle.textContent =
            "🎙";

    };


    recognition.onresult =
        event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            input.value =
                transcript;


            voiceStatus.textContent =
                "Voice captured";


            setStatus(
                "Voice input ready",
                "#4ade80"
            );


            assistantCircle.textContent =
                "AI";


            input.focus();

        };


    recognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            voiceStatus.textContent =
                "Voice input unavailable";


            setStatus(
                "Voice input error",
                "#f87171"
            );


            assistantCircle.textContent =
                "!";

        };


    recognition.onend =
        () => {

            voiceButton.classList.remove(
                "listening"
            );

        };

} else {

    voiceButton.disabled =
        true;

    voiceStatus.textContent =
        "Voice input not supported";

}


voiceButton.addEventListener(
    "click",
    () => {

        if (!recognition) {
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






      

