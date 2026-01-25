
import React, { useState, useCallback, useMemo } from 'react';
import { GeminiService } from './services/geminiService';
import { CareerAnalysis, StrategyItem } from './types';
import JobResults from './components/JobResults';
import InterviewGuide from './components/InterviewGuide';
import MarketDashboard from './components/MarketDashboard';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const gemini = useMemo(() => new GeminiService(), []);

  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CareerAnalysis | null>(null);
  const [error, setError] = useState<{title: string, msg: string, raw?: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'interview' | 'strategy'>('dashboard');

  const handleSearch = useCallback(async (e?: React.FormEvent, customNotes?: string) => {
    if (e) e.preventDefault();
    const finalNotes = customNotes || notes;
    if (!finalNotes.trim() || finalNotes.length < 10) {
      setError({
        title: "More Info Needed",
        msg: "Please provide a few more details about your skills or the roles you're interested in (at least 10 characters)."
      });
      return;
    };
    
    setNotes(finalNotes);
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await gemini.analyzeRole(finalNotes);
      setResult(analysis);
      setActiveTab('dashboard');
    } catch (err: any) {
      console.error("Analysis error:", err);
      const errText = err.message || err.toString();
      
      if (errText.includes('API_KEY_MISSING')) {
        setError({
          title: "API Key Not Found",
          msg: "Your Vercel environment variable 'API_KEY' is missing. Please add it and REDEPLOY your app.",
          raw: errText
        });
      } else if (errText.includes('429')) {
        setError({
          title: "Rate Limit",
          msg: "The AI is processing many requests. Please wait 60 seconds and try again.",
          raw: errText
        });
      } else {
        setError({
          title: "Analysis Failure",
          msg: "We couldn't process your notes. This usually happens if the AI model is temporarily unavailable or the API key is invalid.",
          raw: errText
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [notes, gemini]);

  const renderStrategyByLevel = () => {
    if (!result) return null;
    const levels: StrategyItem['level'][] = ['Entry', 'Junior', 'Mid-Senior', 'Senior', 'General'];
    
    return (
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
           </div>
           <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">The Winning Strategy</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personalized career roadmap with tactical moves</p>
           </div>
        </div>

        {levels.map(level => {
          const levelItems = result.suggestions.filter(s => s.level === level);
          if (levelItems.length === 0) return null;

          return (
            <div key={level} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Level:</span>
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  level === 'Entry' ? 'bg-blue-100 text-blue-700' :
                  level === 'Junior' ? 'bg-emerald-100 text-emerald-700' :
                  level === 'Mid-Senior' ? 'bg-indigo-100 text-indigo-700' :
                  level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {level}
                </span>
              </div>
              
              <div className="grid gap-6">
                {levelItems.map((s, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">Tactical Move</span>
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{s.timeline}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-3">{s.title}</h4>
                    <p className="text-slate-600 text-lg leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      {/* Navbar */}
      <nav className="bg-white/95 border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-2.5 rounded-2xl shadow-xl shadow-indigo-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Kia Ora <span className="text-indigo-600">Careers</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Career Intelligence</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <div className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-[900] text-indigo-600 mb-6 tracking-tighter leading-tight">
            NZ Career Navigator
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium text-lg mb-10">
            Paste your raw notes, skills, or desired roles below. Our AI will scan the NZ market, find live jobs, and build your winning strategy.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative mb-6">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                <div className="relative bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden p-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. I have 3 years of admin experience and I'm looking for HR roles in Auckland. I'm great with Xero and people management..."
                    className="w-full h-40 px-6 py-4 text-lg text-slate-800 placeholder-slate-300 font-semibold focus:outline-none resize-none no-scrollbar"
                  />
                  <div className="flex items-center justify-between mt-2 px-3 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raw Notes Input Mode</span>
                    <button
                      type="submit"
                      disabled={isLoading || notes.length < 10}
                      className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Analysing Market...
                        </div>
                      ) : 'Analyse My Potential'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-8 p-8 bg-red-50 border border-red-100 rounded-[2rem] text-left animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-black">!</div>
                  <h4 className="font-black text-red-900 uppercase tracking-widest text-sm">{error.title}</h4>
                </div>
                <p className="text-red-700 text-base font-medium leading-relaxed mb-4">{error.msg}</p>
                {error.raw && (
                  <details className="text-[10px] text-red-400/60 font-mono">
                    <summary className="cursor-pointer hover:underline">Show technical debug info</summary>
                    <div className="mt-2 p-3 bg-white/50 rounded-xl overflow-x-auto whitespace-pre-wrap">
                      {error.raw}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {isLoading && (
          <div className="space-y-8 animate-pulse">
            <div className="h-48 bg-slate-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-slate-100 rounded-3xl"></div>
              <div className="h-64 bg-slate-100 rounded-3xl"></div>
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-12">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-2 block">Market Extraction</span>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{result.roleName}</h3>
                  <p className="text-slate-500 font-bold text-lg mt-1 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {result.locationName}
                  </p>
                </div>
              </div>

              <div className="flex justify-center border-b border-slate-200">
                <div className="flex gap-4 md:gap-16 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'dashboard', label: 'Market Intelligence', icon: '📈' },
                    { id: 'jobs', label: 'Live NZ Jobs', icon: '📫' },
                    { id: 'strategy', label: 'Personalized Strategy', icon: '🎯' },
                    { id: 'interview', label: 'Prep Guide', icon: '🤝' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative flex items-center gap-3 px-4 py-5 transition-all whitespace-nowrap group ${
                        activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span className={`text-2xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'scale-110' : ''}`}>{tab.icon}</span>
                      <span className={`text-sm font-black uppercase tracking-[0.15em] ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-600 rounded-full animate-in slide-in-from-left-2 duration-300"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === 'dashboard' && <MarketDashboard data={result} />}
              {activeTab === 'jobs' && <div className="max-w-4xl mx-auto"><JobResults data={result} /></div>}
              {activeTab === 'strategy' && renderStrategyByLevel()}
              {activeTab === 'interview' && <div className="max-w-4xl mx-auto"><InterviewGuide data={result} /></div>}
            </div>
          </div>
        )}
      </main>

      <ChatBot context={result} />
    </div>
  );
};

export default App;
