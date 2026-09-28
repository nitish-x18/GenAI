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

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main() {
    const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "system",
                content: "you are Jarvis. my smart personal assistent, be always polite. you have access to use tool 1. webSearch"
            },
            {
                role: "user",
                content: "when was iphone 16 launched"
            }
        ],
        tools: [
            {
                "type": "function",
                "function": {
                    "name": "webSearch",
                    "description": "search the latest and real time data on the internet",
                    "parameters": {
                        // JSON Schema object
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "to search query to perform search"
                            },
                        },
                        "required": ["query"]
                    }
                }
            }
        ],
        tool_choice: "auto"
    })

    const toolCalls = response.choices[0].message.tool_calls

    if(!toolCalls) {
        console.log(`Jarvis: ${response.choices[0].message.content}`)
        return;
    }
    
    for(const tool of toolCalls){
        console.log(`Tool: ${tool}`)
        const functionName = tool.function.name
        const functionParams = tool.function.arguments

        if(functionName === "webSearch") {
            const toolResult = await webSearch(JSON.parse(functionParams))
            console.log("ToolResult: ", toolResult)
        }
    }

    // console.log(JSON.stringify(response.choices[0].message, null , 2));

}

main();


async function webSearch({ query }){
    //use tavily key api in this

    console.log("webSearch calling...")

    return "iphone 16 was lauched on 20 sep 2024"
}