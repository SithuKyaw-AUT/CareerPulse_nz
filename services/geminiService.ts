
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CareerAnalysis } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export class GeminiService {
  constructor() {}

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 3000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const errorText = error.message || error.toString();
        const isRetryable = errorText.includes('429') || 
                           error.status === 429 || 
                           errorText.includes('RESOURCE_EXHAUSTED');
        
        if (isRetryable && i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          console.warn(`Gemini Quota Hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  async analyzeRole(query: string): Promise<CareerAnalysis> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const isNational = !query.toLowerCase().match(/(auckland|wellington|christchurch|hamilton|tauranga|dunedin|palmerston|nelson|napier|hastings|rotorua|whangarei|new plymouth|invercargill|whanganui|gisborne)/);

    const prompt = `
      Perform a career analysis for: "${query}" in New Zealand.
      ${isNational ? 'Query is broad/national. Compare Demand Score (1-10) for Auckland, Wellington, Christchurch in "cityComparison".' : ''}

      Required JSON block in \`\`\`json tags:
      {
        "roleName": "Role Title",
        "locationName": "Location",
        "summary": "2-sentence pulse",
        "nzProTip": "A short, sharp 10-word tip for NZ job hunters specific to this role",
        "marketStats": {
          "demandScore": 1-10,
          "salaryData": [{"level": "Junior", "min": 60000, "max": 80000}, ...],
          "topSkills": [{"name": "Skill", "importance": 85, "demand": "Growing/Stable/Declining"}],
          "marketOutlook": "Outlook text",
          "cityComparison": [{"city": "City", "value": 8}]
        },
        "suggestions": [{"title": "Step", "description": "Action", "timeline": "When", "level": "Entry/Junior/Mid-Senior/Senior"}],
        "interviewGuide": [{"question": "Q", "category": "Behavioral/Technical/Cultural", "rationale": "Why NZ", "technique": "How to answer", "exampleAnswer": "Answer"}]
      }

      Context: NZD currency, NZ English, 15 interview questions total.
      Tool: Find 5-8 live job listings on Seek.co.nz or TradeMe for this role via Google Search.
    `;

    try {
      const response: GenerateContentResponse = await this.withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 24576 },
          tools: [{ googleSearch: {} }],
        },
      }));

      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingLinks = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web?.title || 'Job Listing',
          url: chunk.web?.uri || '#'
        }));

      return this.parseResponse(text, groundingLinks);
    } catch (error: any) {
      throw error;
    }
  }

  private parseResponse(text: string, links: {title: string, url: string}[]): CareerAnalysis {
    let jsonData: any = {};
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```json([\s\S]*?)```/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1]);
      } else {
        const cleaned = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
        jsonData = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error("JSON Parse Error", e);
    }

    return {
      roleName: jsonData.roleName || "The Role",
      locationName: jsonData.locationName || "New Zealand",
      summary: jsonData.summary || "Active market detected.",
      nzProTip: jsonData.nzProTip || "Highlight local soft skills and cultural fit for Kiwi employers.",
      marketStats: jsonData.marketStats || { demandScore: 7, salaryData: [], topSkills: [], marketOutlook: "" },
      suggestions: jsonData.suggestions || [],
      interviewGuide: jsonData.interviewGuide || [],
      groundingLinks: links
    };
  }
}
