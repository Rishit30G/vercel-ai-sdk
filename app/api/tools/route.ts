import { UIMessage, InferUITools, UIDataTypes, streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

const tools = {
    getWeather: tool({
        description: 'Get the current weather for a given location',
        inputSchema: z.object({
            city: z.string().describe('The city to get the weather for'),
        }), 
        execute: async({ city }) => {
            if(city === "Gotham City"){
                return "70F and cloudy";
            }
            else if(city === "Metropolis"){
                return "85F and sunny";
            }
            else{
                return "Unknown";
            }
        }
    })
}

export type ChatTools = InferUITools<typeof tools>; 
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: groq('qwen/qwen3-32b'),
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(2),
      providerOptions: {
        groq: {
          reasoningFormat: 'hidden',
          reasoningEffort: 'none',
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    return new Response('Failed to stream chat completion', { status: 500 });
  }
}
