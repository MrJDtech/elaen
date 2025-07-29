import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // Set the API key directly for local testing
    process.env.GROQ_API_KEY = "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"

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured. AI generation will not work.")
      const fallbackCourse = {
        title: `Custom Learning Course: ${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}`,
        description: "GROQ_API_KEY is not configured. Please ensure your API key is set.",
        topics: ["API Key Missing", "Check Code", "Try Again"],
        icon: "⚠️",
      }
      return Response.json({ course: fallbackCourse })
    }

    let text: string
    try {
      const result = await generateText({
        model: groq("gemma2-9b-it"), // Changed to gemma2-9b-it
        prompt: `Create a comprehensive course based on this prompt: "${prompt}"

Please generate a course with the following structure:
1. A catchy course title
2. A compelling description (2-3 sentences)
3. 5-8 specific learning topics/modules
4. An appropriate emoji icon for the course

Format the response as a JSON object with this exact structure:
{
  "title": "Course Title Here",
  "description": "Course description here",
  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
  "icon": "📚"
}

Make sure the topics are:
- Logically ordered from basic to advanced
- Specific and actionable
- Comprehensive for the subject
- Each topic should be 2-5 words

Choose an appropriate emoji icon that represents the course subject.

User prompt: ${prompt}`,
        temperature: 1,
        maxTokens: 1024, // Corresponds to max_completion_tokens
        topP: 1,
      })
      text = result.text
    } catch (groqError: any) {
      console.error("Error calling Groq API for course generation:", groqError)
      const fallbackCourse = {
        title: `Groq API Failed: ${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}`,
        description: `Error: ${groqError.message || "Unknown error"}. Please check your API key and Groq status.`,
        topics: ["API Error", "Check Key", "Try Again"],
        icon: "⚠️",
      }
      return Response.json({ course: fallbackCourse })
    }

    // Clean the response text to extract valid JSON
    let cleanText = text.trim()

    // Remove code block markers if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    // Try to find JSON object in the response
    const jsonStart = cleanText.indexOf('{')
    const jsonEnd = cleanText.lastIndexOf('}')

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1)
    }

    // Remove any emoji or special characters that might break JSON parsing
    cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '"icon"')

    const courseData = JSON.parse(cleanText)

    return Response.json({ course: courseData })
  } catch (error) {
    console.error("Unexpected error in course generation route:", error)
    const { prompt } = await req.json().catch(() => ({ prompt: "Unknown" }))
    const fallbackCourse = {
      title: `An unexpected error occurred: ${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}`,
      description: "An unexpected error occurred during course generation.",
      topics: ["Unexpected Error", "Try Again"],
      icon: "❌",
    }

    return Response.json({ course: fallbackCourse })
  }
}