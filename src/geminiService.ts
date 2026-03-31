import { GoogleGenAI, Type } from "@google/genai";
import { Grade, Attendance, AcademicRisk, MentorRecommendation } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function predictAcademicRisk(grades: Grade[], attendance: Attendance[]): Promise<AcademicRisk> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following student data and predict the probability of a grade drop in the next 2-3 weeks.
    Grades: ${JSON.stringify(grades)}
    Attendance: ${JSON.stringify(attendance)}
    
    Consider:
    - Recent grade trends (downward trajectory).
    - Attendance patterns (absences or lateness).
    - Subject difficulty.
    
    Return a JSON object with:
    - probability: number (0-100)
    - reason: string (explanation)
    - subjectsAtRisk: string[] (list of subjects)
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          probability: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          subjectsAtRisk: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["probability", "reason", "subjectsAtRisk"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getMentorRecommendations(grades: Grade[], mode: 'soft' | 'hard'): Promise<MentorRecommendation[]> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Act as a human mentor for a student at Aqbobek Lyceum.
    Mode: ${mode === 'soft' ? 'Motivational (Soft)' : 'Disciplined (Hard)'}
    Student Grades: ${JSON.stringify(grades)}
    
    Identify subjects where the student is struggling or has potential.
    Provide:
    - subject: string
    - topics: string[] (3 specific topics to study)
    - plan: string (mini-plan for the week)
    - motivation: string (a message to the student)
    
    Return an array of JSON objects.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            plan: { type: Type.STRING },
            motivation: { type: Type.STRING }
          },
          required: ["subject", "topics", "plan", "motivation"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function generateNewsSummary(title: string, content: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Summarize the following school news for a "Wall Newspaper" kiosk display.
    The summary should be catchy, brief, and suitable for a large screen.
    Title: ${title}
    Content: ${content}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "";
}

export async function analyzeClassGrades(fileContent: string, className: string, subject: string): Promise<{
  summary: string;
  topPerformers: string[];
  studentsAtRisk: { name: string; reason: string; suggestion: string }[];
  classAverage: number;
  improvementPlan: string;
}> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following class grade data for Class: ${className}, Subject: ${subject}.
    Data Content:
    ${fileContent}
    
    The data might be in CSV, TSV, or plain text format. Extract student names and their grades.
    
    Provide:
    1. A brief summary of the class performance.
    2. Top 3 performers.
    3. List of students at risk (low grades or declining performance) with reasons and specific suggestions for each.
    4. Calculated class average (0-100).
    5. A general improvement plan for the teacher to help the whole class.
    
    Return a JSON object.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          topPerformers: { type: Type.ARRAY, items: { type: Type.STRING } },
          studentsAtRisk: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["name", "reason", "suggestion"]
            } 
          },
          classAverage: { type: Type.NUMBER },
          improvementPlan: { type: Type.STRING }
        },
        required: ["summary", "topPerformers", "studentsAtRisk", "classAverage", "improvementPlan"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
