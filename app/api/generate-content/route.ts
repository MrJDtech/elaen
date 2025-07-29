import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { topic, courseTitle } = await req.json()

    // Set the API key directly for local testing
    process.env.GROQ_API_KEY = "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"

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured. AI generation will not work.")
      return Response.json(
        {
          error: "GROQ_API_KEY is not configured. Please ensure it's set in environment variables or hardcoded correctly.",
        },
        { status: 500 },
      )
    }

    try {
      const result = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: `Write educational content about "${topic}" for the course "${courseTitle}".

Write clear, readable content that explains the topic in simple terms. Structure your response as follows:

${topic}

Start with a brief introduction explaining what ${topic} is and why it's important in ${courseTitle}.

Then explain the key concepts in 2-3 paragraphs, using simple language and practical examples.

Finally, provide a summary of the main takeaways that students should remember.

Write in a conversational tone as if you're teaching a student. Use proper paragraphs and avoid special formatting symbols.`,
        temperature: 0.7,
        maxTokens: 800,
      })
      
      return Response.json({ content: result.text })
    } catch (groqError: any) {
      console.error("Error calling Groq API for content generation:", groqError)
      
      // Provide fallback content
      const fallbackContent = `${topic}

Welcome to learning about ${topic}! This is an important concept in ${courseTitle} that will help you build a strong foundation.

${topic} refers to the fundamental elements that make up this subject area. Understanding these concepts is essential because they form the building blocks for more advanced topics you'll encounter later in the course.

Let's break this down into manageable pieces. The core ideas include the basic principles, practical applications, and how these concepts connect to real-world scenarios. By mastering these fundamentals, you'll be better prepared to tackle more complex challenges.

Key takeaways: Remember that ${topic} is foundational to ${courseTitle}. Focus on understanding the basic principles first, then practice applying them in different contexts. This will help you build confidence and competence in the subject.`

      return Response.json({ content: fallbackContent })
    }
  } catch (error) {
    console.error("Unexpected error in content generation route:", error)
    return Response.json({ error: "An unexpected error occurred during content generation." }, { status: 500 })
  }
}
