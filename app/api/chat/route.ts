import { UIMessage, streamText, convertToModelMessages } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: groq('qwen/qwen3-32b'),
      messages: modelMessages,
      system: 'You are a helpful assistant. Just answer the user in 1 line, not more than that. Tell only necessary information. If you do not know the answer, say you do not know.',
      providerOptions: {
        groq: {
          reasoningFormat: 'hidden',
          reasoningEffort: 'none',
        },
      },
    });

    result.usage.then((usage) => {
        console.log({
            messageCount: messages.length, 
            inputTokens: usage.inputTokens, 
            outputTokens: usage.outputTokens, 
            totalTokens: usage.totalTokens
        })
    })
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    return new Response('Failed to stream chat completion', { status: 500 });
  }
}
