"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Search, Send, Users, Plus, BookOpen, UserPlus, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "./auth-provider"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  senderName: string
  type?: 'text' | 'course_invite' | 'study_group'
  courseData?: any
}

interface Friend {
  id: string
  name: string
  email: string
  online: boolean
  lastSeen?: string
}

interface CourseInvitation {
  id: string
  courseId: string
  courseName: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  status: 'pending' | 'accepted' | 'declined'
  timestamp: string
}

interface StudyGroup {
  id: string
  name: string
  courseId: string
  courseName: string
  members: string[]
  creator: string
  createdAt: string
}

export function MessengerModule() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [courseInvitations, setCourseInvitations] = useState<CourseInvitation[]>([])
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [selectedCourseForInvite, setSelectedCourseForInvite] = useState<any>(null)
  const { user, updateUser } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadAllUsers()
      loadFriends()
      loadCourseInvitations()
      loadStudyGroups()
    }
  }, [user])

  useEffect(() => {
    if (selectedFriend) {
      loadMessages()
    }
  }, [selectedFriend])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadAllUsers = () => {
    const users = JSON.parse(localStorage.getItem("all-users") || "[]")
    setAllUsers(users.filter((u: any) => u.id !== user?.id))
  }

  const loadFriends = () => {
    if (!user?.profile?.friends) return

    const allUsers = JSON.parse(localStorage.getItem("all-users") || "[]")
    const userFriends = user.profile.friends.map((friendId: string) => {
      const friend = allUsers.find((u: any) => u.id === friendId)
      return friend ? {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        online: Math.random() > 0.5,
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      } : null
    }).filter(Boolean)

    setFriends(userFriends)
  }

  const loadCourseInvitations = () => {
    const invitations = JSON.parse(localStorage.getItem("course-invitations") || "[]")
    setCourseInvitations(invitations.filter((inv: CourseInvitation) => 
      inv.toUserId === user?.id || inv.fromUserId === user?.id
    ))
  }

  const loadStudyGroups = () => {
    const groups = JSON.parse(localStorage.getItem("study-groups") || "[]")
    setStudyGroups(groups.filter((group: StudyGroup) => 
      group.members.includes(user?.id || "")
    ))
  }

  const addFriend = async (friendId: string) => {
    if (!user) return

    // Check if already friends
    if (user.profile?.friends?.includes(friendId)) {
      return
    }

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        friends: [...(user.profile?.friends || []), friendId]
      }
    }

    // Update current user in localStorage
    localStorage.setItem("local-user", JSON.stringify(updatedUser))

    // Update in all-users array
    const allUsers = JSON.parse(localStorage.getItem("all-users") || "[]")
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser
      localStorage.setItem("all-users", JSON.stringify(allUsers))
    }

    // Also add this user as friend to the other person (mutual friendship)
    const friendIndex = allUsers.findIndex((u: any) => u.id === friendId)
    if (friendIndex !== -1) {
      const friend = allUsers[friendIndex]
      if (!friend.profile?.friends?.includes(user.id)) {
        allUsers[friendIndex] = {
          ...friend,
          profile: {
            ...friend.profile,
            friends: [...(friend.profile?.friends || []), user.id]
          }
        }
        localStorage.setItem("all-users", JSON.stringify(allUsers))
      }
    }

    // Update the auth context
    updateUser(updatedUser)

    // Reload data
    loadFriends()
    loadAllUsers()
  }

  const sendCourseInvitation = (courseId: string, courseName: string, toUserId: string) => {
    if (!user) return

    const invitation: CourseInvitation = {
      id: `inv-${Date.now()}`,
      courseId,
      courseName,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      status: 'pending',
      timestamp: new Date().toISOString()
    }

    const invitations = JSON.parse(localStorage.getItem("course-invitations") || "[]")
    invitations.push(invitation)
    localStorage.setItem("course-invitations", JSON.stringify(invitations))

    // Send message notification
    const message: Message = {
      id: `msg-${Date.now()}`,
      content: `📚 ${user.name} invited you to study "${courseName}" together!`,
      senderId: user.id,
      receiverId: toUserId,
      timestamp: new Date().toISOString(),
      senderName: user.name,
      type: 'course_invite',
      courseData: { courseId, courseName, invitationId: invitation.id }
    }

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
    allMessages.push(message)
    localStorage.setItem("messages", JSON.stringify(allMessages))

    loadCourseInvitations()
    if (selectedFriend?.id === toUserId) {
      loadMessages()
    }
  }

  const acceptCourseInvitation = (invitationId: string) => {
    const invitations = JSON.parse(localStorage.getItem("course-invitations") || "[]")
    const updatedInvitations = invitations.map((inv: CourseInvitation) => 
      inv.id === invitationId ? { ...inv, status: 'accepted' } : inv
    )
    localStorage.setItem("course-invitations", JSON.stringify(updatedInvitations))
    loadCourseInvitations()
  }

  const createStudyGroup = (courseId: string, courseName: string, memberIds: string[]) => {
    if (!user) return

    const studyGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name: `${courseName} Study Group`,
      courseId,
      courseName,
      members: [user.id, ...memberIds],
      creator: user.id,
      createdAt: new Date().toISOString()
    }

    const groups = JSON.parse(localStorage.getItem("study-groups") || "[]")
    groups.push(studyGroup)
    localStorage.setItem("study-groups", JSON.stringify(groups))

    loadStudyGroups()
  }

  const loadMessages = () => {
    if (!user || !selectedFriend) return

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
    const conversationMessages = allMessages.filter((msg: Message) => 
      (msg.senderId === user.id && msg.receiverId === selectedFriend.id) ||
      (msg.senderId === selectedFriend.id && msg.receiverId === user.id)
    )

    setMessages(conversationMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedFriend) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      senderId: user.id,
      receiverId: selectedFriend.id,
      timestamp: new Date().toISOString(),
      senderName: user.name
    }

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
    allMessages.push(message)
    localStorage.setItem("messages", JSON.stringify(allMessages))

    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const getUserCourses = () => {
    const localCourses = JSON.parse(localStorage.getItem("local-courses") || "[]")
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
    return [...localCourses, ...savedCourses].filter((c: any) => c.user_id === user?.id)
  }

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const isNotFriend = !user?.profile?.friends?.includes(u.id)
    return matchesSearch && isNotFriend
  })

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages & Study Groups</h1>
        <p className="text-muted-foreground">Connect with friends and create study groups for courses</p>
      </div>

      {/* Course Invitations */}
      {courseInvitations.filter(inv => inv.toUserId === user?.id && inv.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courseInvitations
                .filter(inv => inv.toUserId === user?.id && inv.status === 'pending')
                .map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invitation.fromUserName}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited you to study "{invitation.courseName}"
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptCourseInvitation(invitation.id)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Friends & Study Groups List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connections ({friends.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {/* Study Groups */}
                {studyGroups.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Study Groups</h4>
                    {studyGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{group.name}</div>
                          <p className="text-sm text-muted-foreground">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Friends List */}
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Friends</h4>
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFriend?.id === friend.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/placeholder-user.jpg`} />
                      <AvatarFallback>
                        {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{friend.name}</span>
                        {friend.online && (
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {friend.online ? (
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            Online
                          </span>
                        ) : (
                          `Last seen ${formatTime(friend.lastSeen || '')}`
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add new friends section */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Add Friends ({filteredUsers.length} available)</h4>
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No new users to add</p>
                  ) : (
                    filteredUsers.slice(0, 5).map((potentialFriend) => (
                      <div key={potentialFriend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {potentialFriend.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{potentialFriend.name}</p>
                          <p className="text-xs text-muted-foreground">{potentialFriend.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addFriend(potentialFriend.id)}
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                  {searchQuery && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedFriend ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/placeholder-user.jpg`} />
                      <AvatarFallback>
                        {selectedFriend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedFriend.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedFriend.online ? (
                          <span className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            Online
                          </span>
                        ) : (
                          `Last seen ${formatTime(selectedFriend.lastSeen || '')}`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Course Invite Button */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const courses = getUserCourses()
                        if (courses.length > 0) {
                          setSelectedCourseForInvite(courses[0])
                        }
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Invite to Course
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col">
                <ScrollArea className="h-[400px] mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.type === 'course_invite' && (
                            <div className="border-b pb-2 mb-2">
                              <Badge variant="secondary">Course Invitation</Badge>
                            </div>
                          )}
                          <p>{message.content}</p>
                          {message.courseData && message.senderId !== user?.id && (
                            <div className="mt-2 pt-2 border-t">
                              <Button 
                                size="sm" 
                                onClick={() => acceptCourseInvitation(message.courseData.invitationId)}
                              >
                                Accept Invitation
                              </Button>
                            </div>
                          )}
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a friend to start chatting</h3>
                <p className="text-muted-foreground">
                  Choose a friend from the list to begin your conversation or invite them to study together
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Quick Course Invite Modal */}
      {selectedCourseForInvite && selectedFriend && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Invite to Course</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCourseForInvite(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p>Select a course to invite {selectedFriend.name} to study together:</p>
              <div className="space-y-2">
                {getUserCourses().map((course) => (
                  <Button
                    key={course.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      sendCourseInvitation(course.id, course.title, selectedFriend.id)
                      setSelectedCourseForInvite(null)
                    }}
                  >
                    <span className="mr-2">{course.icon}</span>
                    {course.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}