import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Sparkles, User, HelpCircle, ArrowRight, 
  Trash2, Plus, RefreshCw, ClipboardList, Dumbbell 
} from 'lucide-react';
import { Message, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithCoach } from '../lib/gemini';

interface AICoachProps {
  userProfile: UserProfile;
  chatHistory: Message[];
  onAddChatMessage: (msg: Message) => void;
  onClearChatHistory: () => void;
  onLogMealFromCoach: (meal: { name: string; calories: number; protein: number; carbs: number; fat: number }) => void;
}

const PRESET_PROMPTS = [
  {
    icon: <ClipboardList className="w-3.5 h-3.5 text-blue-400" />,
    label: "High-Protein Meals",
    prompt: "Give me a detailed high-protein diet recommendation for breakfast, lunch and dinner within my targets.",
  },
  {
    icon: <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />,
    label: "Custom Workout",
    prompt: "Suggest a 20-minute fat-burning full-body routine that I can do at home with minimal equipment.",
  },
  {
    icon: <Bot className="w-3.5 h-3.5 text-amber-500" />,
    label: "Metabolism Hacks",
    prompt: "What are science-backed ways to optimize my metabolic rate and keep my energy high?",
  },
];

export default function AICoach({
  userProfile,
  chatHistory,
  onAddChatMessage,
  onClearChatHistory,
  onLogMealFromCoach,
}: AICoachProps) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coachError, setCoachError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever history changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    // 1. Add user message to state
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddChatMessage(userMsg);
    setUserInput('');
    setIsLoading(true);
    setCoachError('');

    // Prepare message list including the new user message
    const updatedMessages = [...chatHistory, userMsg];

    try {
      const replyText = await chatWithCoach(updatedMessages, userProfile);
      const aiMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddChatMessage(aiMsg);
    } catch (err: any) {
      console.error("AI Coach connection error:", err);
      setCoachError('Unable to connect to AI Coach. Running in offline mode.');
      
      // Fallback response so user doesn't get blocked
      const fallbackMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'ai',
        text: `### Coach Connection Restoring... 📡\n\nI am currently operating in basic offline mode. Let's make sure you stay on track!\n\n*   **Hydration**: Drink 500ml of water right now.\n*   **Protein target**: Ensure you hit **${userProfile.proteinGoal}g** today.\n*   **Movement**: Do 10 bodyweight squats to restart muscle tone.\n\nAsk me anything once your API connection is fully stabilized!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddChatMessage(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  // Simple parser to render Markdown styling manually and cleanly
  const renderMessageContent = (text: string) => {
    // Basic formatting for headers, bullets, bolding, and tables
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // 1. Headers e.g., ### Title
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-emerald-400 mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-white mt-4 mb-1.5">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }

      // 2. Bold tags
      let renderedLine: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        renderedLine = parts.map((part, pIdx) => {
          return pIdx % 2 === 1 ? <strong key={pIdx} className="text-emerald-300 font-bold">{part}</strong> : part;
        });
      }

      // 3. Bullet points e.g., * Item or - Item
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const cleanText = line.replace(/^[\*\-]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-2 my-1 text-xs text-gray-300">
            <span className="text-emerald-400 font-bold shrink-0">•</span>
            <span>{cleanText.includes('**') ? renderedLine : cleanText}</span>
          </div>
        );
      }

      // 4. Tables parsing (Simple check for pipe character)
      if (line.startsWith('|') && line.endsWith('|')) {
        // Skip separator line e.g., | :--- | :--- |
        if (line.includes('---')) return null;
        
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        const isHeader = idx === 0 || lines[idx - 1]?.includes('---');
        
        return (
          <div key={idx} className={`grid grid-cols-4 gap-2 py-1.5 px-2 border-b border-gray-800/60 text-[10px] ${isHeader ? 'bg-gray-900 font-bold text-white' : 'text-gray-300'}`}>
            {cols.map((col, cIdx) => (
              <span key={cIdx} className="truncate">{col}</span>
            ))}
          </div>
        );
      }

      // 5. Standard paragraph
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="text-xs text-gray-300 leading-relaxed mb-1.5">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div id="ai-coach-root" className="flex flex-col h-[calc(100vh-140px)] min-h-125 font-sans text-gray-100">
      
      {/* Upper header */}
      <div id="coach-header" className="flex items-center justify-between border-b border-gray-800/60 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            AI Performance Coach
          </h1>
          <p className="text-[11px] text-gray-400">
            Highly personalized health suggestions synced directly with your daily calorie limits.
          </p>
        </div>
        
        {chatHistory.length > 0 && (
          <button
            onClick={onClearChatHistory}
            className="text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-red-400 px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Main chat panel */}
      <div className="flex-1 bg-[#141A21] border border-gray-800/60 rounded-2xl flex flex-col overflow-hidden relative shadow-xl">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500 to-teal-500"></div>

        {/* Message streams list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {chatHistory.length === 0 ? (
            /* Empty state prompting suggestions */
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">No Messages Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                Ask your AI Coach about custom macros, fat loss plans, or detailed high-protein diet recommendations.
              </p>

              {/* Presets */}
              <div className="w-full max-w-md space-y-2">
                {PRESET_PROMPTS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="w-full bg-[#1C252F] hover:bg-[#25323F] border border-gray-800/60 hover:border-emerald-500/40 p-3 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-900">
                        {item.icon}
                      </div>
                      <span className="font-semibold text-gray-200">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Icon badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-500 text-white border-emerald-400' 
                      : 'bg-gray-900 text-emerald-400 border-gray-800'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble content */}
                  <div>
                    <div className={`rounded-2xl p-4 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-[#10B981] text-white rounded-tr-none'
                        : 'bg-[#1C252F] border border-gray-800 text-gray-100 rounded-tl-none'
                    }`}>
                      {msg.sender === 'user' ? (
                        <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="space-y-1">{renderMessageContent(msg.text)}</div>
                      )}
                    </div>
                    <span className={`block text-[8px] text-gray-500 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3.5 mr-auto max-w-[85%]">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 text-emerald-400 border border-gray-800 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#1C252F] border border-gray-800 rounded-2xl p-4 shadow-md rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel form */}
        <div className="p-4 border-t border-gray-800/60 bg-[#141A21]">
          {coachError && (
            <div className="mb-3 p-2 bg-amber-950/20 border border-amber-800/40 text-amber-300 text-[10px] rounded-lg">
              {coachError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              id="coach-chat-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask your Coach (e.g. 'Give me a leg routine' or 'Analyze my weight')"
              disabled={isLoading}
              className="flex-1 bg-[#1C252F] border border-gray-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              id="coach-send-btn"
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-white p-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
