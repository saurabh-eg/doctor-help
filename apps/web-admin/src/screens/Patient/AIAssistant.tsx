
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hello! I'm your AI health assistant. I can help you understand symptoms or answer general wellness questions. Please remember, I'm not a doctor." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: "You are a helpful and empathetic medical AI assistant. Provide concise, clear, and informative answers. Always include a disclaimer that you are an AI and not a substitute for professional medical advice. Suggest seeing a doctor for severe symptoms."
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to health services. Check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-background-dark">
      <header className="px-5 pt-12 pb-4 bg-primary text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-display font-bold">Health AI</h1>
            <div className="flex items-center gap-1">
              <span className="size-1.5 bg-green-400 rounded-full"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Online Assistant</span>
            </div>
          </div>
        </div>
        <div className="size-10 rounded-xl bg-accent text-slate-900 flex items-center justify-center">
          <span className="material-symbols-outlined filled">smart_toy</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-soft ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-surface-dark p-4 rounded-2xl flex gap-1">
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your symptom..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 h-14 text-sm focus:ring-2 focus:ring-primary transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
