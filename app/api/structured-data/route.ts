import { groq } from "@ai-sdk/groq";
import { streamObject } from "ai";
import { recipeSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { dish } = await req.json();

    const result = await streamObject({
      model: groq('openai/gpt-oss-120b'),
      schema: recipeSchema,
      prompt: `Generate a recipe for ${dish}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}