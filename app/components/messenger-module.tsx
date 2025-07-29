"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"
// Removed: import { createClient } from "@/lib/supabase"

// Removed unused interfaces as messaging is disabled in local storage mode
// interface Message {
//   id: string
//   content: string
//   sender_id: string
//   receiver_id: string
//   created_at: string
//   sender_name: string
// }

// interface Friend {
//   id: string
//   name: string
//   email: string
//   avatar_url?: string
//   online: boolean
// }

export function MessengerModule() {
  // Removed all state related to friends and messages as they are not used
  // const [friends, setFriends] = useState<Friend[]>([])
  // const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  // const [messages, setMessages] = useState<Message[]>([])
  // const [newMessage, setNewMessage] = useState("")
  // const [searchQuery, setSearchQuery] = useState("")
  // const [loading, setLoading] = useState(true)
  // const { user } = useAuth()
  // const supabase = createClient() // This line is now removed
  // const messagesEndRef = useRef<HTMLDivElement>(null)

  // Removed all useEffects and functions related to Supabase data fetching/sending
  // useEffect(() => { ... }, [])
  // useEffect(() => { ... }, [])
  // useEffect(() => { ... }, [])
  // const scrollToBottom = () => { ... }
  // const fetchFriends = async () => { ... }
  // const fetchMessages = async () => { ... }
  // const sendMessage = async () => { ... }
  // const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
  // const formatTime = (timestamp: string) => { ... }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Connect and chat with your learning community</p>
      </div>

      {/* Always show the message indicating feature is not available */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging Feature</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Messaging is not available in Local Storage Mode</h3>
          <p className="text-muted-foreground mb-4">
            This feature requires a backend database for real-time communication.
            <br />
            To enable messaging, you would need to integrate a service like Supabase or another backend.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
