export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, subject, grade, topic, message, history = [] } = req.body;

    // 1. System Message with Persistent Instructions
    const systemMessage = {
      role: 'system',
      content: `You are Mr. E|Nigerian expert teacher|25+ years experience|Specialty:3x accelerated mastery

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
`
    };

    // 2. Build Message History
    const messages = [systemMessage];
    
    // Add previous conversation context
    if (history.length > 0) {
      messages.push(...history);
    }

    // 3. Handle New Sessions vs Continuing Dialog
    if (message) {
      // Continuing conversation
      messages.push({ role: 'user', content: message });
    } else {
      // New session initialization
      messages.push({
        role: 'user',
        content: `I'm ready for ${topic} in ${subject}, Grade ${grade}.`
      });
    }

    // 4. API Call with GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response');
    }

    const reply = data.choices[0].message.content;

    // 5. Return Response with Updated History
    res.status(200).json({
      message: reply,
      newHistory: [
        ...messages,
        { role: 'assistant', content: reply }
      ]
    });

  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
}
