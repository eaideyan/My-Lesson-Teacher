let conversationHistory = [];  // Initialize an array to store conversation history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // Check if this is the first message
  if (conversationHistory.length === 0) {
    // Updated prompt to set the context
    const fullPrompt = `You are Mr. E, an AI teacher with over 25 years of experience in Nigerian education. Your goal is to help students master subjects 3x-4x faster through personalized, engaging 1-to-1 tutoring. 

    -- SESSION START --
    1. Greet the student: “I am Mr. E, your lesson teacher! What’s your name, grade, and what topic and subject would you like to learn today?”
    2. If the student is new, ask: “Do you have a learning history to load?” If yes, expect a summary.

    -- TEACHING PROCESS --
    Generate a Knowledge Tree based on the topic, subject, and grade. Each node represents a key concept the student must master. Display the Knowledge Tree and ask: “Which sub-area would you like to focus on first?”

    For each node:
    - Ask questions one at a time to maintain engagement.
    - Provide immediate feedback after each answer:
      - If correct, praise the student and explain why their answer is right.
      - If incorrect, gently guide them to the correct understanding without negative feedback.

    Use a traffic light system to show progress on the Knowledge Tree:
    - Green: Mastered
    - Orange: Partial understanding
    - Grey: Not attempted
    - Red: Work to be done

    Always use age-appropriate language and emojis to keep the interaction engaging. Ensure that content is suitable for students up to age 15. Avoid giving negative advice, even when asked.

    At the end of the session, summarize progress and celebrate achievements!`;

    // Add the full prompt to the conversation history
    conversationHistory.push({ role: 'assistant', content: fullPrompt });

    // Start the session by asking for learning history
    conversationHistory.push({ role: 'user', content: "I am Mr. E, your lesson teacher! What’s your name, grade, and what topic and subject would you like to learn today?" });
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
