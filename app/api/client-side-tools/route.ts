
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, generateImage, streamText, tool, stepCountIs, InferUITools, UIMessage } from "ai";
import { z } from "zod";
import ImageKit from "imagekit";

const uploadImage = async (base64Image: string) => {
    const imagkit = new ImageKit({
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    });
    const response = await imagkit.upload({
        file: base64Image,
        fileName: `image-${Date.now()}.png`,
    });
    return response.url;
};

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
            const imageUrl = await uploadImage(image.base64);
            return imageUrl;
        }, 
    }), 
    changeBackground: tool({
        description: 'Replace image background with AI-generated scenes based on text prompt.', 
        inputSchema: z.object({
            imageUrl: z.string().describe("The URL of the image to change the background of."),
            backgroundPrompt: z.string().describe("Description of the background to generate. eg: 'a sunset over a calm ocean, with a few clouds in the sky', 'a winter landscape with snow and a few trees, a warm fireplace in the background'")
        }), 
        outputSchema: z.string().describe("The transformed image URL."),
    }), 
    removeBackground: tool({
        description: 'Remove the background of an image.', 
        inputSchema: z.object({
            imageUrl: z.string().describe("The URL of the image to remove the background of."),
        }), 
        outputSchema: z.string().describe("The transformed image URL."),
    }), 
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
            stopWhen: stepCountIs(3),
        }); 

        return result.toUIMessageStreamResponse();
    }
    catch(error){
        console.error('Error streaming chat completion:', error);
        return new Response('Failed to stream chat completion', { status: 500 });
    }
  }