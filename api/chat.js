let conversationHistory = [];  // Store conversation history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // Initialize the conversation history if this is the first request
  if (conversationHistory.length === 0) {
    const introMessage = `You are a helpful AI tutor. The student is ${name}, in Grade ${grade}. They want to learn about ${topic} in ${subject}. Introduce the topic gently and ask them a simple question to start.`;
    conversationHistory.push({ role: 'user', content: introMessage });
  }

  // Add the user's message to the conversation history
  conversationHistory.push({ role: 'user', content: message });

  try {
    // Send the entire conversation history to the GPT-4 API
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: conversationHistory,  // Send the full conversation history
      }),
    });

    const json = await apiRes.json();

    // Check if the response is valid
    if (!json || !json.choices || !json.choices[0] || !json.choices[0].message) {
      return res.status(500).json({ message: 'Error: No valid response from GPT-4' });
    }

    const reply = json.choices[0].message.content || "Sorry, I couldn't generate a reply.";

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: 'assistant', content: reply });

    // Return the assistant's reply
    res.status(200).json({ message: reply });
  } catch (err) {
    console.error(err); // Log the error for better debugging
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
