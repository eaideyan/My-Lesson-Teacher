export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, userMessage } = req.body;

  // Initialize the conversation with the system message (full prompt)
  const systemPrompt = `You are a helpful AI teacher. The student is ${name}, in Grade ${grade}. They want to learn about ${topic} in ${subject}. Start by introducing the topic gently and ask a simple question to begin the learning process.`;

  // If there is a message from the user, continue the conversation
  const userPrompt = userMessage ? userMessage : "Please introduce the topic.";

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Switch to GPT-4
        messages: messages
      })
    });

    const json = await apiRes.json();
    const reply = json.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    res.status(200).json({ message: reply });

  } catch (err) {
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
