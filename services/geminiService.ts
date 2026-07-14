import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    return null;
  }
  try {
    if (!ai) {
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  }
};

interface AISEOSuggestion {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  twitterDescription: string;
  analysis: string;
  worthScore: number;
  regionalHubTags: string[];
}

export const generateProductSEO = async (product: { title: string; vendor: string; description: string; category: string }): Promise<AISEOSuggestion | null> => {
  try {
    const aiClient = getAIClient();
    if (!aiClient) {
      console.warn("VITE_GEMINI_API_KEY is not defined in the environment. AI features will be disabled.");
      return null;
    }

    const prompt = `
      You are a World-Class SEO Architect specializing in E-commerce and Medical Technology. 
      Your goal is to dominate Search Engine Results Pages (SERPs) for "Mohsin Surgicals" across Pan-India, with a strategic focus on major medical hubs.
      
      IMPORTANT: While we are based in Hyderabad, we offer FAST PAN-INDIA DELIVERY to all states and tier-1/tier-2 cities.
      
      Analyze the "Worth" and "Relevance" of metadata based on current Google Trends for medical equipment in 2024-2026.
      
      Product Data:
      - Title: ${product.title}
      - Brand: ${product.vendor}
      - Category: ${product.category}
      - Context: ${product.description.substring(0, 800)}
      
      Analyze and generate:
      1. Aggressive SEO Title: Force-weighted with high-traffic keywords (Price, Pan-India Delivery, Brand, Trust).
      2. Meta Description: Ultra-compelling with trust signals (Certified, 24/7 Support, National Shipping).
      3. Dominance Keywords: Keywords that specifically target the "Urgent Medical Need" segment across India.
      4. Regional Hub Tags: Major cities/regions where this product is in high demand (e.g., Delhi, Mumbai, Bangalore, Chennai, Kolkata, and strategic local hubs).
      5. Worth Analysis: Why this will beat competitors on Google SERP nationally.
      6. Worth Score: 1-100 based on national search competitiveness.
      
      Output in strict JSON format.
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keywords: { type: Type.STRING },
            ogTitle: { type: Type.STRING },
            twitterDescription: { type: Type.STRING },
            analysis: { type: Type.STRING },
            worthScore: { type: Type.NUMBER },
            regionalHubTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "keywords", "ogTitle", "twitterDescription", "analysis", "worthScore", "regionalHubTags"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text from AI");
    }

    const result = JSON.parse(response.text);
    return result as AISEOSuggestion;
  } catch (error) {
    console.error("AI SEO Generation failed:", error);
    return null;
  }
};
