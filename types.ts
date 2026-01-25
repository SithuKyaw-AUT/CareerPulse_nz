export interface CareerAnalysis {
  roleName: string;
  locationName: string;
  summary: string;
  nzProTip: string;
  
  // New: Data quality indicators
  dataQuality?: {
    isGrounded: boolean;
    confidence: 'high' | 'medium' | 'low';
    sourceCount?: number;
    groundingQuality?: string;
    sources?: string;
    lastUpdated?: string;
  };
  
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
  
  // New: Search entry point for additional context
  searchEntryPoint?: string | null;
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