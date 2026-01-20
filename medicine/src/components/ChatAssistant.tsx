import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { ChatService, ChatMessage } from '../services/chatService';
import { GeminiService } from '../services/geminiService';
import { ReportService } from '../services/reportService';
import { HealthService } from '../services/healthService';

// Use the interface from the service or map it locally. 
// Since the service exports ChatMessage which matches our needs, we can assume it's compatible or just use it.
// The existing Message interface in this file is nearly identical.
interface Message extends ChatMessage { }

interface ChatAssistantProps {
  patientName?: string;
}

// Helper component to format bot messages
const FormattedMessage: React.FC<{ text: string; isBot: boolean }> = ({ text, isBot }) => {
  if (!isBot) {
    return <p className="text-sm whitespace-pre-wrap">{text}</p>;
  }

  // Format bot messages with structure
  const formatText = (content: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((para, index) => {
      // Check if it's a bullet list
      if (para.includes('•') || para.match(/^[•\-\*]\s/m)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ul key={index} className="space-y-1 my-2 ml-4">
            {items.map((item, i) => (
              <li key={i} className="text-sm">
                {item.replace(/^[•\-\*]\s/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a numbered list
      if (para.match(/^\d+\.\s/m)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ol key={index} className="space-y-1 my-2 ml-4 list-decimal">
            {items.map((item, i) => (
              <li key={i} className="text-sm">
                {item.replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph - render bold text
      const parts = para.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-sm my-2">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return <div className="space-y-1">{formatText(text)}</div>;
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ patientName = 'User' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
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
    }
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

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

      // Build conversation history for context (last 10 messages)
      const recentMessages = messages.slice(-10);
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Get user's latest health data to provide context
      let contextInfo = '';
      try {
        const [latestReport, todayMetric] = await Promise.all([
          ReportService.getLatestReport(),
          HealthService.getTodayMetric()
        ]);

        if (latestReport?.analysis_result) {
          const report = latestReport.analysis_result;
          contextInfo += `\n\n[User's Recent Health Report Context - Use this to personalize your response]:
- Health Score: ${report.health_score}/100
- Summary: ${report.summary}`;
          
          if (report.results && report.results.length > 0) {
            contextInfo += '\n- Recent Test Results: ';
            report.results.slice(0, 3).forEach((r: any) => {
              contextInfo += `${r.test_name}: ${r.value} (${r.status}), `;
            });
          }
        }

        if (todayMetric) {
          contextInfo += `\n- Today's Metrics: Steps: ${todayMetric.steps || 0}, Heart Rate: ${todayMetric.heart_rate || 'N/A'}, Sleep: ${todayMetric.sleep_hours || 'N/A'}h`;
        }
      } catch (err) {
        console.log('Could not fetch health context:', err);
      }

      // Generate AI response using Gemini with conversation history and health context
      try {
        const enhancedMessage = textToSend + contextInfo;
        const botResponseText = await GeminiService.generateResponse(enhancedMessage, conversationHistory);

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
                  <FormattedMessage text={message.text} isBot={message.sender === 'bot'} />
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
