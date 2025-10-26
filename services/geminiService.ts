
import { GoogleGenAI, Type } from "@google/genai";
import type { TestResult } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const defineSchema = () => {
  return {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The main title of the test, e.g., "SYNTAX TEST".' },
      timeAllotted: { type: Type.STRING, description: 'The time allotted for the test, e.g., "60 minutes".' },
      questions: {
        type: Type.ARRAY,
        description: "An array of all questions found in the test.",
        items: {
          type: Type.OBJECT,
          properties: {
            questionNumber: { type: Type.INTEGER, description: 'The number of the question, e.g., 1, 2, 3.' },
            english: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING, description: 'The instruction or prompt for the question in English.' },
                content: { type: Type.STRING, description: 'The specific content of the question, like the sentence to be analyzed.' },
              },
            },
            vietnamese: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING, description: 'A precise Vietnamese translation of the question prompt.' },
                content: { type: Type.STRING, description: 'A precise Vietnamese translation of the question content.' },
              },
            },
            solution: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING, description: 'A detailed, step-by-step solution and explanation for the question in English. Use newlines for formatting.' },
                vietnamese: { type: Type.STRING, description: 'A precise Vietnamese translation of the solution. Use newlines for formatting.' },
              },
            },
          },
        },
      },
    },
  };
};

export const processTestImages = async (images: File[]): Promise<TestResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  const prompt = `You are an expert in English syntax and a helpful teaching assistant. Your task is to analyze the provided images of an English syntax test, extract the questions, translate them to Vietnamese, and provide detailed solutions for each.

Follow these instructions carefully:
1.  Accurately extract all questions, including their numbers and any associated text or sentences.
2.  For each question, provide a precise Vietnamese translation.
3.  For each question, write a clear, step-by-step solution. Explain the grammatical rules and concepts involved. Use markdown for formatting if needed.
4.  Translate the solution into Vietnamese.
5.  Format the entire output as a single JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting (like \`\`\`json) outside of the JSON object itself. Ensure all text, especially content with multiple lines or special characters, is correctly escaped within the JSON strings.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            { text: prompt },
            ...imageParts
        ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: defineSchema(),
    },
  });

  try {
    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);
    return parsedResult as TestResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("The API returned an invalid format. Please try again.");
  }
};
