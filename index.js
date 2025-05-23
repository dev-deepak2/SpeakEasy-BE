import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as geminiServices from './geminiServices.js';
import  * as geminiServices2 from './geminiServices2.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Route: Start conversation
app.post('/api/start', async (req, res) => {
  try {
    const question = await geminiServices.generateQuestion();
    res.json({ question });
  } catch (error) {
    console.error('Cant think on anything!:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Route for character conversation====================

app.post('/api/character-start', async (req, res) => {
  try {
    console.log("character-start req.body:", req.body); // <--- Add this
    const {name} = req.body;
     if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    const question = await geminiServices2.generateQuestion(name);
    res.json({ question });
  } catch (error) {
    console.error('Error forwarding request to AI:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});


// Route: Text to speech
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    console.log("Voice ID received:", voiceId);

    if (!text) return res.status(400).json({ error: 'Text is required' });
    if (!voiceId) return res.status(400).json({ error: 'Voice ID is required' });

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
         model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 1.0,
          similarity_boost: 0.0
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
  const message = error.response?.data?.toString?.() || error.message;
  console.error('Error from ElevenLabs:', message);
  res.status(500).json({ error: 'Internal Server Error', details: message });
}
});

// Route: Follow-up questions
app.post('/api/followup', async (req, res) => {
  const { userInput } = req.body;
  if (!userInput) return res.status(400).json({ error: 'User input is required' });

  try {
    const followupPrompt = `The user said: "${userInput}". 
    Now ask a casual, natural follow-up question to keep the conversation going in English. Keep it short and friendly.`;

    const followupQuestion = await geminiServices.sendPrompt(followupPrompt);
    res.json({ followupQuestion });
  } catch (error) {
    console.error('Error generating follow-up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ NEW Route: Analyze conversation

app.post('/api/analyze', async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: "Invalid or empty conversation data." });
    }

    const analysis = await geminiServices.analyzeConversation(conversation);
    res.json({ analysis });
  } catch (error) {
    console.error("Error in /api/analyze:", error.message);
    res.status(500).json({ error: "Internal server error while analyzing conversation." });
  }
});

/**Speecch to text assembly Ai************************************************/



// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
