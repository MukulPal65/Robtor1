import React, { useState } from 'react';
import { Send, Bot, User, Shield } from 'lucide-react';
import { ChatService, ChatMessage } from '../services/chatService';
import { GeminiService } from '../services/geminiService';
import { ReportService } from '../services/reportService';
import { HealthService } from '../services/healthService';

interface Message extends ChatMessage { }

interface ChatAssistantProps {
  patientName?: string;
}

const FormattedMessage: React.FC<{ text: string; isBot: boolean }> = ({ text, isBot }) => {
  if (!isBot) {
    return <p className="text-sm whitespace-pre-wrap font-medium">{text}</p>;
  }

  const formatText = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, index) => {
      if (para.includes('•') || para.match(/^[•\-\*]\s/m)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ul key={index} className="space-y-2 my-4 ml-2 border-l-2 border-blue-500/20 pl-4">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-gray-700">
                {item.replace(/^[•\-\*]\s/, '')}
              </li>
            ))}
          </ul>
        );
      }

      if (para.match(/^\d+\.\s/m)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ol key={index} className="space-y-2 my-4 ml-6 list-decimal">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-gray-700">
                {item.replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        );
      }

      const parts = para.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-sm my-3 leading-relaxed text-gray-700 font-medium">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-gray-900 font-black">{part.slice(2, -2)}</strong>;
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
        setMessages([
          {
            id: 0,
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

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    const textToSend = inputMessage;
    setInputMessage('');

    const tempId = Date.now();
    const tempMessage: Message = {
      id: tempId,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const savedUserMsg = await ChatService.sendMessage(textToSend, false);
      if (savedUserMsg) {
        setMessages((prev) => prev.map(m => m.id === tempId ? savedUserMsg : m));
      }

      const recentMessages = messages.slice(-10);
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      let contextInfo = '';
      try {
        const [latestReport, todayMetric] = await Promise.all([
          ReportService.getLatestReport(),
          HealthService.getTodayMetric()
        ]);
        if (latestReport?.analysis_result) {
          const report = latestReport.analysis_result;
          contextInfo += `\n\nContext: Health Score ${report.health_score}, ${report.summary}`;
        }
        if (todayMetric) {
          contextInfo += `\nMetrics: HR ${todayMetric.heart_rate}, Steps ${todayMetric.steps}`;
        }
      } catch (err) { }

      try {
        const enhancedMessage = textToSend + contextInfo;
        const botResponseText = await GeminiService.generateResponse(enhancedMessage, conversationHistory);
        const savedBotMsg = await ChatService.sendMessage(botResponseText, true);
        if (savedBotMsg) {
          setMessages((prev) => [...prev, savedBotMsg]);
        }
      } catch (aiError) {
        console.error(aiError);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 shadow-sm">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Health Intel</h2>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Active Processing</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
          <Shield className="w-3 h-3 text-blue-500" />
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">AES-256 SECURED</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-12">
        {messages.map((message) => {
          const isBot = message.sender === 'bot';
          return (
            <div
              key={message.id}
              className={`flex ${isBot ? 'justify-start' : 'justify-end'} group animate-fade-in`}
            >
              <div className={`flex items-start max-w-[85%] sm:max-w-[70%] space-x-4 ${!isBot ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-3 rounded-2xl border shadow-md flex-shrink-0 transition-transform group-hover:scale-110 ${isBot ? 'bg-white border-blue-200 text-blue-600' : 'bg-blue-600 border-blue-500/20 text-white'
                  }`}>
                  {isBot ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="space-y-1 text-left">
                  <div className={`rounded-3xl p-6 shadow-md ${isBot
                    ? 'bg-white border border-blue-100 text-gray-700'
                    : 'bg-blue-600 text-white font-medium shadow-blue-500/20'
                    }`}>
                    <FormattedMessage text={message.text} isBot={isBot} />
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 opacity-60 ${isBot ? 'text-gray-400' : 'text-blue-600'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Using glassmorphism floating island */}
      <div className="p-6 relative z-10">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
          <div className="relative bg-white border border-blue-200 rounded-[2rem] p-2 flex items-center shadow-xl">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message Robtor..."
              className="flex-1 bg-transparent border-none text-gray-800 placeholder-gray-400 px-6 py-4 focus:outline-none focus:ring-0 text-sm font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className={`p-4 rounded-2xl transition-all duration-300 ${inputMessage.trim()
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95'
                : 'bg-gray-100 text-gray-400'
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
