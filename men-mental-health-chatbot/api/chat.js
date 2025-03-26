// api/chat.js – Vercel serverless function to proxy requests to Google Gemini API

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed, use POST.' });
      return;
    }
  
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server configuration error: API key missing.' });
      return;
    }
  
    const { message, persona } = req.body || {};
    if (!message) {
      res.status(400).json({ error: 'No message provided.' });
      return;
    }
  
    // Define persona tone instruction based on selected persona
    let personaInstruction;
    switch (persona) {
      case 'therapist':
        personaInstruction = "Respond in a calm, empathetic, and professional tone as if you are a licensed counselor.";
        break;
      case 'coach':
        personaInstruction = "Respond in an upbeat, motivational tone as if you are a life coach encouraging the user.";
        break;
      case 'buddy':
      default:
        personaInstruction = "Respond in a friendly, informal tone, like a close friend chatting with the user.";
        break;
    }
  
    // Construct the prompt for the AI model
    const userQuery = message.trim();
    const promptText = `${personaInstruction}\nUser: "${userQuery}"\nAssistant:`;
    const requestBody = {
      contents: [
        { parts: [{ text: promptText }] }
      ]
    };
  
    try {
      // Call Google Gemini API for text generation
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!apiResponse.ok) {
        console.error("Gemini API error:", await apiResponse.text());
        return res.status(500).json({ error: 'Chat API call failed.' });
      }
      const result = await apiResponse.json();
      // Extract the AI-generated text from the response
      let replyText = "";
      if (result.candidates && result.candidates.length > 0) {
        const firstCandidate = result.candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
          replyText = firstCandidate.content.parts.map(p => p.text).join("");
        }
      }
      replyText = replyText || "[Sorry, I couldn't generate a response]";
  
      // Send the reply back to the client
      res.status(200).json({ reply: replyText });
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      res.status(500).json({ error: 'Server error processing the request.' });
    }
  }
  