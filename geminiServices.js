import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Generates a short casual conversation question.
 * @returns {Promise<string>} Generated question text.
 */
export const generateQuestion = async () => {
  const prompt = "Give a short, casual English question like 'How was your day?' or 'What are you doing today?'. Only the question.";
  return await sendPrompt(prompt);
};

/**
 * Sends a prompt to Gemini API and returns the generated text.
 * @param {string} prompt - The prompt to send.
 * @returns {Promise<string>} Generated text from Gemini.
 */
export const sendPrompt = async (prompt) => {
  try {
    const { data } = await axios.post(
      GEMINI_URL,
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't generate content.";
  } catch (error) {
    console.error('Error from Gemini:', error.response?.data || error.message);
    return "Can't think of anything!";
  }
};


/**
 * Analyzes a full conversation between user and AI using Gemini.
 * @param {Array<{question: string, answer: string}>} conversation
 * @returns {Promise<string>} Feedback from Gemini
 */
export const analyzeConversation = async (conversation) => {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    return "No valid conversation to analyze.";
  }

  // Format the Q&A dialogue
  const formattedDialogue = conversation
    .map((entry, i) => `Coach (Q${i + 1}): ${entry.question}\nLearner (A${i + 1}): ${entry.answer}`)
    .join("\n\n");

  // Define a clear prompt for Gemini
  const prompt = `
  You are an expert English language coach. Below is a spoken English conversation between a Coach (Q) and a Learner (A).
  
  For each question-answer pair, provide feedback in the following format only:
  
  1. Question: (original coach question)
  2. Your Answer: (original user response)
  3. Corrected Version: (rewrite the answer with grammar corrections; highlight key corrections)
  4. Or You Can Say: (alternative version using richer vocabulary or more natural phrasing)
  
  Only provide the above four points for each Q&A pair. Keep it clear, direct, and helpful.
  
  Conversation:
${formattedDialogue}
`;

  return await sendPrompt(prompt);
};
