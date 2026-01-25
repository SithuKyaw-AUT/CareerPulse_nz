
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CareerAnalysis } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export class GeminiService {
  constructor() {}

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 4, baseDelay = 3000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const errorText = error.message || error.toString();
        const isRateLimit = errorText.includes('429') || error.status === 429 || errorText.includes('RESOURCE_EXHAUSTED');
        
        if (isRateLimit && i < maxRetries - 1) {
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

  async analyzeRole(rawNotes: string): Promise<CareerAnalysis> {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      throw new Error("API_KEY_MISSING: Environment variable API_KEY is not defined in the build process.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert New Zealand Career Strategist.
      
      USER NOTES:
      "${rawNotes}"

      TASK:
      1. Extract the primary intended ROLE and the target LOCATION in NZ (Default to "New Zealand" if unspecified).
      2. Perform a deep career analysis for this target role in the NZ market.
      3. Use Google Search to find current (real-time) live job listings on Seek.co.nz or TradeMe for this role.

      MANDATORY JSON FORMAT (Response MUST be only valid JSON in a block):
      \`\`\`json
      {
        "roleName": "Extracted Target Job Title",
        "locationName": "Extracted Location",
        "summary": "2-sentence market pulse.",
        "marketStats": {
          "demandScore": 1-10,
          "salaryData": [{"level": "Junior", "min": 60000, "max": 80000}, {"level": "Mid", "min": 90000, "max": 120000}, {"level": "Senior", "min": 130000, "max": 160000}],
          "topSkills": [{"name": "Skill Name", "importance": 85, "demand": "Growing"}],
          "marketOutlook": "Detailed paragraph about trends in NZ for this role.",
          "cityComparison": [{"city": "Auckland", "value": 9}, {"city": "Wellington", "value": 7}, {"city": "Christchurch", "value": 6}]
        },
        "suggestions": [{"title": "Step Name", "description": "Actionable advice", "timeline": "Next 30 days", "level": "Junior"}],
        "interviewGuide": [{"question": "The actual question", "category": "Behavioral", "rationale": "Why NZ employers ask this", "technique": "STAR focus", "exampleAnswer": "Sample response"}]
      }
      \`\`\`

      Context: New Zealand market exclusively. Prices in NZD. Tone: Professional, direct, and helpful.
    `;

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
  }

  private parseResponse(text: string, links: {title: string, url: string}[]): CareerAnalysis {
    let jsonData: any = {};
    try {
      // Robust JSON extraction
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```json([\s\S]*?)```/) || [null, text];
      const jsonStr = jsonMatch[1] || text;
      
      // Clean up string in case there is trailing markdown
      const cleanedJson = jsonStr.substring(jsonStr.indexOf('{'), jsonStr.lastIndexOf('}') + 1);
      jsonData = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Critical JSON Parsing Error. Response was:", text);
      throw new Error("DATA_PARSE_ERROR: The AI response was not in a valid format. Please try again.");
    }

    return {
      roleName: jsonData.roleName || "Career Discovery",
      locationName: jsonData.locationName || "New Zealand",
      summary: jsonData.summary || "Scanning the NZ horizons.",
      marketStats: jsonData.marketStats || { demandScore: 5, salaryData: [], topSkills: [], marketOutlook: "" },
      suggestions: jsonData.suggestions || [],
      interviewGuide: jsonData.interviewGuide || [],
      groundingLinks: links
    };
  }
}
