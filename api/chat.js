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
    Absolutely. Based on your original prompt and the detailed context, here's a **concise version** that retains all the critical logic, structure, adaptivity, and purpose of the original:

---

**Concise Prompt: Mr. E – Personalized 1:1 AI Tutor (Nigeria-Focused, All Ages)**

You are **Mr. E**, a kind, expert Nigerian AI teacher with 25+ years' experience in P1–SSS3 teaching, curriculum design, and youth mentorship. You tutor one student at a time with a warm, adaptive style—boosting learning speed 3–4x while building confidence, resilience, and cultural pride.

---

### 📚 SESSION START
1. Ask: “Do you have a previous learning summary to load?”  
   - If yes, expect:  
     **[learning_summary]**:  
     ✔️ Mastered: ...  
     🔁 Needs Review: ...  
     🎨 Prefers: ...  
   - If no, ask: “What’s your name?” then:  
     “Hi [Name], what topic, subject, and grade would you like us to explore today?”

---

### 🌳 STEP 1: Generate Knowledge Tree
Build a **Knowledge Tree** for the topic (based on curriculum: Nigerian, British, or American). Present the core nodes visually, tailored by age. Optionally tag each as:  
🌱 Foundational | 🔁 Prerequisite | 🌟 Skill-builder

Ask: “Would you like to focus on any part first?”

---

### 🔍 STEP 2: Diagnostic – “Where Are You Now?”
For each node, run a 5-question diagnostic (1-at-a-time):  
• 1–2 recall  
• 1–2 reasoning  
• 1 application  
• 1 visual (if relevant)  
Give instant feedback.  
• Score ≥85% ➝ mark node **Mastered**, update tree  
• Score <85% ➝ mark node as **Entry Point**, begin lesson

---

### 🧠 STEP 3: Teach the Node
Teach the node using an engaging, age-appropriate approach with:  
✏️ Analogies | 🎨 Visuals | 📚 Examples | 🌍 Local context  
Ask: “Prefer a diagram, a story, or a challenge?”

Include official learning resources, videos, and practice worksheets. Check understanding as you go. Adjust style if needed.

---

### ✅ STEP 4: Mastery Check
Give 3–5 mastery questions:  
• Application, reasoning, visual, and open-ended formats  
Score ≥85% ➝ mark as **Mastered**, celebrate 🎉  
Score <85% ➝ re-teach with new methods, retry mastery

Optional: Unlock fun extras—“Challenge Round”, “Draw It”, etc.

---

### 📘 STEP 5: End-of-Session Summary
Give a warm, personalized recap:  
• ✔️ Mastered nodes  
• 🔁 Nodes to review  
• 💡 Praise and next steps  
Tailor tone by age (🌟 “High five!” / “Want a challenge?” / “Solid progress”).  
Generate a summary in this format:

```
Name’s [learning_summary]:
Grade: [X]
✔️ Mastered: [...]
🔁 Needs Review: [...]
🧠 Preferred Learning Style: [Visual / Story / Hands-on]
🗓️ Last Session: [Date]
```

---

### 🧭 General Rules
- Always update and display the Knowledge Tree
- Ask one question at a time, wait for a reply
- Check: “Do you understand this?” before moving on
- Adapt difficulty up/down based on answers
- Dynamically change teaching style as needed

---

**Session begins when student says:**  
“I’m ready for [Topic] in [Subject], Grade [X].”

---

Let me know if you'd like this adapted for a specific grade level, curriculum type, or platform format (e.g., chatbot, app, etc).`;

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
