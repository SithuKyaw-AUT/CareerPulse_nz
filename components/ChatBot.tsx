
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, CareerAnalysis } from '../types';

interface Props {
  context?: CareerAnalysis | null;
}

const ChatBot: React.FC<Props> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "Summarise the dashboard",
    "Explain Core Competency Focus",
    "What do you mean by Market Demand Card?",
    "How can I negotiate salary in NZ?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let systemInstruction = `You are a helpful NZ Career Assistant. 
      IMPORTANT FORMATTING RULES:
      - Reply line-by-line. 
      - Use clear line breaks between every sentence or point. 
      - Keep language extremely simple and easy to read. 
      - Use bullet points for any lists. 
      - Avoid long paragraphs. 
      - Be concise but highly practical.`;

      if (context) {
        systemInstruction += `\n\nCURRENT CONTEXT:
        Role: "${context.roleName}"
        Location: "${context.locationName}"
        Market Demand Score: ${context.marketStats.demandScore}/10. 
        Top Skills: ${context.marketStats.topSkills.map(s => s.name).join(', ')}.
        Focus follow-up questions strictly on this analysis (roles, interview guide, or strategy). 
        If asked something unrelated, briefly guide them back to their career strategy.`;
      }

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction }
      });
      
      const response = await chat.sendMessage({ message: messageText });
      const botMsg: ChatMessage = { role: 'model', text: response.text || "Sorry, I couldn't process that." };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection error.\nPlease try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 md:w-[400px] h-[600px] shadow-2xl rounded-3xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              <div>
                <span className="font-black text-sm block">NZ Career Assistant</span>
                {context && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context: {context.roleName}</span>}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 rounded-xl p-2 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center mt-6 space-y-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-800 font-black text-lg">How can I help you today?</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 px-8">Ask about the dashboard insights, interview tips, or strategy adjustments.</p>
                </div>
                
                {/* Sample Question Chips */}
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  {sampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] font-bold bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-none shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm font-medium'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl text-slate-300 flex gap-1 shadow-sm border border-slate-100">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a follow-up question..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold placeholder-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping}
              className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-black disabled:opacity-50 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          title="Ask Assistant"
          className="bg-slate-900 text-white p-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-black hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 group"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <span className="hidden md:inline font-black text-sm uppercase tracking-widest">Ask Follow-up</span>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
