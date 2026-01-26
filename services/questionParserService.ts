
import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

declare const mammoth: any;

// Initializing the GenAI client exactly as per the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionListSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            mata_pelajaran: { type: Type.STRING, description: "The subject of the exam" },
            soal: { type: Type.STRING, description: "The essay question text" },
            kunci_jawaban: { type: Type.STRING, description: "Reference answer or keywords (optional)" }
        },
        required: ["mata_pelajaran", "soal"]
    }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const parseQuestionsFromFile = async (file: File): Promise<Question[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) return data;
        throw new Error("Format JSON tidak valid.");
    }

    if (!process.env.API_KEY) {
        throw new Error("Kunci API Gemini diperlukan untuk memproses file non-JSON.");
    }

    let prompt = `Extract all essay questions from the provided document. 
    Return them as a JSON array of objects. 
    Each object must have 'mata_pelajaran' (get from header if available, otherwise use a generic subject name), 'soal' (the question text), and 'kunci_jawaban' (if any model answer or scoring criteria is present).`;

    if (extension === 'pdf') {
        const base64 = await fileToBase64(file);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { inlineData: { data: base64, mimeType: "application/pdf" } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: questionListSchema,
                temperature: 0.1,
            },
        });
        return JSON.parse(response.text || "[]");
    }

    if (extension === 'docx' || extension === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = result.value;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `The following is text extracted from a Word document:\n\n${extractedText}\n\n${prompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionListSchema,
                temperature: 0.1,
            },
        });
        return JSON.parse(response.text || "[]");
    }

    throw new Error("Format file tidak didukung. Gunakan .json, .pdf, atau .docx");
};
