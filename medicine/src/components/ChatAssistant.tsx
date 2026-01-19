import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { ChatService, ChatMessage } from '../services/chatService';
import { GeminiService } from '../services/geminiService';

// Use the interface from the service or map it locally. 
// Since the service exports ChatMessage which matches our needs, we can assume it's compatible or just use it.
// The existing Message interface in this file is nearly identical.
interface Message extends ChatMessage { }

interface ChatAssistantProps {
  patientName?: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ patientName = 'User' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const history = await ChatService.getHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Default welcome message if history is empty
        setMessages([
          {
            id: 0, // Placeholder ID
            text: `Hello ${patientName}! I'm Robtor, your AI health assistant. How can I help you today?`,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const textToSend = inputMessage;
    setInputMessage(''); // Clear input immediately

    // Optimistic update
    const tempId = Date.now();
    const tempMessage: Message = {
      id: tempId,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Save to DB
      const savedUserMsg = await ChatService.sendMessage(textToSend, false);
      if (savedUserMsg) {
        // Replace temp message with real one (optional, but good for ID consistency)
        setMessages((prev) => prev.map(m => m.id === tempId ? savedUserMsg : m));
      }

      // Generate AI response using Gemini
      try {
        const botResponseText = await GeminiService.generateResponse(textToSend);

        // Save bot response to DB
        const savedBotMsg = await ChatService.sendMessage(botResponseText, true);
        if (savedBotMsg) {
          setMessages((prev) => [...prev, savedBotMsg]);
        }
      } catch (aiError) {
        console.error("Error generating/saving AI response:", aiError);
      }

    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-16">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center space-x-3">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-full">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Health Assistant Chat</h2>
          <p className="text-sm text-green-600">● Online - Always here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
            >
              <div
                className={`p-2 rounded-full ${message.sender === 'user'
                  ? 'bg-green-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl p-4 ${message.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                    }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your health..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your conversations are private and encrypted
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;
