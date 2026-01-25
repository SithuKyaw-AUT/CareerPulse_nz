
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell
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
    Importance: s.importance,
    fullMark: 100,
  }));

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Summary section */}
      <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
          <div>
            <h4 className="text-indigo-900 font-black text-2xl uppercase tracking-tight">Summary</h4>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">High-level synthesis of current NZ market conditions</p>
          </div>
        </div>
        <div className="prose prose-indigo max-w-none text-indigo-800/80 leading-relaxed text-lg font-medium">
          {marketStats.marketOutlook}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group">
          <div className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Market Demand</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-indigo-600">{marketStats.demandScore}/10</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marketStats.demandScore > 7 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {marketStats.demandScore > 7 ? 'High Demand' : 'Steady'}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">Current job volume vs candidate availability</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${marketStats.demandScore * 10}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group">
           <div className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Avg Mid-Career Salary</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900">${(salaryData[1]?.Avg || 0).toFixed(0)}k</span>
            <span className="text-slate-400 text-xs font-medium">NZD / yr</span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">Estimates based on recent advertised listings</p>
          <p className="text-xs text-slate-500 mt-4 italic">Benchmarked for local NZ markets</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group">
           <div className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Top Skill Trend</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">{marketStats.topSkills[0]?.name || 'N/A'}</span>
            <div className="flex items-center text-emerald-600 text-xs font-bold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              {marketStats.topSkills[0]?.demand}
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">The most 'in-demand' competency right now</p>
          <p className="text-xs text-slate-500 mt-4 font-medium uppercase tracking-tighter">Verified High Interest Sector</p>
        </div>
      </div>

      {/* Regional Comparison Chart for National Queries */}
      {marketStats.cityComparison && marketStats.cityComparison.length > 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
              Regional Demand Comparison
            </h4>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              Across Major NZ Hubs
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6">Visualizing demand hotspots for this role across New Zealand's main economic centers.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketStats.cityComparison} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis dataKey="city" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {marketStats.cityComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
              Salary Benchmarks (NZD)
            </h4>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              Growth Path Visualization
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6">Showing entry-level through senior averages to help you plan your career trajectory.</p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="k" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                />
                <Bar dataKey="Avg" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Core Competency Focus
            </h4>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              Employer Expectations Radar
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-6">A spatial view of which skills are currently being prioritized by NZ hiring managers.</p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="45%" outerRadius="70%" data={skillsData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800, width: 80 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                <Radar 
                  name="Priority Score" 
                  dataKey="Importance" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.5} 
                  strokeWidth={3}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }} 
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{value}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;