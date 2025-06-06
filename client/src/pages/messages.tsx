import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { useNotifications } from '@/lib/notifications';

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const [recipientId, setRecipientId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!recipientId) return;
    const fetchMessages = async () => {
      try {
        const res = await apiRequest('GET', `/api/messages/${recipientId}`);
        const data = await res.json();
        setMessages(data);
        refresh();
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
    const id = setInterval(fetchMessages, 5000);
    return () => clearInterval(id);
  }, [recipientId]);

  const sendMessage = async () => {
    if (!message.trim() || !recipientId) return;
    try {
      await apiRequest('POST', '/api/messages', {
        recipientId: parseInt(recipientId),
        content: message,
      });
      setMessage('');
      const res = await apiRequest('GET', `/api/messages/${recipientId}`);
      const data = await res.json();
      setMessages(data);
      refresh();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const blockCurrentUser = async () => {
    if (!recipientId) return;
    try {
      await apiRequest('POST', '/api/block', { blockedId: parseInt(recipientId) });
    } catch (err) {
      console.error('Failed to block user', err);
    }
  };

  const reportMessage = async (id: number) => {
    try {
      await apiRequest('POST', `/api/messages/${id}/report`, { reason: 'inappropriate' });
    } catch (err) {
      console.error('Failed to report message', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Inbox</CardTitle>
          {recipientId && (
            <Button variant="outline" size="sm" onClick={blockCurrentUser}>
              Block User
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Recipient ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-32"
            />
            <Button onClick={() => setRecipientId(recipientId)}>Open</Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 border p-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2 rounded-lg ${msg.senderId === user?.id ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(
                      new Date(msg.timestamp),
                    )}
                  </p>
                </div>
                {msg.senderId !== user?.id && (
                  <Button variant="ghost" size="xs" onClick={() => reportMessage(msg.id)}>
                    Report
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
