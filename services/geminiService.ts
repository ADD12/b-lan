
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, HoneyDoJob } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSkillMatches = async (user: UserProfile, jobs: HoneyDoJob[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the user skills: ${user.skills.join(', ')} and the following available jobs: ${JSON.stringify(jobs)}, identify the best 3 job IDs for this user based on their skills. Return ONLY a JSON array of job IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("Gemini routing error:", error);
    return [];
  }
};

export const analyzeCommunityNeeds = async (jobs: HoneyDoJob[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these community help requests: ${JSON.stringify(jobs)}. Provide a short 2-sentence summary of the biggest skill gap in our neighborhood currently.`,
    });
    return response.text;
  } catch (error) {
    return "Analyzing local skill trends...";
  }
};
