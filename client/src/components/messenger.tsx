import { useState, useEffect } from "react";
import { 
  Send, 
  PlusCircle, 
  Paperclip, 
  Smile, 
  Search, 
  Phone, 
  Video, 
  Info, 
  MoreVertical,
  Calendar,
  FileText,
  Image,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  type: "Friend" | "Health Professional" | "Organization" | "Health Coach";
  lastSeen?: string;
  unreadCount?: number;
  isTyping?: boolean;
}

interface Message {
  id: number;
  sender: number;
  recipient: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: {
    type: "image" | "document" | "healthData";
    url: string;
    preview?: string;
    name?: string;
  }[];
}

const users: User[] = [
  { 
    id: 1, 
    name: "Dr. Jane Smith", 
    status: "online", 
    type: "Health Professional",
    lastSeen: "Just now",
    unreadCount: 2
  },
  { 
    id: 2, 
    name: "Mike Johnson", 
    status: "online", 
    type: "Friend",
    lastSeen: "5 min ago",
    unreadCount: 2
  },
  { 
    id: 5, 
    name: "Sarah Williams", 
    status: "offline", 
    type: "Friend",
    lastSeen: "2 hours ago",
    unreadCount: 0
  },
  { 
    id: 3, 
    name: "Health Club SF", 
    status: "online", 
    type: "Organization",
    lastSeen: "Just now",
    unreadCount: 5
  },
  { 
    id: 4, 
    name: "Fitness with Tom", 
    status: "away", 
    type: "Health Coach",
    lastSeen: "30 min ago",
    unreadCount: 0
  }
];

// Sample messages between Dr. Jane Smith and the current user
const sampleMessages: Message[] = [
  {
    id: 1,
    sender: 1, // Dr. Jane Smith
    recipient: 0, // Current user
    content: "Hello John, I've reviewed your latest blood work and I'm pleased to see your cholesterol levels have improved significantly!",
    timestamp: "Yesterday, 2:30 PM",
    isRead: true
  },
  {
    id: 2,
    sender: 0, // Current user
    recipient: 1, // Dr. Jane Smith
    content: "That's great news! I've been following the nutrition plan you recommended and increased my physical activity.",
    timestamp: "Yesterday, 2:45 PM",
    isRead: true
  },
  {
    id: 3,
    sender: 1, // Dr. Jane Smith
    recipient: 0, // Current user
    content: "It's clearly working well for you. I'd like to share some additional resources on heart-healthy foods to incorporate into your diet. Could you also share your activity logs from the past week?",
    timestamp: "Yesterday, 3:00 PM",
    isRead: true
  },
  {
    id: 4,
    sender: 0, // Current user
    recipient: 1, // Dr. Jane Smith
    content: "Absolutely, I'll share my activity logs right away.",
    timestamp: "Yesterday, 3:15 PM",
    isRead: true,
    attachments: [
      {
        type: "healthData",
        url: "#",
        name: "Weekly Activity Report",
        preview: "Weekly statistics: 5 workouts, 25,000 steps, 120 active minutes"
      }
    ]
  },
  {
    id: 5,
    sender: 1, // Dr. Jane Smith
    recipient: 0, // Current user
    content: "Thank you! Here are some resources on heart-healthy nutrition that complement your current plan.",
    timestamp: "Yesterday, 4:00 PM",
    isRead: true,
    attachments: [
      {
        type: "document",
        url: "#",
        name: "Heart-Healthy Nutrition Guide.pdf"
      }
    ]
  },
  {
    id: 6,
    sender: 1, // Dr. Jane Smith
    recipient: 0, // Current user
    content: "I noticed your sleep patterns have been irregular. Would you like to discuss some strategies to improve your sleep quality during our next appointment?",
    timestamp: "Today, 9:00 AM",
    isRead: false
  },
  {
    id: 7,
    sender: 1, // Dr. Jane Smith
    recipient: 0, // Current user
    content: "Also, here's an updated supplement recommendation based on your latest blood work.",
    timestamp: "Today, 9:05 AM",
    isRead: false,
    attachments: [
      {
        type: "document",
        url: "#",
        name: "Updated Supplement Plan.pdf"
      }
    ]
  },
  // Mike Johnson messages
  {
    id: 8,
    sender: 2, // Mike Johnson
    recipient: 0, // Current user
    content: "Hey I goat a Two for One Discount on Whoop Bands, want to go in?",
    timestamp: "Today, 1:15 PM",
    isRead: false
  },
  {
    id: 9,
    sender: 2, // Mike Johnson
    recipient: 0, // Current user
    content: "They're having a special promotion this week. Let me know if you're interested!",
    timestamp: "Today, 1:17 PM",
    isRead: false
  }
];

export function Messenger() {
  const [activeContact, setActiveContact] = useState<User | null>(users[0]);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Filter users when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery]);

  // Mark messages as read when changing active contact
  useEffect(() => {
    if (activeContact) {
      const updatedMessages = messages.map(msg => 
        msg.sender === activeContact.id && !msg.isRead 
          ? { ...msg, isRead: true } 
          : msg
      );
      setMessages(updatedMessages);
      
      // Update unread count in users list
      const updatedUsers = users.map(user => 
        user.id === activeContact.id ? { ...user, unreadCount: 0 } : user
      );
      // In a real app, you would update the users state here
    }
  }, [activeContact, messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeContact) return;
    
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 0, // Current user
      recipient: activeContact.id,
      content: newMessage,
      timestamp: "Just now",
      isRead: false
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };
  
  // Filter messages for the active contact
  const activeMessages = activeContact 
    ? messages.filter(msg => 
        (msg.sender === activeContact.id && msg.recipient === 0) || 
        (msg.sender === 0 && msg.recipient === activeContact.id)
      )
    : [];

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Contacts sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                className={cn(
                  "w-full p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mb-1",
                  activeContact?.id === user.id && "bg-gray-100 dark:bg-gray-700"
                )}
                onClick={() => setActiveContact(user)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.status === "online" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                    {user.status === "away" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{user.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{user.lastSeen}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.type}
                    </p>
                  </div>
                  {user.unreadCount! > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {user.unreadCount}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button className="w-full" size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>
      
      {/* Chat area */}
      {activeContact ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={activeContact.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activeContact.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{activeContact.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeContact.status === "online" ? (
                    <span className="text-green-500">● Online</span>
                  ) : activeContact.status === "away" ? (
                    <span className="text-amber-500">● Away</span>
                  ) : (
                    <span className="text-muted-foreground">● Offline</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" title="Call">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Video Call">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Contact Info">
                <Info className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Contact Profile</DropdownMenuItem>
                  <DropdownMenuItem>Health Data Permissions</DropdownMenuItem>
                  <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                  <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {activeMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    message.sender === 0 ? "ml-auto items-end" : ""
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      message.sender === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
                    )}
                  >
                    <p>{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded border p-2 flex items-center gap-2",
                              message.sender === 0
                                ? "bg-primary/80 border-primary/20"
                                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-200"
                            )}
                          >
                            {attachment.type === "document" && (
                              <FileText className="w-5 h-5" />
                            )}
                            {attachment.type === "image" && (
                              <Image className="w-5 h-5" />
                            )}
                            {attachment.type === "healthData" && (
                              <Chart className="w-5 h-5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {attachment.name}
                              </p>
                              {attachment.preview && (
                                <p className="text-xs truncate">
                                  {attachment.preview}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 px-2",
                                message.sender === 0
                                  ? "hover:bg-primary/90 text-primary-foreground"
                                  : "hover:bg-gray-100"
                              )}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs text-muted-foreground mt-1",
                      !message.isRead && message.sender === 0
                        ? "flex items-center gap-1"
                        : ""
                    )}
                  >
                    {message.timestamp}
                    {!message.isRead && message.sender === 0 && (
                      <span>• Delivered</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Compose area */}
          <div className="p-4 border-t">
            <div className="flex gap-2 items-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                    <PlusCircle className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <Image className="w-4 h-4 mr-2" />
                    Share Image
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Share Document
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Chart className="w-4 h-4 mr-2" />
                    Share Health Data
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message..."
                  className="min-h-[80px] resize-none pr-10"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 bottom-2"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
              <Button
                className="h-10 w-10 rounded-full p-0"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
            <p className="text-muted-foreground mb-6">
              Connect with your healthcare providers, friends, and wellness communities securely.
            </p>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Start a New Conversation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}