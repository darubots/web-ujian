import { GoogleGenAI, Type } from '@google/genai';
import { getSettings } from './storageService.js';

/**
 * Grade exam answers (both essay and multiple choice)
 */
export const gradeAnswer = async (questions, studentAnswers) => {
    // Get Gemini API key from settings
    let apiKey = process.env.GEMINI_API_KEY;

    try {
        const settings = await getSettings();
        if (settings.geminiApiKey) {
            apiKey = settings.geminiApiKey;
        }
    } catch (error) {
        console.warn('Could not get settings, using env API key');
    }

    const gradedAnswers = [];

    for (let i = 0; i < studentAnswers.length; i++) {
        const studentAnswer = studentAnswers[i];
        const question = questions[studentAnswer.questionIndex];

        if (!question) continue;

        const gradedAnswer = {
            questionIndex: studentAnswer.questionIndex,
            questionType: question.type,
            answer: studentAnswer.answer,
            score: 0,
            isCorrect: false,
            aiFeedback: ''
        };

        if (question.type === 'multiple_choice') {
            // Auto-grade multiple choice
            const isCorrect = studentAnswer.answer === question.correctAnswer;
            gradedAnswer.isCorrect = isCorrect;
            gradedAnswer.score = isCorrect ? (question.points || 10) : 0;
            gradedAnswer.aiFeedback = isCorrect ? 'Correct!' : 'Incorrect';

        } else if (question.type === 'essay') {
            // Use AI to grade essay
            if (apiKey) {
                try {
                    const result = await gradeEssayWithAI(
                        question.question,
                        question.keyAnswer || '',
                        studentAnswer.answer,
                        question.points || 10,
                        apiKey
                    );

                    gradedAnswer.score = result.score;
                    gradedAnswer.aiFeedback = result.feedback;
                    gradedAnswer.isCorrect = result.score >= (question.points || 10) * 0.6; // 60% threshold

                } catch (error) {
                    console.error('AI grading error:', error);
                    // Fallback: give partial score
                    gradedAnswer.score = (question.points || 10) * 0.5;
                    gradedAnswer.aiFeedback = 'Auto-grading unavailable. Manual review needed.';
                }
            } else {
                // No AI key: give partial score
                gradedAnswer.score = (question.points || 10) * 0.5;
                gradedAnswer.aiFeedback = 'AI grading not configured. Manual review needed.';
            }
        }

        gradedAnswers.push(gradedAnswer);
    }

    return gradedAnswers;
};

/**
 * Grade essay answer using Gemini AI
 */
const gradeEssayWithAI = async (question, keyAnswer, studentAnswer, maxPoints, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const gradingSchema = {
        type: Type.OBJECT,
        properties: {
            score: {
                type: Type.NUMBER,
                description: `Score from 0 to ${maxPoints} for the student's answer`
            },
            feedback: {
                type: Type.STRING,
                description: 'Brief feedback explaining the score'
            }
        }
    };

    const prompt = `You are an AI grading assistant.

TASK: Grade the following essay answer.

Question: "${question}"
${keyAnswer ? `Reference Answer: "${keyAnswer}"` : 'No reference answer provided. Grade based on correctness and completeness.'}

Student's Answer: "${studentAnswer}"

Provide a score from 0 to ${maxPoints} and brief feedback.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: gradingSchema,
            temperature: 0.2
        }
    });

    const jsonString = (response.text || '').trim();
    if (!jsonString) {
        throw new Error('Empty response from AI');
    }

    const result = JSON.parse(jsonString);
    return {
        score: Math.min(result.score || 0, maxPoints),
        feedback: result.feedback || 'No feedback available.'
    };
};

export default { gradeAnswer };
