
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
      // Always initialize GoogleGenAI with { apiKey: process.env.API_KEY } as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let systemInstruction = `You are a direct and specific NZ Career Assistant. 
      STRICT RULES:
      - Answer ONLY the specific question asked. 
      - DO NOT include introductory filler (e.g., "Certainly!", "That's a great question").
      - DO NOT provide general context or extra explanation unless it is part of the answer.
      - Reply line-by-line. 
      - Use clear line breaks between every point. 
      - Keep language simple.
      - Use bullet points for lists.`;

      if (context) {
        systemInstruction += `\n\nCONTEXT (Use only if relevant to the question):
        Role: "${context.roleName}"
        Location: "${context.locationName}"
        Demand Score: ${context.marketStats.demandScore}/10. 
        Top Skills: ${context.marketStats.topSkills.map(s => s.name).join(', ')}.`;
      }

      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction }
      });
      
      // Explicitly typing response as GenerateContentResponse
      const response: GenerateContentResponse = await chat.sendMessage({ message: messageText });
      const botMsg: ChatMessage = { role: 'model', text: response.text || "Sorry, I couldn't process that." };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Connection error. Please try again.";
      if (error.message?.includes('429') || error.status === 429 || error.toString().includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "I've reached my rate limit for now. Please wait a minute before asking another question.";
      } else if (error.message?.includes('Key')) {
        errorMsg = "The AI Assistant is unavailable because the API Key is missing from the environment.";
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
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
                <span className="font-black text-sm block">NZ Assistant</span>
                {context && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{context.roleName}</span>}
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
                  <p className="text-slate-800 font-black text-lg">Direct follow-up help.</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 px-8">Select a shortcut or type your question.</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  {sampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="text-[10px] font-black uppercase tracking-tight bg-white border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
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

          {/* Input Area with Integrated Suggestions */}
          <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
            {messages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap text-[9px] font-black uppercase tracking-tighter bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
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
          <span className="hidden md:inline font-black text-sm uppercase tracking-widest">Ask Assistant</span>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
