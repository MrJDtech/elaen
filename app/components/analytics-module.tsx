
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, BookOpen, Clock, Trophy, Target } from "lucide-react"
import { useAuth } from "./auth-provider"

interface AnalyticsData {
  totalCourses: number
  completedCourses: number
  totalTopics: number
  completedTopics: number
  studyTime: number
  certificates: number
  weeklyProgress: number[]
  topicCompletionRate: { [courseId: string]: number }
  recentActivity: Array<{
    type: 'course_completed' | 'topic_completed' | 'quiz_passed'
    title: string
    date: string
  }>
}

export function AnalyticsModule() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = () => {
    if (!user) return

    // Load courses data
    const localCourses = JSON.parse(localStorage.getItem("local-courses") || "[]")
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
    const allCourses = [...localCourses, ...savedCourses].filter((c: any) => c.user_id === user.id)

    // Load topic progress data
    const topicProgress = JSON.parse(localStorage.getItem("topic-progress") || "{}")
    
    // Load learning activity
    const learningActivity = JSON.parse(localStorage.getItem("learning-activity") || "[]")
      .filter((activity: any) => activity.userId === user.id)

    // Calculate analytics
    const totalCourses = allCourses.length
    const completedCourses = allCourses.filter((c: any) => c.completed).length
    
    let totalTopics = 0
    let completedTopics = 0
    const topicCompletionRate: { [courseId: string]: number } = {}

    allCourses.forEach((course: any) => {
      totalTopics += course.topics.length
      const courseProgress = topicProgress[course.id] || {}
      const courseCompletedTopics = Object.values(courseProgress).filter(Boolean).length
      completedTopics += courseCompletedTopics
      topicCompletionRate[course.id] = course.topics.length > 0 ? 
        (courseCompletedTopics / course.topics.length) * 100 : 0
    })

    // Calculate study time (simulate based on activity)
    const studyTime = learningActivity.length * 15 // Assume 15 minutes per activity

    // Weekly progress simulation
    const weeklyProgress = [65, 70, 75, 80, 85, 78, 90]

    const analyticsData: AnalyticsData = {
      totalCourses,
      completedCourses,
      totalTopics,
      completedTopics,
      studyTime,
      certificates: completedCourses,
      weeklyProgress,
      topicCompletionRate,
      recentActivity: learningActivity.slice(-5).reverse()
    }

    setAnalytics(analyticsData)
  }

  if (!analytics) {
    return <div>Loading analytics...</div>
  }

  const completionRate = analytics.totalCourses > 0 ? 
    (analytics.completedCourses / analytics.totalCourses) * 100 : 0
  
  const topicCompletionRate = analytics.totalTopics > 0 ? 
    (analytics.completedTopics / analytics.totalTopics) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Analytics</h1>
        <p className="text-muted-foreground">Track your progress and learning insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedCourses}/{analytics.totalCourses}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={completionRate} className="flex-1" />
              <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Mastered</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedTopics}/{analytics.totalTopics}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={topicCompletionRate} className="flex-1" />
              <span className="text-sm font-medium">{Math.round(topicCompletionRate)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(analytics.studyTime / 60)}h {analytics.studyTime % 60}m</div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.certificates}</div>
            <p className="text-xs text-muted-foreground">Earned certificates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
            <CardDescription>Your learning progress over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.weeklyProgress.map((progress, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">Day {index + 1}</span>
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm font-medium w-12">{progress}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Progress Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Topic completion by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.topicCompletionRate).map(([courseId, rate]) => {
                const course = [...JSON.parse(localStorage.getItem("local-courses") || "[]"), 
                              ...JSON.parse(localStorage.getItem("courses") || "[]")]
                              .find((c: any) => c.id === courseId)
                if (!course) return null
                
                return (
                  <div key={courseId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span>{course.icon}</span>
                        {course.title}
                      </span>
                      <Badge variant={rate === 100 ? "default" : "secondary"}>
                        {Math.round(rate)}%
                      </Badge>
                    </div>
                    <Progress value={rate} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === 'course_completed' && <BookOpen className="h-4 w-4" />}
                    {activity.type === 'topic_completed' && <Target className="h-4 w-4" />}
                    {activity.type === 'quiz_passed' && <Trophy className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
