import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";


export async function POST(req: Request){
    try{
        const {prompt} = await req.json()
        const result = await streamText({
            model: groq('qwen/qwen3-32b'),
            prompt,
        }); 
        return result.toUIMessageStreamResponse();
    }
    catch(error){
        console.error("Error Streaming Text:", error); 
        return new Response("Failed to stream text", {status: 500});
    }
}