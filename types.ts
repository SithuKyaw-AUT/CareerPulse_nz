export interface CareerAnalysis {
  roleName: string;
  locationName: string;
  summary: string;
  nzProTip: string;
  
  marketStats: {
    demandScore: number;
    salaryData: SalaryRange[];
    topSkills: Skill[];
    marketOutlook: string;
    cityComparison?: CityComparison[];
  };
  
  suggestions: CareerSuggestion[];
  interviewGuide: InterviewQuestion[];
  groundingLinks: GroundingLink[];
}

export interface SalaryRange {
  level: string;
  min: number;
  max: number;
}

export interface Skill {
  name: string;
  importance: number;
  demand: 'Growing' | 'Stable' | 'Declining';
}

export interface CityComparison {
  city: string;
  value: number;
}

export interface CareerSuggestion {
  title: string;
  description: string;
  timeline: string;
  level: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'Behavioral' | 'Technical' | 'Cultural';
  rationale: string;
  technique: string;
  exampleAnswer: string;
}

export interface GroundingLink {
  title: string;
  url: string;
}

export interface StrategyItem {
  title: string;
  description: string;
  timeline: string;
  level: 'Entry' | 'Junior' | 'Mid-Senior' | 'Senior' | 'General';
}