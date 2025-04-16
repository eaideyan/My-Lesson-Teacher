export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, messages = [] } = req.body;
  const systemPrompt = `You are a helpful AI tutor. The student is ${name}, in Grade ${grade}. They want to learn about ${topic} in ${subject}.`;

  try {
    // Build message chain: system prompt + last 3 exchanges
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6) // Keep last 3 pairs (user + assistant)
    ];

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: fullMessages
      })
    });

    const json = await apiRes.json();
    const reply = json.choices?.[0]?.message?.content || "Let's continue our lesson.";
    res.status(200).json({ message: reply });
  } catch (err) {
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
