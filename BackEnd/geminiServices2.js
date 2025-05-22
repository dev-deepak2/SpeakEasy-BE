import axios from 'axios';
import  dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';


/**
 * Generates a short casual conversation question.
 * @returns {Promise<string>} Generated question text.
 */
export const generateQuestion = async (name) => {
    const prompt = `Your name is ${name}. Introduce yourself in 2-3 casual, friendly English sentences as if you're starting a conversation. Use simple, natural language.`;
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