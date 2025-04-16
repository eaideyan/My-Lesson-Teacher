export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Get form data
    const { name, subject, grade, topic, message, history = [] } = req.body;

    // 2. Create system instructions
    const systemPrompt = `You are Mr. E|Nigerian expert teacher|25+ years experience|Specialty:3x accelerated mastery

# CORE WORKFLOW
1. INITIAL ASSESSMENT
   - Check for [learning_summary]
   - If new: "Your name?" → "Hi [Name], begin [Topic] in [Subject] (Grade [X])"

2. KNOWLEDGE TREE
   a) Generate 3-5 nodes for [Topic]:
      🌱 Foundation | 🔁 Prerequisite | 🌟 Capstone
   b) Display as visual tree with progress tracking
   c) Offer sub-node focus choice

3. NODE MASTERY FLOW (per node):
   A) Diagnostic (5 Qs):
   1. Recall 2. Concept 3. Application 4. Visual 5. Challenge
   → Immediate feedback + ZPD adjustment
   
   B) Teaching Protocol:
   - 1st fail: Alternate explanation + Nigerian analogy
   - 2nd fail: Scaffolded example
   - 3rd fail: Guided discovery
   
   C) Mastery Check (3 Qs):
   - Application-focused → Growth mindset feedback

4. SESSION RULES
   - Track nodes: ✔️ (≥85%) | 🔁 (<85%)
   - End with [learning_summary]
   - Cultural context: Naira, local examples
   - Age-adjusted tone (emojis K1-K3 → formal SS3)

# CRITICAL BEHAVIORS
⇒ 1 question → 1 answer → feedback cycle
⇒ Never solve directly - Socratic guidance only
⇒ Nigerian curriculum alignment
⇒ Bloom's progression: Remember → Create
`;

    // 3. Prepare messages
    const messages = [
      ...history.slice(-4), // Last 4 messages
      { role: 'user', content: message || `Start ${topic} in ${subject}` }
    ];

    // 4. Content safety check
    const moderationRes = await fetch('https://api.moderatecontent.com/text/', {
      method: 'POST',
      body: JSON.stringify({ text: messages.map(m => m.content).join('\n') })
    });
    if ((await moderationRes.json()).rating > 1) {
      return res.status(400).json({ message: "Let's focus on our lesson! 📚" });
    }

    // 5. Call Claude API
   const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.CLAUDE_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    temperature: 0.3,
    system: systemPrompt,
    messages
  })
});

// 🔒 Check response status BEFORE parsing
if (!response.ok) {
  const errText = await response.text(); // Show what Claude API actually returned
  console.error("Claude API error:", response.status, errText);
  return res.status(500).json({ message: "Claude API failed. Please check your API key or request." });
}

const data = await response.json();

    // 6. Send response
    const data = await response.json();
    res.status(200).json({
      reply: data.content[0].text,
      newHistory: [...messages, { role: 'assistant', content: data.content[0].text }]
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      message: "Our classroom is busy. Please try again in 30 seconds! ⏳"
    });
  }
}
