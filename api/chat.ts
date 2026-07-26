import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Add CORS headers just in case
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing' });
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    // Parse body if it's a string (sometimes needed in serverless environments)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { history = [], message, mode } = body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let systemInstruction = "";
    if (mode === "echo") {
      systemInstruction = `You are an expert cardiology and echocardiography tutor for medical students at the KMU Institute of Health Sciences Swabi. 
      Focus strictly on echocardiography interpretation, standard views (PLAX, PSAX, Apical 4-Chamber, Apical 2-Chamber, Subcostal, Suprasternal Notch), cardiovascular clinical case studies, and related hemodynamics. 
      Provide pedagogical, structured, and clinically accurate guidance. Use professional medical terminology but ensure it's accessible to medical students.`;
    } else {
      systemInstruction = `You are an expert clinical and medical education tutor for medical students at the KMU Institute of Health Sciences Swabi. 
      Provide accurate, broad clinical, physiological, anatomical, and pharmacological medical education guidance. Be pedagogical, explaining concepts clearly and helping students develop strong clinical reasoning skills.`;
    }

    const formattedContents = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    return res.status(200).json({
      text: response.text,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during chat' });
  }
}
