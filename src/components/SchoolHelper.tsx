import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface SchoolHelperProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  profile?: UserProfile;
}

export function SchoolHelper({ isOpen, onClose, theme, profile }: SchoolHelperProps) {
  const getInitialMessage = () => {
    if (profile?.role === 'parent') {
      return 'Здравствуйте! Я консультант AQBOBEK Lyceum. Чем я могу помочь вам в вопросах воспитания и обучения вашего ребенка? 🎓';
    }
    if (profile?.role === 'teacher' || profile?.role === 'admin') {
      return 'Здравствуйте! Я методист AQBOBEK Lyceum. Чем могу помочь в организации учебного процесса? 📚';
    }
    return 'Привет! Я твой наставник AQBOBEK Lyceum. Чем я могу помочь тебе сегодня в учебе или школьной жизни? 🎓';
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: getInitialMessage() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let systemInstruction = "Ты — умный наставник школы 'AQBOBEK Lyceum'. Твоя задача — помогать ученикам с домашним заданием, объяснять сложные темы (математика, физика, информатика) простым языком и давать рекомендации по профориентации. Отвечай кратко, дружелюбно, используй эмодзи и общайся на русском языке. Не называй себя искусственным интеллектом, веди себя естественно.";
      
      if (profile?.role === 'parent') {
        systemInstruction = "Ты — опытный педагог-психолог и консультант школы 'AQBOBEK Lyceum'. Твоя задача — помогать родителям: давать советы по воспитанию, мотивации ребенка к учебе, решению конфликтов и выстраиванию доверительных отношений. Отвечай кратко, профессионально, дружелюбно, используй эмодзи и общайся на русском языке. Не называй себя искусственным интеллектом, веди себя естественно как человек-консультант.";
      } else if (profile?.role === 'teacher' || profile?.role === 'admin') {
        systemInstruction = "Ты — методист и консультант школы 'AQBOBEK Lyceum'. Твоя задача — помогать учителям и администрации с учебными планами, методиками преподавания и организацией учебного процесса. Отвечай профессионально, дружелюбно, используй эмодзи и общайся на русском языке. Не называй себя искусственным интеллектом, веди себя естественно.";
      }
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
            systemInstruction: systemInstruction,
        }
      });

      const botResponse = response.text || "Извините, я не смог обработать этот запрос.";
      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            "fixed bottom-24 right-8 w-[400px] h-[600px] rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden border",
            theme === 'dark' ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
          )}
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-purple-500 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Консультант AQBOBEK</h3>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Ваш помощник</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.map((m, i) => (
              <motion.div
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-purple-500" : "bg-gray-800"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-purple-400" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-purple-500 text-white rounded-tr-none" 
                    : theme === 'dark' ? "bg-white/5 text-gray-200 rounded-tl-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
                )}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm bg-white/5 flex items-center gap-2",
                  theme === 'dark' ? "text-gray-400" : "text-gray-500"
                )}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/10">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className={cn(
                  "w-full pl-6 pr-14 py-4 rounded-2xl border outline-none focus:border-purple-500 transition-all font-medium",
                  theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                )}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-3 bg-purple-500 text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
