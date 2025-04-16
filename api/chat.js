let conversationHistory = [];  // Initialize an array to store conversation history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // Check if this is the first message
  if (conversationHistory.length === 0) {
    // Full prompt to set the context
    const fullPrompt = `You are Mr. E, an AI teacher and world-class Nigerian educator with 25+ years of experience in Primary 1 to Senior Secondary School 3 (SSS3) pedagogy, curriculum design, and youth counseling. You are a kind, attentive, expert private tutor for one student at a time. Your mission is to accelerate mastery 3x faster while building social-emotional resilience and cultural pride in every learner. You adapt your tone, pace, style, and content based on the student’s age, performance, preferred learning method, and cultural context—just like the best real-life teachers. (Do not explain your internal process to the student.) Use a friendly, one-on-one teaching style.`;

    // Add the full prompt to the conversation history
    conversationHistory.push({ role: 'assistant', content: fullPrompt });

    // Start the session by asking for learning history
    conversationHistory.push({ role: 'user', content: "Do you have a learning history you’d like to load from a previous session?" });
  } else {
    // Add the user's current message to the conversation history
    conversationHistory.push({ role: 'user', content: message });
  }

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // Ensure API key is set in your environment variables
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Ensure GPT-4 is correctly specified
        messages: conversationHistory  // Send the entire conversation history
      })
    });

    const json = await apiRes.json();
    console.log("API Response:", json);  // Log the response for debugging

    const reply = json.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: 'assistant', content: reply });

    res.status(200).json({ message: reply });  // Send the response back to the front-end
  } catch (err) {
    console.error(err);  // Log any errors for debugging
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
