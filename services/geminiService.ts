
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CareerAnalysis, InterviewQuestion, StrategyItem } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeRole(query: string): Promise<CareerAnalysis> {
    const isNational = !query.toLowerCase().match(/(auckland|wellington|christchurch|hamilton|tauranga|dunedin|palmerston|nelson|napier|hastings|rotorua|whangarei|new plymouth|invercargill|whanganui|gisborne)/);

    const prompt = `
      Perform an exhaustive career intelligence analysis for: "${query}" in the New Zealand context.

      ${isNational ? 'IMPORTANT: The query is broad or national. You MUST include a "cityComparison" array in "marketStats" comparing the Demand Score (1-10) across Auckland, Wellington, and Christchurch.' : ''}

      You must provide a dual-part response:
      1. A conversational markdown summary of the market.
      2. A strictly formatted JSON block wrapped in \`\`\`json tags containing the structured data below.

      JSON STRUCTURE REQUIRED:
      {
        "roleName": "Specific Role Title",
        "locationName": "City/Region or 'New Zealand'",
        "summary": "Brief 2-sentence market pulse",
        "marketStats": {
          "demandScore": 1-10,
          "salaryData": [{"level": "Junior", "min": 60000, "max": 80000}, ...],
          "topSkills": [{"name": "Skill Name", "importance": 85, "demand": "Growing"}, ...],
          "marketOutlook": "Detailed outlook text",
          "cityComparison": [{"city": "Auckland", "value": 8}, {"city": "Wellington", "value": 7}, {"city": "Christchurch", "value": 6}] (ONLY IF BROAD/NATIONAL QUERY)
        },
        "suggestions": [
          {
            "title": "...", 
            "description": "...", 
            "timeline": "...", 
            "level": "Entry/Junior/Mid-Senior/Senior/General"
          }
        ],
        "interviewGuide": [
          {
            "question": "...", 
            "category": "Behavioral/Technical/Cultural/Situational", 
            "rationale": "Why NZ employers ask this specifically", 
            "technique": "Detailed explanation of the technique to use",
            "exampleAnswer": "..."
          }
        ]
      }

      GUIDELINES FOR STRATEGY:
      - Provide at least 2 specific strategies for EACH level: Entry, Junior, Mid-Senior, Senior.
      - Ensure 'level' strictly matches one of the specified strings.

      GUIDELINES FOR INTERVIEW GUIDE:
      - Provide 15 distinct questions.
      - Mix: 7 Behavioral, 5 Technical, 3 Cultural/Situational.

      Additionally, use the Google Search tool to find 5-8 live job listings on Seek.co.nz, TradeMe Jobs, or LinkedIn NZ for this role and location.

      IMPORTANT: NZ Context, NZD currency, NZ English.
    `;

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Job Listing',
        url: chunk.web?.uri || '#'
      }));

    return this.parseResponse(text, groundingLinks);
  }

  private parseResponse(text: string, links: {title: string, url: string}[]): CareerAnalysis {
    let jsonData: any = {};
    
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```json([\s\S]*?)```/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1]);
      }
    } catch (e) {
      console.error("Failed to parse JSON from response", e);
    }

    const guide: InterviewQuestion[] = (jsonData.interviewGuide || []).map((item: any) => ({
      question: item.question || "Standard Interview Question",
      category: item.category || "Behavioral",
      rationale: item.rationale || "Assessing core competency.",
      technique: item.technique || "Use the STAR method.",
      exampleAnswer: item.exampleAnswer || "Sample answer not provided."
    }));

    const suggestions: StrategyItem[] = (jsonData.suggestions || []).map((item: any) => ({
      title: item.title || "Strategic Step",
      description: item.description || "Actionable detail.",
      timeline: item.timeline || "Immediate",
      level: item.level || "General"
    }));

    return {
      roleName: jsonData.roleName || "The Analyzed Role",
      locationName: jsonData.locationName || "New Zealand",
      summary: jsonData.summary || "Highly active market.",
      marketStats: jsonData.marketStats || {
        demandScore: 7,
        salaryData: [],
        topSkills: [],
        marketOutlook: ""
      },
      suggestions,
      interviewGuide: guide,
      groundingLinks: links
    };
  }
}
