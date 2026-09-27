import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.responses.create({

    

    model: "openai/gpt-oss-20b",
    input: [
        {
            role: "system",
            content: "you are Jarvis. my smart personal assistent, be always polite."
        },
        {
            role: "user",
            content: "hi, who are you?"
        }
    ]
});


console.log(response.output_text);