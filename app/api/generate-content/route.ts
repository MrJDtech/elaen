import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { topic, courseTitle } = await req.json()

    // Set the API key directly for local testing
    process.env.GROQ_API_KEY = "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"

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured. AI generation will not work.")
      return Response.json(
        {
          error:
            "GROQ_API_KEY is not configured. Please ensure it's set in environment variables or hardcoded correctly.",
        },
        { status: 500 },
      )
    }

    try {
      const result = await streamText({
        model: groq("gemma2-9b-it"), // Changed to gemma2-9b-it
        prompt: `Create comprehensive educational content for the topic "${topic}" as part of the course "${courseTitle}".

Please provide:
1. A clear introduction to the topic
2. Key concepts and definitions
3. Practical examples
4. Important points to remember
5. How this topic relates to the broader course

Make the content engaging, educational, and suitable for learners. Use clear explanations and provide concrete examples where possible. The content should be approximately 300-500 words.

Topic: ${topic}
Course: ${courseTitle}`,
        temperature: 1,
        maxTokens: 1024, // Corresponds to max_completion_tokens
        topP: 1,
      })
      return result.toDataStreamResponse()
    } catch (groqError: any) {
      console.error("Error calling Groq API for content generation:", groqError)
      return Response.json(
        {
          error: `Groq API call failed for content generation: ${groqError.message || "Unknown error"}. Please check your API key and Groq status.`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in content generation route:", error)
    return Response.json({ error: "An unexpected error occurred during content generation." }, { status: 500 })
  }
}
