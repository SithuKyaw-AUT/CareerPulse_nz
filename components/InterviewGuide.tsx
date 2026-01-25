
import React, { useState } from 'react';
import { CareerAnalysis, InterviewQuestion } from '../types';

interface Props {
  data: CareerAnalysis;
}

const InterviewGuide: React.FC<Props> = ({ data }) => {
  const [filter, setFilter] = useState<string>('All');
  const categories = ['All', 'Behavioral', 'Technical', 'Cultural', 'Situational'];

  const filteredQuestions = filter === 'All' 
    ? data.interviewGuide 
    : data.interviewGuide.filter(q => q.category === filter);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Performance Guide</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-impact prep for the NZ interview stage</p>
            </div>
          </div>
          <p className="text-slate-500 font-medium">15 curated questions with NZ-specific rationale and winning techniques.</p>
        </div>

        {/* Improved Sub-page Tabs Visibility */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all border ${
                filter === cat 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 flex flex-col md:flex-row items-center gap-6 mb-12">
        <div className="text-4xl">💡</div>
        <div>
          <h4 className="font-black uppercase tracking-widest text-sm text-indigo-400">Preparation Strategy</h4>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            In New Zealand, hiring managers look for evidence of your 'soft skills' as much as your 'hard skills'. Use the behavioral sections to highlight how you handle interpersonal challenges in a Kiwi workplace environment.
          </p>
        </div>
      </div>
      
      <div className="grid gap-8">
        {filteredQuestions.length > 0 ? filteredQuestions.map((item, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col md:flex-row">
            <div className="md:w-20 bg-slate-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
              <span className="text-3xl font-black text-slate-200">{idx + 1}</span>
            </div>
            
            <div className="flex-1 p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  item.category === 'Technical' ? 'bg-indigo-100 text-indigo-700' : 
                  item.category === 'Behavioral' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {item.category}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {item.technique.split(' ')[0]} Focus
                </span>
              </div>
              
              <h4 className="text-2xl font-black text-slate-900 mb-8 leading-tight">
                {item.question}
              </h4>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      Why this matters in NZ
                    </p>
                    <p className="text-slate-600 italic text-sm leading-relaxed font-medium">"{item.rationale}"</p>
                  </div>

                  <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                      Expert Technique
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed font-bold">{item.technique}</p>
                  </div>
                </div>

                <div className="border-l-4 border-slate-900 pl-8 py-2 bg-slate-50/30 rounded-r-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Winning Sample Answer</p>
                  <p className="text-slate-800 font-semibold text-lg leading-relaxed">
                    {item.exampleAnswer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No questions found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewGuide;
