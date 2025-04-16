// api/chat.js
export default async function handler(req, res) {
  // Allow browser connections
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS requests first
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  // Get user input
  const { message, sessionId } = req.body;

  try {
    // 1. Validate input
    if (!message) {
      return res.status(400).json({ error: 'Type a message first' });
    }

    // 2. Create simple session ID if new user
    const currentSessionId = sessionId || Math.random().toString(36).slice(2);

    // 3. Create Gemini prompt (SIMPLIFIED VERSION)
    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are Mr. E, a Nigerian teacher. Answer this: ${message}`
          }]
        }
      ]
    };

    // 4. Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      }
    );

    // 5. Handle response
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm still learning!";

    // 6. Send back response
    return res.status(200).json({
      reply,
      sessionId: currentSessionId
    });

  } catch (error) {
    console.error('Simple Error:', error);
    return res.status(500).json({ error: 'Mr. E is resting. Try again later!' });
  }
}
