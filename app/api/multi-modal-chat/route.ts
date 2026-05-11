import { UIMessage, streamText, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: groq('qwen/qwen3-32b'),
      messages: modelMessages,
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
