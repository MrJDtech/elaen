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
        model: groq("llama-3.1-8b-instant"),
        prompt: `Write educational content about "${topic}" for the course "${courseTitle}".

IMPORTANT FORMATTING RULES:
- Write in clear, readable paragraphs
- Use simple headings without markdown symbols
- No special characters like **, ##, -, or *
- Write naturally as if explaining to a student
- Use proper sentences and paragraphs only

Content should include:
1. A clear introduction to the topic
2. Key concepts explained simply
3. Practical examples
4. Important takeaways

Write approximately 300-400 words in a conversational, educational tone.

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
