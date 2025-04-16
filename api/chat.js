// chat.js

let conversationHistory = [];  // Store conversation history
const MAX_HISTORY_LENGTH = 5;  // Max number of messages to retain in the history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // If this is the first request, initialize conversation history with an introductory message
  if (conversationHistory.length === 0) {
    const introMessage = `You are a helpful AI tutor. The student is ${name}, in Grade ${grade}. They want to learn about ${topic} in ${subject}. Introduce the topic gently and ask them a simple question to start.`;
    conversationHistory.push({ role: 'user', content: introMessage });
  }

  // Add the user's current message to the conversation history
  conversationHistory.push({ role: 'user', content: message });

  // Truncate the conversation history to keep the most recent messages (MAX_HISTORY_LENGTH)
  if (conversationHistory.length > MAX_HISTORY_LENGTH) {
    // Optionally, you can summarize older messages here if needed
    conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
  }

  try {
    // Send the entire conversation history to GPT-4
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // Ensure API key is set in your environment variables
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Ensure GPT-4 is correctly specified
        messages: conversationHistory,  // Send the truncated conversation history
      })
    });

    const json = await apiRes.json();
    console.log("API Response:", json);  // Log the response for debugging

    // Check if the API response contains the necessary data
    if (!json || !json.choices || !json.choices[0] || !json.choices[0].message) {
      return res.status(500).json({ message: 'Error: No valid response from GPT-4' });
    }

    const reply = json.choices[0].message.content || "Sorry, I couldn't generate a reply.";

    // Add the assistant's reply to the conversation history
    conversationHistory.push({ role: 'assistant', content: reply });

    // Return the assistant's reply
    res.status(200).json({ message: reply });
  } catch (err) {
    console.error(err);  // Log any errors
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
