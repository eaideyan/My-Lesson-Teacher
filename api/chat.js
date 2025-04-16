export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing Gemini API key in environment variables.");
    return res.status(500).json({ message: "Server misconfiguration. Please try again later." });
  }

  try {
    const { name, subject, grade, topic, message, history = [] } = req.body;

    if (!subject || !grade || (!topic && !message)) {
      return res.status(400).json({ message: "Missing required information to start the lesson." });
    }

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

    const conversationHistory = [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + (message || `Start ${topic} in ${subject}`) }]
      }
    ];

    // Add limited message history if available (optional)
    history.slice(-4).forEach(msg => {
      conversationHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: conversationHistory })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return res.status(500).json({ message: "Gemini API failed. Check your key or quota." });
    }

    const data = await response.json();
    const assistantReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm ready when you are!";

    return res.status(200).json({
      reply: assistantReply,
      newHistory: [
        ...history,
        { role: 'user', content: message || `Start ${topic} in ${subject}` },
        { role: 'assistant', content: assistantReply }
      ]
    });

  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({
      message: "Our classroom is busy. Please try again in 30 seconds! ⏳"
    });
  }
}
