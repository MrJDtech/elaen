"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, ChevronRight, Lightbulb } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  topics: string[]
  progress: number
  completed: boolean
  icon: string
  user_id: string
  created_at: string
}

interface LearningModuleProps {
  course: Course
}

export function LearningModule({ course }: LearningModuleProps) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentTopic = course.topics[currentTopicIndex]

  const generateContent = async (topic: string) => {
    setLoading(true)
    setError("")
    setContent("") // Clear previous content

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          courseTitle: course.title,
        }),
      })

      if (!response.ok) {
        // If the response is not OK, it might still be a streamed error or a regular JSON error
        const errorText = await response.text() // Read as text first
        let errorMessage = `Failed to generate content: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText) // Try parsing as JSON for specific error messages
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          // If not JSON, use the raw text
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // --- MODIFIED TO HANDLE STREAMING RESPONSE ---
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Failed to get readable stream from response.")
      }

      let receivedContent = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        receivedContent += new TextDecoder().decode(value)
        setContent(receivedContent) // Update content as chunks arrive
      }
      // --- END MODIFICATION ---
    } catch (err: any) {
      setError(err.message || "Failed to generate content. Please try again.")
      console.error("Error generating content:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTopic) {
      generateContent(currentTopic)
    }
  }, [currentTopic, course.title])

  const nextTopic = () => {
    if (currentTopicIndex < course.topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1)
    }
  }

  const previousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1)
    }
  }

  const progressPercentage = ((currentTopicIndex + 1) / course.topics.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topic {currentTopicIndex + 1} of {course.topics.length}
              </CardTitle>
              <CardDescription>{currentTopic}</CardDescription>
            </div>
            <Badge variant="outline">{Math.round(progressPercentage)}% Complete</Badge>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Course Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setCurrentTopicIndex(index)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  index === currentTopicIndex
                    ? "bg-primary text-primary-foreground"
                    : index < currentTopicIndex
                      ? "bg-muted text-muted-foreground"
                      : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{topic}</span>
                  {index < currentTopicIndex && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                  {index === currentTopicIndex && <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {currentTopic}
            </CardTitle>
            <CardDescription>
              Learn about {currentTopic.toLowerCase()} in {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => generateContent(currentTopic)}>Try Again</Button>
              </div>
            ) : (
              
              <div className="prose prose-sm max-w-none">
                {content.split('\n\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Clean up any remaining markdown symbols
                  let cleanText = trimmed
                    .replace(/^#+\s*/g, '') // Remove heading symbols
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold symbols
                    .replace(/^\d+\.\s*/g, '') // Remove numbered list markers
                    .replace(/^[-*]\s*/g, '') // Remove bullet markers
                    .replace(/^>\s*/g, '') // Remove quote markers
                    .trim();

                  // Skip empty content after cleaning
                  if (!cleanText) return null;

                  // Detect if it's likely a heading (shorter text, often at start)
                  const isHeading = cleanText.length < 80 && 
                    (index === 0 || cleanText.includes('Building Blocks') || 
                     cleanText.includes('Introduction') || cleanText.includes('Concepts'));

                  if (isHeading) {
                    return (
                      <h2 key={index} className="text-xl font-semibold text-gray-800 mb-4 mt-6">
                        {cleanText}
                      </h2>
                    );
                  }

                  // Regular paragraphs
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify">
                      {cleanText}
                    </p>
                  );
                }).filter(Boolean)}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={previousTopic} disabled={currentTopicIndex === 0}>
                Previous Topic
              </Button>
              <Button onClick={nextTopic} disabled={currentTopicIndex === course.topics.length - 1}>
                Next Topic
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}