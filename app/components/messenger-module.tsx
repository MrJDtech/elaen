
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Search, Send, Users, Plus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "./auth-provider"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: string
  senderName: string
}

interface Friend {
  id: string
  name: string
  email: string
  online: boolean
  lastSeen?: string
}

export function MessengerModule() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadAllUsers()
      loadFriends()
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
    const userFriends = user.profile.friends.map(friendId => {
      const friend = allUsers.find((u: any) => u.id === friendId)
      return friend ? {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        online: Math.random() > 0.5, // Simulate online status
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      } : null
    }).filter(Boolean)
    
    setFriends(userFriends)
  }

  const addFriend = async (friendId: string) => {
    if (!user) return
    
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        friends: [...(user.profile?.friends || []), friendId]
      }
    }
    
    // Update current user
    localStorage.setItem("local-user", JSON.stringify(updatedUser))
    
    // Update users collection
    const allUsers = JSON.parse(localStorage.getItem("all-users") || "[]")
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser
      localStorage.setItem("all-users", JSON.stringify(allUsers))
    }
    
    // Trigger a re-render by updating the user state
    window.location.reload()
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
    
    // Save to local storage
    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
    allMessages.push(message)
    localStorage.setItem("messages", JSON.stringify(allMessages))
    
    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Connect and chat with your learning community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Friends List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends ({friends.length})
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
                      <p className="text-sm text-muted-foreground">
                        {friend.online ? 'Online' : `Last seen ${formatTime(friend.lastSeen || '')}`}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Add new friends section */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Add Friends</h4>
                  {filteredUsers.slice(0, 3).map((potentialFriend) => (
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
                        disabled={user?.profile?.friends?.includes(potentialFriend.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
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
                          <p>{message.content}</p>
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
                  Choose a friend from the list to begin your conversation
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
