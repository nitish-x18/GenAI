// LLM invoke--->>>

// import Groq from "groq-sdk";

// const client = new Groq({
//     apiKey: process.env.GROQ_API_KEY
// });

// async function main() {

//     const response = await client.chat.completions.create({

//         // temperature: 1, //betwn 0-2
//         // top_p: 0.2,
//         // stop: "a", //negative
//         // max_output_tokens: 1000,
//         // frequency_penalty: 0.5,
//         // presence_penalty: 0.5,
//         // response_format: {type: "json_object"},


//         model: "openai/gpt-oss-20b",
//         messages: [
//             {
//                 role: "system",
//                 content: "you are Jarvis. my smart personal assistent, be always polite."
//             },
//             {
//                 role: "user",
//                 content: "hi, who are you?"
//             }
//         ]
//     });

//     console.log(response.choices[0].message.content);
// }


// main();




//********************* TOOL CALLING ****************************/
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const client = new Groq({
    apikey: process.env.GROQ_API_KEY
});

const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY
});

async function main() {

    const messages = [
            {
                role: "system",
                content: `You are the Jarvis. a smart personal assistent who answers the asked questions.
                you have to access to following tools:
                1. webSearch({query}) 
                //Search the latest information and real time data on internet `
            },
            {
                role: "user",
                content: "When was iphone 17 launched?"
            },
        ]

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

    if(!toolCalls){
        console.log(`Jarvis: ${completions.choices[0].message.content}`);

        return;
    }

    messages.push(completions.choices[0].message)


    for(const tool of toolCalls) {

        // console.log("Tool: ", tool)

        const functionName = tool.function.name;
        const functionParams = tool.function.arguments;

        if(functionName === "webSearch"){
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

    const completions2 = await client.chat.completions.create({

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

    console.log(JSON.stringify(completions2.choices[0].message, null, 2))

}

main();

async function webSearch({ query }) {
    //here we do tavily api call
    console.log("Calling webSearch...");

    const response = await tvly.search(query)
    // console.log("Response: ", response);

    const finalResult = response.results.map(result => result.content).join("\n\n");
    // console.log("FinalResult: ", finalResult);

    return finalResult;

}