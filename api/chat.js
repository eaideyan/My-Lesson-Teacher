export default async function handler(req, res) {
  // 1. Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 2. Check for missing Claude API key (during development or misconfig)
  if (!process.env.CLAUDE_KEY) {
    console.error("Missing Claude API key in environment variables.");
    return res.status(500).json({ message: "Server misconfiguration. Please try again later." });
  }

  try {
    // 3. Extract and validate input
    const { name, subject, grade, topic, message, history = [] } = req.body;

    if (!subject || !grade || (!topic && !message)) {
      return res.status(400).json({ message: "Missing required information to start the lesson." });
    }

    // 4. Construct system prompt
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

    // 5. Prepare messages for Claude
    const messages = [
      ...history.slice(-4), // Only last 4 messages
      {
        role: 'user',
        content: message || `Start ${topic} in ${subject}`
      }
    ];

    // 6. Content moderation (optional - disable if not using real API key)
    try {
      const moderationRes = await fetch('https://api.moderatecontent.com/text/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messages.map(m => m.content).join('\n') })
      });

      const moderationData = await moderationRes.json();
      if (moderationData.rating > 1) {
        return res.status(400).json({ message: "Let's focus on our lesson! 📚" });
      }
    } catch (modErr) {
      console.warn('Moderation check failed. Continuing anyway...', modErr);
      // Proceed even if moderation fails
    }

    // 7. Call Claude API
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

    // 8. Check Claude response
    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return res.status(500).json({ message: "Claude API failed. Please check your API key or request." });
    }

    const data = await response.json();

    // 9. Send success response
    const assistantReply = data.content?.[0]?.text || "I'm ready when you are!";
    return res.status(200).json({
      reply: assistantReply,
      newHistory: [...messages, { role: 'assistant', content: assistantReply }]
    });

  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({
      message: "Our classroom is busy. Please try again in 30 seconds! ⏳"
    });
  }
}
