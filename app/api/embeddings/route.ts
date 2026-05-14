import { embed, embedMany } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

export async function POST(req: Request) {
  const body = await req.json();
  if (Array.isArray(body.texts)) {
    const { values, embeddings, usage } = await embedMany({
      model: openrouter.textEmbeddingModel(
        'nvidia/llama-nemotron-embed-vl-1b-v2:free',
      ),
      values: body.texts,
      maxParallelCalls: 2,
    });

    return Response.json({
      values,
      embeddings,
      usage,
      count: embeddings.length,
      dimensions: embeddings[0].length,
    });
  }

  const { value, embedding, usage } = await embed({
    model: openrouter.textEmbeddingModel(
      'nvidia/llama-nemotron-embed-vl-1b-v2:free',
    ),
    value: body.text,
  });

  return Response.json({
    value,
    embedding,
    usage,
    dimensions: embedding.length,
  });
}
