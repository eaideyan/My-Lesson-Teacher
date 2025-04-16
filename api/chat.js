let conversationHistory = [];  // Array to store conversation history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // If this is the first request, we'll initialize the conversation with a prompt
  if (conversationHistory.length === 0) {
    const prompt = `You are a helpful AI tutor. The student is ${name}, in Grade ${grade}. They want to learn about ${topic} in ${subject}. Introduce the topic gently and ask them a simple question to start.`;
    conversationHistory.push({ role: 'user', content: prompt });
  }

  // Add the user's message to the conversation history
  conversationHistory.push({ role: 'user', content: message });

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Use GPT-4 for the conversation
        messages: conversationHistory,  // Send the full conversation history
      }),
    });

    const json = await apiRes.json();
    const reply = json.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: 'assistant', content: reply });

    res.status(200).json({ message: reply });  // Send the response back to the front-end
  } catch (err) {
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
