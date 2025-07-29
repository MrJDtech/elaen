"use client"

import { useState, useEffect } from "react"
import { BookOpen, Trophy, Users, BarChart3, Home, Settings, User, MessageCircle, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "./auth-provider"
import { LearningModule } from "./learning-module"
import { QuizModule } from "./quiz-module"
import { CertificateModule } from "./certificate-module"
import { CourseCreator } from "./course-creator"
import { MessengerModule } from "./messenger-module" // Keep for now, will update its content

interface Course {
  id: string
  title: string
  description: string
  progress: number
  topics: string[]
  completed: boolean
  icon: string
  user_id: string
  created_at: string
}

// Mock courses for initial display
const initialMockCourses: Course[] = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming",
    progress: 75,
    topics: ["Variables", "Functions", "Objects", "Arrays", "DOM Manipulation"],
    completed: false,
    icon: "💻",
    user_id: "local-user-1", // Default user ID for mock data
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "React Development",
    description: "Build modern web applications with React",
    progress: 45,
    topics: ["Components", "Props", "State", "Hooks", "Context API"],
    completed: false,
    icon: "⚛️",
    user_id: "local-user-1",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Data Structures",
    description: "Understanding fundamental data structures",
    progress: 100,
    topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees"],
    completed: true,
    icon: "🏗️",
    user_id: "local-user-1",
    created_at: new Date().toISOString(),
  },
]

const sidebarItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "My Courses", icon: BookOpen, id: "courses" },
  { title: "Create Course", icon: Plus, id: "create-course" },
  { title: "Messages", icon: MessageCircle, id: "messages" },
  { title: "Certificates", icon: Trophy, id: "certificates" },
  { title: "Analytics", icon: BarChart3, id: "analytics" },
  { title: "Community", icon: Users, id: "community" },
  { title: "Settings", icon: Settings, id: "settings" },
]

export function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentModule, setCurrentModule] = useState("learn")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

    const localCourses = JSON.parse(localStorage.getItem("local-courses") || "[]")
    // Filter courses by the current user's ID if available, otherwise show all initial mock courses
    const userCourses = user
      ? [
          ...initialMockCourses.filter((c) => c.user_id === user.id),
          ...localCourses.filter((c: Course) => c.user_id === user.id),
        ]
      : initialMockCourses // If no user, show all initial mock courses

    setCourses(userCourses)
    setLoading(false)
  }

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">EduLearn Pro</span>
            <span className="truncate text-xs text-muted-foreground">Local Storage Mode</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveView(item.id)
                      setSelectedCourse(null)
                    }}
                    isActive={activeView === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <User className="h-4 w-4" />
              <span>{user?.name || "Guest"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )

  const DashboardView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "Guest"}!</h1>
        <p className="text-muted-foreground">
          Continue your learning journey
          <Badge variant="outline" className="ml-2">
            Local Storage Mode
          </Badge>
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="h-4 w-4 rounded-full bg-blue-400"></div>
            <p className="text-sm">
              <strong>Local Storage Mode:</strong> All data (users, courses) is saved in your browser's local storage.
              It will be lost if you clear your browser data.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Your created courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter((c) => c.completed).length}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter((c) => !c.completed && c.progress > 0).length}</div>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter((c) => c.completed).length}</div>
            <p className="text-xs text-muted-foreground">Well done!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No courses yet. Create your first course!</p>
                <Button onClick={() => setActiveView("create-course")}>Create Course</Button>
              </div>
            ) : (
              courses
                .filter((c) => !c.completed && c.progress > 0)
                .slice(0, 3)
                .map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{course.icon}</span>
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <Progress value={course.progress} className="w-32 mt-1" />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course)
                        setActiveView("learning")
                        setCurrentModule("learn")
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses
              .filter((c) => c.completed)
              .slice(0, 3)
              .map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">Certificate earned</p>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              ))}
            {courses.filter((c) => c.completed).length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Complete courses to earn certificates!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const CoursesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Explore and continue your learning journey</p>
        </div>
        <Button onClick={() => setActiveView("create-course")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-muted rounded w-full mb-4"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">Create your first course to get started!</p>
            <Button onClick={() => setActiveView("create-course")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{course.icon}</span>
                  {course.completed && <Badge variant="secondary">Completed</Badge>}
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Topics covered:</h4>
                  <div className="flex flex-wrap gap-1">
                    {course.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {course.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedCourse(course)
                      setActiveView("learning")
                      setCurrentModule("learn")
                    }}
                  >
                    {course.progress === 0 ? "Start Course" : "Continue"}
                  </Button>
                  {course.completed && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(course)
                        setActiveView("learning")
                        setCurrentModule("certificate")
                      }}
                    >
                      View Certificate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const LearningView = () => {
    if (!selectedCourse) return <div>No course selected</div>

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-3xl">{selectedCourse.icon}</span>
              {selectedCourse.title}
            </h1>
            <p className="text-muted-foreground">{selectedCourse.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setActiveView("courses")
              setSelectedCourse(null)
            }}
          >
            Back to Courses
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button variant={currentModule === "learn" ? "default" : "outline"} onClick={() => setCurrentModule("learn")}>
            Learn
          </Button>
          <Button variant={currentModule === "quiz" ? "default" : "outline"} onClick={() => setCurrentModule("quiz")}>
            Take Quiz
          </Button>
          {selectedCourse.completed && (
            <Button
              variant={currentModule === "certificate" ? "default" : "outline"}
              onClick={() => setCurrentModule("certificate")}
            >
              Certificate
            </Button>
          )}
        </div>

        {currentModule === "learn" && <LearningModule course={selectedCourse} />}
        {currentModule === "quiz" && <QuizModule course={selectedCourse} />}
        {currentModule === "certificate" && <CertificateModule course={selectedCourse} />}
      </div>
    )
  }

  const renderActiveView = () => {
    if (selectedCourse && activeView === "learning") {
      return <LearningView />
    }

    switch (activeView) {
      case "dashboard":
        return <DashboardView />
      case "courses":
        return <CoursesView />
      case "create-course":
        return <CourseCreator onCourseCreated={fetchCourses} />
      case "messages":
        return <MessengerModule /> // This will be updated next
      case "certificates":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Certificates</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses
                .filter((c) => c.completed)
                .map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <Badge variant="secondary">Earned</Badge>
                      </div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>Certificate of Completion</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedCourse(course)
                          setActiveView("learning")
                          setCurrentModule("certificate")
                        }}
                      >
                        View Certificate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
            {courses.filter((c) => c.completed).length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                  <p className="text-muted-foreground">Complete courses to earn certificates!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Feature coming soon...</p>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <SidebarTrigger />
          </div>
          {renderActiveView()}
        </main>
      </div>
    </SidebarProvider>
  )
}
