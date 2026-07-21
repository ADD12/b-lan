import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, HoneyDoJob } from "../types";

// Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
// Note: process.env.API_KEY is assumed to be configured and valid in the environment.

/**
 * AI Service for B-LAN Community Intelligence
 */

export const getSkillMatches = async (user: UserProfile, jobs: HoneyDoJob[]): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const chatWithGrounding = async (message: string, useMaps: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Map grounding is supported in 2.5 series
  const model = useMaps ? "gemini-2.5-flash" : "gemini-3-flash-preview";
  const tools = useMaps ? [{ googleMaps: {} }, { googleSearch: {} }] : [{ googleSearch: {} }];
  
  const response = await ai.models.generateContent({
    model,
    contents: message,
    config: {
      tools,
      systemInstruction: "You are a helpful B-LAN community assistant. Use grounding to provide accurate real-world information when needed."
    }
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const chatWithGroundingStream = async (message: string, useMaps: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = useMaps ? "gemini-2.5-flash" : "gemini-3-flash-preview";
  const tools = useMaps ? [{ googleMaps: {} }, { googleSearch: {} }] : [{ googleSearch: {} }];
  
  return await ai.models.generateContentStream({
    model,
    contents: message,
    config: {
      tools,
      systemInstruction: "You are a helpful B-LAN community assistant. Use grounding to provide accurate real-world information when needed."
    }
  });
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any
      }
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data.split(',')[1], mimeType } },
        { text: prompt }
      ]
    },
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });
  return response.text;
};

export const analyzeMediaStream = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data.split(',')[1], mimeType } },
        { text: prompt }
      ]
    },
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', startImage?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: startImage ? {
      imageBytes: startImage.split(',')[1],
      mimeType: 'image/png'
    } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
