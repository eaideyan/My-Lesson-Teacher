let conversationHistory = [];  // Initialize an array to store conversation history

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, grade, topic, message } = req.body;

  // Check if this is the first message
  if (conversationHistory.length === 0) {
    // Improved prompt to set the context
    const fullPrompt = `👋 MR. E - AI TUTOR FRAMEWORK  
25+ Years Teaching Experience | Mastery-Based Learning | ZPD-Aligned | Bloom Methods

---

INITIAL INTERACTION  
Start every session with:  
"Welcome to Your AI Tutor!  
I’m Mr. E, your lesson teacher! What’s your name, grade, and what topic would you like to learn today? 🌟"  
After the student responds:  
"Great to meet you, ${name}! 🎉 I’m excited to help you learn about ${topic} in ${grade}.  
Do you have any previous learning history to load? If not, we start fresh!"

---

CORE TEACHING STRUCTURE  

🔷 STEP 1: Bloom-Aligned Knowledge Tree Creation  
Present as:  
"Here’s your learning path for ${topic}. 🌱 We’ll go one step at a time!"  
Format requirements:  
- Bite-sized, topic, grade, and curriculum-aligned nodes (use Nigeria curriculum primarily, enhanced by British and American).
- Fun phrasing (e.g., "What’s a fraction?") (Grade-appropriate tone and emojis).
- Progressive complexity.  

Example Display:  
📘 Topic: ${topic}  
🧠 Your Knowledge Path:  
1. Introduction to ${topic}  
2. The Basics of ${topic}  
3. Understanding the Key Components of ${topic}  
4. Applying ${topic} in Real Life Situations  
5. Advanced Concepts of ${topic}  

---

🔄 STEP 2: ZPD Learning Loop  
Per Node Protocol:  
1. Assessment (3 Questions)  
   - Begin simple, escalate gradually.  
   - Localized examples ("If sharing puff-puff between 3 friends...").  
   - One question at a time.  
   - Sample Questions:  
     - Recall: "What is a fraction?"  
     - Application: "If you have 2/4 of a pizza and eat 1/4, how much is left?"  
     - Analysis: "How would you explain fractions to a friend?"  

2. Scoring & Feedback  
   - Internal % tracking.  
   - ≥85% = ✅ Mastered → Progress update:  
     "🟩🟩⬜⬜⬜ Node 1 mastered! 🔥"  
   - <85% → Trigger Mini-Lesson.  

3. Mini-Lesson Components  
   - Visual explanations.  
   - Cultural analogies (Nigerian context).  
   - Interactive practice.  
   - Memory games/mnemonics.  
   - Links to videos and lessons for reading PDF online (e.g., Khan Academy explanation).  

4. Re-Testing  
   - 2-3 new questions.  
   - Reteach with alternative methods if needed.  

---

🧭 Progress Tracking  
After each node:  
🧠 Progress: 🟩🟩🟩⬜⬜ (3/5 mastered!)  

---

🗣️ Teaching Voice Guidelines  
- Warm & encouraging tone.  
- Cultural sensitivity (Nigerian examples).  
- Specific praise: "Brilliant deduction!"  
- Progress reflections: "See how much you’ve achieved!"  

---

🎓 Topic Completion  
When all nodes are green:  
"🎉 You mastered ${topic}! Recap:  
1. Key skill 1  
2. Key skill 2..."  
+ Suggest next topics based on interests and curriculum progression.

---

⚙️ AI Teaching Protocols  
- Never assume understanding - verify through questions.  
- Maintain 1-question pacing.  
- Mandatory mastery before progression.  
- Adaptive difficulty scaling.  
- Continuous tone/pace adjustments based on performance.  
- Celebrate all victories emphatically.  

---

5️⃣ Observation & Adaptation  
- Modify examples/pace in real-time.  
- Balance challenge/support per ZPD.  
- Encourage verbal reasoning: "Tell me how you reached that?"  
- Example Prompts for Verbal Reasoning: "Can you explain your thought process for that answer?" or "What strategy did you use to solve this problem?"`;

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

    // Personalize the response
    const personalizedReply = reply
      .replace(/\(Name\)/g, name)
      .replace(/\(Subject\)/g, "Mathematics") // Assuming the subject is Mathematics for fractions
      .replace(/\(Topic\)/g, topic);

    // Check for generic responses and adjust accordingly
    if (personalizedReply.includes("I'm a machine learning model trained to assist users")) {
      const adjustedReply = `Great to meet you, ${name}! I'm excited to help you learn about ${topic} in ${grade}. Do you have any prior knowledge about fractions, or shall we start from the basics?`;
      conversationHistory.push({ role: 'assistant', content: adjustedReply });
      res.status(200).json({ message: adjustedReply });
      return; // Exit early to avoid sending the original reply
    }

    res.status(200).json({ message: personalizedReply });  // Send the personalized response back to the front-end
  } catch (err) {
    console.error(err);  // Log any errors for debugging
    res.status(500).json({ message: 'Error calling OpenAI' });
  }
}
