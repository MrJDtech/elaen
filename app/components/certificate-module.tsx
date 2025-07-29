"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Download, Share2, Calendar } from "lucide-react"

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

interface CertificateModuleProps {
  course: Course
}

export function CertificateModule({ course }: CertificateModuleProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF certificate
    alert("Certificate download functionality would be implemented here")
  }

  const handleShare = () => {
    // In a real app, this would share the certificate
    alert("Certificate sharing functionality would be implemented here")
  }

  if (!course.completed) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Certificate Not Available</h3>
          <p className="text-muted-foreground mb-4">Complete the course and pass the quiz to earn your certificate.</p>
          <Badge variant="outline">Course Progress: {course.progress}%</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
        <p className="text-muted-foreground">Congratulations on completing {course.title}!</p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="border-8 border-double border-primary/20 p-8 text-center bg-gradient-to-br from-background to-muted/20">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-primary mb-2">Certificate of Completion</h1>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>

            <div className="mb-8">
              <p className="text-lg mb-4">This is to certify that</p>
              <h2 className="text-3xl font-bold text-primary mb-4">Student Name</h2>
              <p className="text-lg mb-2">has successfully completed the course</p>
              <h3 className="text-2xl font-semibold mb-6">{course.title}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-2">Topics Covered:</h4>
                <div className="space-y-1">
                  {course.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Calendar className="h-5 w-5" />
                  <span>Completed on {currentDate}</span>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-2 bg-gradient-to-br from-primary/10 to-primary/30 rounded-full flex items-center justify-center">
                    <span className="text-4xl">{course.icon}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Course Badge</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="border-b-2 border-primary/30 pb-2 mb-2">
                    <p className="font-semibold">EduLearn Pro</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Learning Platform</p>
                </div>
                <div>
                  <div className="border-b-2 border-primary/30 pb-2 mb-2">
                    <p className="font-semibold">
                      Certificate ID: {course.id.slice(0, 8)}-{Date.now()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Verification Code</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleShare} className="flex items-center gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share Certificate
        </Button>
      </div>
    </div>
  )
}
