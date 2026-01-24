
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  AreaChart, Area
} from 'recharts';
import { CareerAnalysis } from '../types';

interface Props {
  data: CareerAnalysis;
}

const MarketDashboard: React.FC<Props> = ({ data }) => {
  const { marketStats } = data;

  const salaryData = marketStats.salaryData.map(d => ({
    name: d.level,
    Range: [d.min / 1000, d.max / 1000],
    Avg: (d.min + d.max) / 2000
  }));

  const skillsData = marketStats.topSkills.map(s => ({
    subject: s.name,
    A: s.importance,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Market Demand</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-indigo-600">{marketStats.demandScore}/10</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marketStats.demandScore > 7 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {marketStats.demandScore > 7 ? 'High Demand' : 'Steady'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${marketStats.demandScore * 10}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Average Mid-Career Salary</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900">${(salaryData[1]?.Avg || 0).toFixed(0)}k</span>
            <span className="text-slate-400 text-xs font-medium">NZD / yr</span>
          </div>
          <p className="text-xs text-slate-500 mt-4 italic">Based on current NZ market benchmarks</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Top Skill Trend</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">{marketStats.topSkills[0]?.name || 'N/A'}</span>
            <div className="flex items-center text-emerald-600 text-xs font-bold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              {marketStats.topSkills[0]?.demand}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Growth sector identified in {data.locationName}</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Benchmarks Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
            Salary Benchmarks (NZD)
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="k" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="Avg" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Importance Radar */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            Core Competency Focus
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <Radar name="Importance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Outlook Text */}
      <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl">
        <h4 className="text-indigo-900 font-black text-xl mb-4">Market Outlook Summary</h4>
        <div className="prose prose-indigo max-w-none text-indigo-800/80 leading-relaxed text-lg">
          {marketStats.marketOutlook}
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
