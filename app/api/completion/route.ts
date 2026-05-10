import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const { text } = await generateText({
      model: groq('qwen/qwen3-32b'),
      prompt,
    });
    return Response.json({ text });
  } catch (error) {
    console.log('Error generating text:', error);
    return Response.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}
