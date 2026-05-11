import { groq } from '@ai-sdk/groq';
import { experimental_transcribe as transcribe } from 'ai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return new Response('No audio file provided', { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const unit8Array = new Uint8Array(arrayBuffer);

    const transcript = await transcribe({
      model: groq.transcription('whisper-large-v3'),
      audio: unit8Array,
    });

    return Response.json(transcript);
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return new Response('Failed to transcribe audio', { status: 500 });
  }
}
