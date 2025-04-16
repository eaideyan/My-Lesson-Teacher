export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic } = req.body;
  const prompt = `You are a helpful AI tutor. The student is ${name}, in Grade ${grade}. They want to learn about ${topic} in ${subject}. Introduce the topic gently and ask them a simple question to start.`;

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // Ensure API key is set in your environment variables
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Ensure GPT-4 is correctly specified
        messages: [{ role: 'user', content: prompt }]  // The user's message is being sent here
      })
    });

    const json = await apiRes.json();
    const reply = json.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    res.status(200).json({ message: reply });  // Send the response back to the front-end
  } catch (err) {
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
