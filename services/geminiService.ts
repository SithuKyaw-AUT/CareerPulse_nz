import { GoogleGenAI } from "@google/genai";
import { CareerAnalysis } from "../types";

const MODEL_NAME = 'gemini-2.0-flash-exp';

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
          console.warn(`⏳ Gemini Quota Hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  async analyzeRole(query: string): Promise<CareerAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    const ai = new GoogleGenAI({ apiKey });

    const isNational = !query.toLowerCase().match(/(auckland|wellington|christchurch|hamilton|tauranga|dunedin|palmerston|nelson|napier|hastings|rotorua|whangarei|new plymouth|invercargill|whanganui|gisborne)/);

    const prompt = `
      You are a New Zealand career analysis expert. Perform a comprehensive career analysis for: "${query}" in New Zealand.
      
      CRITICAL: You MUST use Google Search to find REAL, CURRENT job market data from:
      - Seek.co.nz (New Zealand's largest job site)
      - TradeMe Jobs
      - LinkedIn Jobs NZ
      - Company career pages
      
      Search for:
      1. Current job listings for this role in NZ
      2. Actual salary ranges advertised
      3. Required skills from real job descriptions
      4. Market demand indicators
      
      ${isNational ? 'Query is broad/national. Compare Demand Score (1-10) for Auckland, Wellington, Christchurch in "cityComparison" based on actual job listing volumes.' : ''}

      Provide your analysis in the following JSON format within \`\`\`json tags:
      {
        "roleName": "Specific Role Title",
        "locationName": "Location (Auckland, Wellington, etc. or 'New Zealand' if national)",
        "summary": "2-sentence market pulse based on REAL job listing data",
        "nzProTip": "A sharp, practical 10-word tip specific to NZ job market for this role",
        "dataQuality": {
          "isGrounded": true/false,
          "confidence": "high/medium/low",
          "sources": "Brief description of sources used",
          "lastUpdated": "Current date or 'Real-time'"
        },
        "marketStats": {
          "demandScore": 1-10 (based on actual job listing volume),
          "salaryData": [
            {"level": "Entry/Junior", "min": 50000, "max": 70000},
            {"level": "Mid-Level", "min": 70000, "max": 95000},
            {"level": "Senior", "min": 95000, "max": 130000}
          ],
          "topSkills": [
            {"name": "Skill Name", "importance": 90, "demand": "Growing/Stable/Declining"},
            {"name": "Another Skill", "importance": 85, "demand": "Growing/Stable/Declining"}
          ],
          "marketOutlook": "2-3 sentence outlook based on current trends and job volumes",
          "cityComparison": [
            {"city": "Auckland", "value": 8},
            {"city": "Wellington", "value": 7},
            {"city": "Christchurch", "value": 6}
          ]
        },
        "suggestions": [
          {
            "title": "Action Step Title",
            "description": "Specific, actionable advice for NZ market",
            "timeline": "1-3 months / 3-6 months / 6-12 months",
            "level": "Entry/Junior/Mid-Senior/Senior"
          }
        ],
        "interviewGuide": [
          {
            "question": "Interview question relevant to NZ market",
            "category": "Behavioral/Technical/Cultural",
            "rationale": "Why this question matters in NZ context",
            "technique": "STAR method or specific approach",
            "exampleAnswer": "Sample answer framework"
          }
        ]
      }

      IMPORTANT REQUIREMENTS:
      - All salary data must be in NZD
      - Use NZ English spelling (e.g., "analyse" not "analyze")
      - Provide 12-15 interview questions covering Behavioral, Technical, and Cultural fit
      - Base demand scores on actual job listing volumes if available
      - Include specific NZ workplace culture considerations
      - Reference actual companies hiring if found in search results
    `;

    try {
      console.log('🔍 Starting career analysis with Google Search grounding...');
      
      const response = await this.withRetry(async () => {
        return await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            tools: [{ 
              googleSearch: {
                // More aggressive grounding configuration
                dynamicRetrievalConfig: {
                  mode: 'MODE_DYNAMIC',
                  dynamicThreshold: 0.15  // Lower threshold = more grounding
                }
              }
            }],
          },
        });
      });

      const text = response.text || "";
      
      // Extract grounding metadata
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchEntryPoint = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint;
      
      // Process grounding links
      const groundingLinks = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web?.title || 'Source',
          url: chunk.web?.uri || '#'
        }));

      // Log grounding quality
      const groundingQuality = this.assessGroundingQuality(groundingLinks.length);
      console.log(`📊 Grounding Quality: ${groundingQuality.label}`);
      console.log(`🔗 Sources Used: ${groundingLinks.length}`);
      
      if (groundingLinks.length === 0) {
        console.warn('⚠️ WARNING: No web sources were grounded. Response may be speculative.');
      } else {
        console.log('✅ Response grounded with real web data');
        groundingLinks.forEach((link, idx) => {
          console.log(`  ${idx + 1}. ${link.title}`);
        });
      }

      // Include search entry point if available
      const additionalInfo = {
        searchEntryPoint: searchEntryPoint?.renderedContent || null,
        groundingQuality
      };

      return this.parseResponse(text, groundingLinks, additionalInfo);
      
    } catch (error: any) {
      console.error('❌ Gemini API Error:', {
        message: error.message,
        status: error.status,
        details: error
      });
      throw new Error(`Career analysis failed: ${error.message}`);
    }
  }

  private assessGroundingQuality(sourceCount: number): {
    score: number;
    label: string;
    confidence: string;
  } {
    if (sourceCount >= 5) {
      return { score: sourceCount, label: 'High Quality', confidence: 'high' };
    } else if (sourceCount >= 2) {
      return { score: sourceCount, label: 'Medium Quality', confidence: 'medium' };
    } else if (sourceCount === 1) {
      return { score: sourceCount, label: 'Low Quality', confidence: 'low' };
    } else {
      return { score: 0, label: 'No Grounding', confidence: 'low' };
    }
  }

  private parseResponse(
    text: string, 
    links: {title: string, url: string}[],
    additionalInfo: any
  ): CareerAnalysis {
    let jsonData: any = {};
    
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object directly
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = text.substring(jsonStart, jsonEnd + 1);
          jsonData = JSON.parse(jsonStr);
        }
      }
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
      console.log("Raw response text:", text.substring(0, 500));
    }

    // Enhance data quality information
    const dataQuality = jsonData.dataQuality || {};
    const enhancedDataQuality = {
      ...dataQuality,
      isGrounded: links.length > 0,
      confidence: additionalInfo.groundingQuality.confidence,
      sourceCount: links.length,
      groundingQuality: additionalInfo.groundingQuality.label
    };

    const analysis: CareerAnalysis = {
      roleName: jsonData.roleName || "Career Role",
      locationName: jsonData.locationName || "New Zealand",
      summary: jsonData.summary || "Market analysis generated based on available data.",
      nzProTip: jsonData.nzProTip || "Research NZ workplace culture and highlight soft skills in applications.",
      dataQuality: enhancedDataQuality,
      marketStats: {
        demandScore: jsonData.marketStats?.demandScore || 5,
        salaryData: jsonData.marketStats?.salaryData || [],
        topSkills: jsonData.marketStats?.topSkills || [],
        marketOutlook: jsonData.marketStats?.marketOutlook || "Market data unavailable.",
        cityComparison: jsonData.marketStats?.cityComparison || []
      },
      suggestions: jsonData.suggestions || [],
      interviewGuide: jsonData.interviewGuide || [],
      groundingLinks: links,
      searchEntryPoint: additionalInfo.searchEntryPoint
    };

    return analysis;
  }
}