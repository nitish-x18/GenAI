import Groq from "groq-sdk";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main() {

    const response = await client.chat.completions.create({

        // temperature: 1, //betwn 0-2
        // top_p: 0.2,
        // stop: "a", //negative
        // max_output_tokens: 1000,
        // frequency_penalty: 0.5,
        // presence_penalty: 0.5,
        // response_format: {type: "json_object"},


        model: "openai/gpt-oss-20b",
        messages: [
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

    console.log(response.choices[0].message.content);
}


main();