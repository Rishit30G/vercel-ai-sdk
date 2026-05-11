import { UIMessage, streamText, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: groq('openai/gpt-oss-120b'),
      messages: await convertToModelMessages(messages),
    });
    
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    return new Response('Failed to stream chat completion', { status: 500 });
  }
}
