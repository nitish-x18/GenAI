import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY
});

const myCache = new NodeCache({
    stdTTL: 60 * 60 * 24
});


export async function generate(userMessage, threadId) {

    const baseMessages = [
        {
            role: "system",
            content: `You are Jarvis, a smart personal assistant.

You can use this tool:

1. webSearch({query})
   - Use it for current, latest, real-time, recent, or internet-based information.
   - Do not use it for normal casual conversation when unnecessary.

IMPORTANT TOOL RULES:
- Never expose raw tool results to the user.
- Never mention tools, Tavily, APIs, JSON, search results, or internal processing.
- Treat tool results only as background information.
- Do not copy the wording or formatting from search results.
- Rewrite the information naturally in your own words.
- Answer only what the user asked.
- Do not provide every piece of information returned by the tool unless it is relevant.
- Do not invent information.
- If exact information is unavailable, say so.

WEATHER RESPONSES:
- For a simple weather question, give a short natural answer.
- Normally mention only temperature, condition, feels-like temperature, and rain chance when relevant.
- Do not provide "as of the latest update".
- Do not provide UTC timestamps unless specifically requested.
- Do not provide pressure, visibility, humidity, wind gusts, Fahrenheit conversion, or other detailed metrics unless the user asks for them.
- Do not use a long bullet-point weather report unless the user asks for detailed weather information.

Example:

User: "What's the weather in Bihar?"

Good:
"Bihar is currently around 28°C with smoky haze and mostly clear skies. It feels like 31°C, and there's only a small chance of rain."

Bad:
"The current weather in Bihar (as of the latest update) is:
- Temperature: ...
- Feels like: ...
- Condition: ...
- Wind: ...
- Humidity: ...
- Pressure: ...
- Visibility: ..."

GENERAL RESPONSE STYLE:
- Be concise and conversational.
- Give the answer directly.
- Prefer 1–3 short sentences for simple questions.
- Don't add unnecessary closing statements such as "Feel free to ask me..."
- Use previous conversation context only when relevant.`
        },
        // {
        //     role: "user",
        //     content: "are you LLM model"
        // },
    ];

    const messages = myCache.get(threadId) ?? baseMessages;

    messages.push({
        role: 'user',
        content: userMessage
    })

    while (true) {
        const completions = await client.chat.completions.create({

            model: "openai/gpt-oss-20b",
            temperature: 0,
            messages: messages,
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "description": "Search the latest information and real time data on internet",
                        "parameters": {
                            // JSON Schema object
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "The search query to perform search on"
                                }
                            },
                            "required": ["query"]
                        }
                    }
                }
            ],
            tool_choice: 'auto',

        });

        const toolCalls = completions.choices[0].message.tool_calls;

        if (!toolCalls) {
            // console.log(`Jarvis: ${completions.choices[0].message.content}`);
            myCache.set(threadId, messages);
            console.log(myCache);
            const assistantMessage = completions.choices[0].message;

            return assistantMessage.content;
            // messages.push(assistantMessage);

        }

        messages.push(completions.choices[0].message)


        for (const tool of toolCalls) {

            // console.log("Tool: ", tool)

            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams))
                // console.log("ToolResult: ", toolResult)

                messages.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: functionName,
                    content: JSON.stringify(toolResult)
                })
            }
        }
    }
}


async function webSearch({ query }) {
    //here we do tavily api call
    console.log("Calling webSearch...");

    const response = await tvly.search(query)
    // console.log("Response: ", response);

    return response.results.map(result => ({
        title: result.title,
        content: result.content,
        url: result.url
    }));

}