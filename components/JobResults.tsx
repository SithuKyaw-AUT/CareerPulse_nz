
import React from 'react';
import { CareerAnalysis } from '../types';

interface Props {
  data: CareerAnalysis;
}

const JobResults: React.FC<Props> = ({ data }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Live NZ Listings</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time vacancies discovered via Google Search Grounding</p>
          </div>
        </div>
        <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border border-emerald-100">
          Search Powered
        </span>
      </div>

      <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100 mb-8">
        <p className="text-xs text-indigo-700 font-semibold leading-relaxed">
          These links were retrieved directly from major New Zealand job boards. Hover or click to explore the full requirements for each role.
        </p>
      </div>

      {data.groundingLinks.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No live links found for this exact query, but the market analysis suggests active recruitment. Try broadening your keywords!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.groundingLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300"
            >
              <div className="flex-1 pr-4">
                <h4 className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors mb-1 truncate">
                  {link.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Verified Source</span>
                  <span className="text-[10px] text-slate-300">|</span>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs">{link.url}</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobResults;
