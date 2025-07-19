import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const socket = io("http://localhost:3001");

export default function ChatApp() {
  const [username] = useState(`User-${Math.floor(Math.random() * 1000)}`);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.emit("set_username", username);
        
    socket.on("receive_message", (data) => {
      setChat((prev) => {
        if (
          prev.length === 0 ||
          prev[prev.length - 1].text !== data.text ||
          prev[prev.length - 1].user !== data.user
        ) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on("user_typing", (sender) => {
        
      if (sender !== username) {
        setTyping(`${sender} is typing...`);
        setTimeout(() => setTyping(""), 2000);
      }
    });
  }, [username]);

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit("send_message", message);
    setMessage("");
  };

  const handleTyping = () => {
    socket.emit("typing");
  };

  return (
   <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 p-4 overflow-hidden">
    
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg">💬 Real-Time Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ScrollArea className="h-64 p-2 border rounded-md bg-muted overflow-y-auto">
            {chat.map((msg, idx) => (
              <div key={idx} className="text-sm mb-2">
                <span className="font-semibold">
                  {msg.user === username ? "You" : msg.user}:
                </span>{" "}
                {msg.text}
              </div>
            ))}
          </ScrollArea>
          <p className="text-xs text-muted-foreground min-h-[1.5rem]">{typing}</p>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} variant="default">Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}