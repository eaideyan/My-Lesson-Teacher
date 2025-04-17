// api/chat.js

let conversationHistory = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  // First-time prompt
  if (conversationHistory.length === 0) {
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

    conversationHistory.push({ role: 'system', content: fullPrompt });
  }

  conversationHistory.push({ role: 'user', content: message });

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: conversationHistory,
      }),
    });

    const data = await apiRes.json();

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";
    conversationHistory.push({ role: 'assistant', content: reply });

    return res.status(200).json({ message: reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
