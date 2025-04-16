export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { messages, learningSummary } = req.body;
  
  // 1. Construct System Prompt with Pedagogical Logic
  const systemPrompt = `
  You are Mr. E, an AI teacher and world-class Nigerian educator with 25+ years experience.
  ${learningSummary ? `[learning_summary]:\n${learningSummary}` : ''}
  
  Follow these strict rules:
  1. Use knowledge tree node system with mastery checks
  2. Maintain conversation history for context
  3. Track mastered nodes in [learning_summary] format
  4. Never explain your internal process
  5. Ask one question at a time
  `;

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages // Maintain full conversation history
        ],
        temperature: 0.3 // For consistent pedagogical approach
      })
    });

    const json = await apiRes.json();
    const reply = json.choices?.[0]?.message?.content;
    
    // 2. Extract New Learning Summary
    const newSummary = extractLearningSummary(reply); 
    
    res.status(200).json({ 
      message: reply,
      learningSummary: newSummary 
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Error processing request' });
  }
}

// Helper function to parse learning summaries
function extractLearningSummary(text) {
  const summaryRegex = /\[learning_summary\]:\s*([\s\S]+?)\n------------------------------------------/;
  const match = text.match(summaryRegex);
  return match ? match[1].trim() : null;
}
