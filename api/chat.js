// Add this at the TOP of chat.js for proper body parsing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Safely parse request data
    const { messages = [], learningSummary } = req.body;

    // 1. Validate messages format
    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid messages format' });
    }

    // 2. Build System Prompt (PASTE YOUR FULL MR. E PROMPT HERE)
    const systemPrompt = `
    [PASTE YOUR ENTIRE "You are Mr. E..." PROMPT HERE]
    ${learningSummary ? `\n[learning_summary]:\n${learningSummary}` : ''}
    `;

    // 3. Call OpenAI API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.filter(msg => msg.role && msg.content)
        ],
        temperature: 0.3
      })
    });
    
    clearTimeout(timeout);

    // 4. Handle API errors
    if (!apiRes.ok) {
      const errorBody = await apiRes.text();
      throw new Error(`OpenAI API Error: ${apiRes.status} - ${errorBody}`);
    }

    // 5. Extract response
    const json = await apiRes.json();
    const reply = json.choices?.[0]?.message?.content;

    // 6. Extract learning summary
    const newSummary = extractLearningSummary(reply); // Use helper function

    res.status(200).json({ 
      message: reply,
      learningSummary: newSummary || learningSummary // Fallback to previous
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      message: err.message.includes('aborted') 
        ? 'Request timed out' 
        : err.message 
    });
  }
}

// Helper function (keep at bottom)
function extractLearningSummary(text) {
  const summaryRegex = /\[learning_summary\]:\s*([\s\S]+?)\n------------------------------------------/;
  const match = text?.match(summaryRegex);
  return match ? match[1].trim() : null;
}
