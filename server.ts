import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware to parse incoming POST bodies
  app.use(express.json());

  let aiClient: GoogleGenAI | null = null;

  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
  }

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const ai = getAiClient();
      const { history, message, mode } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Define system instructions based on the mode
      let systemInstruction = "";
      if (mode === "echo") {
        systemInstruction = `You are an expert cardiology and echocardiography tutor for medical students at the KMU Institute of Health Sciences Swabi. 
        Focus strictly on echocardiography interpretation, standard views (PLAX, PSAX, Apical 4-Chamber, Apical 2-Chamber, Subcostal, Suprasternal Notch), cardiovascular clinical case studies, and related hemodynamics. 
        Provide pedagogical, structured, and clinically accurate guidance. Use professional medical terminology but ensure it's accessible to medical students.`;
      } else {
        systemInstruction = `You are an expert clinical and medical education tutor for medical students at the KMU Institute of Health Sciences Swabi. 
        Provide accurate, broad clinical, physiological, anatomical, and pharmacological medical education guidance. Be pedagogical, explaining concepts clearly and helping students develop strong clinical reasoning skills.`;
      }

      // Format the history for the SDK
      // Using generateContent instead of chats to easily pass full history + system instructions per request
      const formattedContents = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Append the new message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.5,
        }
      });

      res.json({
        text: response.text,
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during chat' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
