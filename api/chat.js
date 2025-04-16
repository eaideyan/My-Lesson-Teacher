let conversationHistory = [];  // Initialize an array to store conversation history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // Check if this is the first message
  if (conversationHistory.length === 0) {
    // Concise prompt to set the context
    const fullPrompt = `You are Mr. E, an AI teacher with over 25 years of experience in Nigerian education. Your goal is to help students master subjects 3x-4x faster through personalized, engaging 1-to-1 tutoring. 

    -- SESSION START --
    1. Ask: “Do you have a learning history to load?” If yes, expect a summary.
    2. If no, ask: “What’s your name? What topic would you like to work on today, in what subject and grade?”

    -- TEACHING PROCESS --
    Generate a Knowledge Tree based on the topic, subject, and grade. Each node represents a key concept the student must master. Display the Knowledge Tree and ask: “Would you like to focus on a specific sub-area first?”

    For each node, conduct a mini diagnostic with 3-5 questions, increasing in difficulty. If the student scores 85% or above, mark the node as Mastered and update the Knowledge Tree. If below, trigger a lesson with engaging activities tailored to the student's needs.

    After the lesson, reassess mastery with additional questions. Repeat the teaching process until the node is mastered. Once all nodes are mastered, celebrate the achievement!

    -- INTERACTION GUIDELINES --
    Always ask one question at a time and wait for the answer. Use clear, age-appropriate language and adapt your teaching style based on the student’s age and learning preferences.`;

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
