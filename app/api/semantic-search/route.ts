import { embed, embedMany, cosineSimilarity } from "ai"; 
import { openrouter } from "@openrouter/ai-sdk-provider";

const movies = [
    {
        id: 1, 
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    }, 
    {
        id: 2, 
        title: "The Godfather",
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
    },
    {
        id: 3, 
        title: "The Dark Knight",
        description: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham. The Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice."
    }
]

export async function POST(request: Request) {
    const { query } = await request.json();
    
    // Embed the movie descriptions
    const {embeddings: movieEmbeddings} = await embedMany({
        model: openrouter.textEmbeddingModel('nvidia/llama-nemotron-embed-vl-1b-v2:free'),
        values: movies.map(movie => movie.description)
    })

    
    const { embedding: queryEmbedding} = await embed({
        model: openrouter.textEmbeddingModel('nvidia/llama-nemotron-embed-vl-1b-v2:free'),
        value: query
    }); 

    const movieWithScores = movies.map((movie, index) => {
        const similarity = cosineSimilarity(queryEmbedding, movieEmbeddings[index]);
        return {
            ...movie, 
            similarity
        }
    }) 
    
    const threshold = 0.1; // Set a similarity threshold
    const filteredResults = movieWithScores.filter(movie => movie.similarity >= threshold);
    const sortedResults = filteredResults.sort((a, b) => b.similarity - a.similarity);

    return Response.json({results: sortedResults});
}