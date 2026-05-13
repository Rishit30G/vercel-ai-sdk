
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, generateImage, streamText, tool, stepCountIs, InferUITools, UIMessage } from "ai";
import { z } from "zod";

  const tools = {
    generateImage: tool({
        description: 'Generate an image.', 
        inputSchema: z.object({
            prompt: z.string().describe("The prompt to generate an image for."),
        }), 
        execute: async({ prompt }) => {
            const { image } = await generateImage({
                model: google.imageModel('gemini-2.5-flash-image'),
                prompt, 
                size: '1024x1024',
            })
            return image.base64;
        }, 
        toModelOutput: () => {
            return {
                type: "content", 
                value: [
                    {
                        type: "text", 
                        text: "generated image in base64",
                    }
                ]
            }
        }
    })
  };

  export type ChatTools = InferUITools<typeof tools>; 
  export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>; 

  export async function POST(req: Request){
    try{
        const { messages}  : {messages: ChatMessage[]} = await req.json();

        const result = streamText({
            model: groq('qwen/qwen3-32b'),
            messages: await convertToModelMessages(messages), 
            tools, 
            stopWhen: stepCountIs(2),
        }); 

        return result.toUIMessageStreamResponse();
    }
    catch(error){
        console.error('Error streaming chat completion:', error);
        return new Response('Failed to stream chat completion', { status: 500 });
    }
  }