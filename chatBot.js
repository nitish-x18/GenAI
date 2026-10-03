import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const client = new Groq({
    apikey: process.env.GROQ_API_KEY
});

const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY
});

export async function generate(userMessage) {

    const messages = [
        {
            role: "system",
            content: `You are Jarvis, a smart personal assistant.

You can use the following tool:

1. webSearch({query})
   - Use this tool when the user asks for current, latest, real-time, recent, or internet-based information.
   - Do not use web search for normal casual conversation when it is not necessary.

Important:
- Answer the user's current question directly.
- Use previous conversation context only when it is relevant to the current question.
- Do not repeat previous answers unless the user asks about them.
- Be concise and helpful.`
        },
        // {
        //     role: "user",
        //     content: "are you LLM model"
        // },
    ]

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
                        content: toolResult
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

    const finalResult = response.results.map(result => result.content).join("\n\n");
    // console.log("FinalResult: ", finalResult);

    return finalResult;

}