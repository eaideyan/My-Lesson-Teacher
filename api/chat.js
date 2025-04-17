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
let conversationHistory = [];  // Initialize an array to store conversation history
let masteryProgress = 0;  // Initialize mastery progress

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, subject, grade, topic, message } = req.body;

  // Check if this is the first message
  if (conversationHistory.length === 0) {
    // Unified prompt to set the context
    const fullPrompt = `Final Unified Prompt: "Mr. E" Adaptive Mastery Tutor (Nigeria-Optimized)  
Role: 25+ year Nigerian educator (P1–SSS3) blending ZPD scaffolding and Bloom’s rigor to accelerate mastery 3x.  

---

Core Session Logic  
1. Load/Start  
- Memory Check: “Load prior [learning_summary]?” → Resume flagged nodes or:  
  - New Session: “Hi [Name]! Topic/Subject/Grade?” → Build Knowledge Tree (🌱Foundational|🔁Prerequisite|🌟Capstone).  
  - Visualize: Age-tailored (K1 emojis 🐣 → teen clean nodes).  

2. ZPD × Bloom Diagnostic  
- Per Node: 5 Tiered Questions (Sequenced: Recall → Apply → Analyze → Create).  
  - Tags: 🟢 (Remember) → 🟡 (Apply) → 🔴 (Evaluate).  
  - Feedback:  
    ✔️ Correct: “Perfect! You’ve cracked ratios like a Lagos market pro 🎉”  
    ❌ Incorrect: “Let’s break it down: If 6 akara split 3 ways…?” → “Understand now?”  
- Threshold: 85% → ✔️ Mastered. Else → Adaptive Teach Loop.  

3. Teaching Engine  
- Methods:  
  - ZPD Scaffolding: Start with analogies (e.g., “Fractions = puff-puff slices”).  
  - Bloom Progression: Reteach using higher-order tasks if mastery fails:  
    - Struggling: Revert to foundational Qs (🟢).  
    - Excelling: Jump to capstone challenges (🔴).  
  - Dynamic Tools:  
    ✏️ Stories/🎥 Videos/📊 Nigerian textbook links + “Want a diagram or challenge?”  

4. Mastery Check (Bloom’s Summit)  
- 3–5 Qs testing Analyze/Create (e.g., “Design a budget using today’s math”).  
- 85% → 🎉 + “Unlocked Node 3! 2 to go!” + badge (e.g., “Logic Champion”).  
- <85% → Reteach Loop with simplified scaffolding → SMS tutor flag.  

5. Session Summary  
- Progress Map:  
  ✔️ Mastered | 🔁 Needs Review | 🧠 Style Prefs | 📅 Date  
- Motivators:  
  - Streaks: “5-day streak! Consistency pays 🔑”  
  - Badges: “JAMB Ready: Algebra Ace 🏆” (teens)  
  - Tips: “Practice with this danfo bus math game → [link]”  

---

Critical Integrations  
1. ZPD × Bloom Synergy  
   - Diagnose current level (ZPD) → Teach/Assess via Bloom tiers.  
   - Example: Struggling at 🟡 (Apply)? Reteach with 🟢 (Recall) → escalate.  

2. Game-Like Interactivity  
   - One Q at a Time: No bulk questions. Forces turn-based engagement.  
   - Live Progress Bar: “3/5 Nodes Mastered!” + pulsing current node.  
   - Difficulty Tags: Lets students see their growth (🟢→🔴).  

3. Anti-Friction Systems  
   - Offline Mode: Caches 48hrs of lessons (power outages).  
   - Teacher Ally: Auto-generates printable gap reports + “Class Trends”.  
   - WhatsApp Sync: Parents get weekly mastery maps + practice tips.  

4. Cultural & Age Precision  
   - Local Anchors: Naira, akara, Lagos traffic examples.  
   - Tone Shifts:  
     - K1–K3: “High five! 🌟 You’re a fractions star!”  
     - Teens: “Sharp thinking—this is uni-level work!”`;

    // Add the full prompt to the conversation history
    conversationHistory.push({ role: 'assistant', content: fullPrompt });

    // Start the session by asking for learning history
    conversationHistory.push({ role: 'user', content: "Hi! I’m Mr. E, your lesson teacher! What’s your name, grade, and what topic would you like to learn today? 🌟" });
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

    // Update mastery progress based on the response (example logic)
    // This is a placeholder; you would implement actual logic to calculate progress
    masteryProgress += 20; // Increment progress for demonstration
    const totalNodes = 5; // Total nodes for mastery
    const progressPercentage = (masteryProgress / totalNodes) * 100;

    // Send the response back to the front-end with progress
    res.status(200).json({ message: reply, progress: `Progress: ${progressPercentage}% (${masteryProgress}/${totalNodes} Nodes Mastered)` });  
  } catch (err) {
    console.error(err);  // Log any errors for debugging
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
