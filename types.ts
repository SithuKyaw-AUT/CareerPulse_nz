
export interface JobListing {
  title: string;
  source: string;
  url: string;
}

export interface SalaryData {
  level: string;
  min: number;
  max: number;
}

export interface SkillMetric {
  name: string;
  importance: number; // 1-100
  demand: 'Growing' | 'Stable' | 'Declining';
}

export interface InterviewQuestion {
  question: string;
  category: 'Behavioral' | 'Technical' | 'Cultural' | 'Situational';
  rationale: string;
  technique: string; // e.g. "STAR Method", "Technical Logic", "Cultural Alignment"
  exampleAnswer: string;
}

export interface StrategyItem {
  title: string;
  description: string;
  timeline: string;
  level: 'Entry' | 'Junior' | 'Mid-Senior' | 'Senior' | 'General';
}

export interface CareerAnalysis {
  roleName: string;
  locationName: string;
  summary: string;
  nzProTip: string;
  marketStats: {
    demandScore: number; // 1-10
    salaryData: SalaryData[];
    topSkills: SkillMetric[];
    marketOutlook: string;
    cityComparison?: { city: string; value: number }[]; // Optional comparison for national queries
  };
  suggestions: StrategyItem[];
  interviewGuide: InterviewQuestion[];
  groundingLinks: { title: string; url: string }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}