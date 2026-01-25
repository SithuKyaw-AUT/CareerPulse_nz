import React, { useState, useCallback, useMemo } from 'react';
import { GeminiService } from './services/geminiService';
import { CareerAnalysis, StrategyItem } from './types';
import JobResults from './components/JobResults';
import InterviewGuide from './components/InterviewGuide';
import MarketDashboard from './components/MarketDashboard';
import ChatBot from './components/ChatBot';
import { DataQualityBadge } from './components/DataQualityBadge';

const App: React.FC = () => {
  const gemini = useMemo(() => new GeminiService(), []);

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CareerAnalysis | null>(null);
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'interview' | 'strategy'>('dashboard');

  const mainSuggestions = [
    "Project Management in Auckland",
    "Junior Developer in Wellington",
    "Registered Nurse in Christchurch",
    "Accountant in Hamilton",
    "GIS Analyst in Wellington"
  ];

  const handleSearch = useCallback(async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchVal = customQuery || query;
    if (!searchVal.trim()) return;
    
    setQuery(searchVal);
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await gemini.analyzeRole(searchVal);
      setResult(analysis);
      setActiveTab('dashboard');
    } catch (err: any) {
      console.error("Search error:", err);
      const errText = err.message || err.toString();
      
      if (errText.includes('429') || err.status === 429 || errText.includes('RESOURCE_EXHAUSTED')) {
        setError({
          title: "Rate Limit Reached",
          msg: "The AI service is currently at capacity. Please wait about 60 seconds and try again."
        });
      } else {
        setError({
          title: "Analysis Error",
          msg: "The AI is currently busy or encountered an error. Please check your API key in the environment variables and try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, gemini]);

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

      <div className="bg-white border-b border-slate-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Your NZ Job Search & Strategy Partner.
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium text-lg mb-10">
            Tell us the roles you want. We'll find current job listings, market intelligence, and prepare you for the interview.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <form onSubmit={(e) => handleSearch(e)} className="relative mb-6">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-2 gap-2 sm:gap-0">
                  <div className="hidden sm:flex pl-5 text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Insights Analyst in Auckland ..."
                    className="flex-1 px-5 py-4 text-lg sm:text-xl text-slate-800 placeholder-slate-300 font-semibold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 min-w-full sm:min-w-[140px]"
                  >
                    {isLoading ? 'Processing...' : 'Analyse'}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 self-center">Try:</span>
              {mainSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(undefined, suggestion)}
                  className="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="mt-6 animate-pulse flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Gathering market data and searching live jobs...</span>
              </div>
            )}

            {error && (
              <div className="mt-8 p-8 bg-white border border-slate-200 rounded-[2rem] text-left shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 font-bold">!</div>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{error.title}</h4>
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{error.msg}</p>
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
            {/* DATA QUALITY BADGE - Shows reliability of analysis */}
            <DataQualityBadge 
              dataQuality={result.dataQuality}
              groundingLinks={result.groundingLinks}
            />

            <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                  <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-2 block">Market Report</span>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{result.roleName}</h3>
                  <p className="text-slate-500 font-bold text-lg mt-1 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {result.locationName}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col items-end">
                    <h4 className="text-indigo-900 font-black text-xl uppercase tracking-tight">NZ Job Pro Tip</h4>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 max-w-[200px]">
                      {result.nzProTip}
                    </p>
                  </div>
                  <div className="w-1.5 h-12 bg-indigo-600 rounded-full"></div>
                </div>
              </div>

              <div className="flex justify-center border-b border-slate-200">
                <div className="flex gap-4 md:gap-16 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'dashboard', label: 'Intelligence', icon: '📈' },
                    { id: 'jobs', label: 'Advertised Roles', icon: '📫' },
                    { id: 'strategy', label: 'Winning Strategy', icon: '🎯' },
                    { id: 'interview', label: 'Interview Prep', icon: '🤝' }
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