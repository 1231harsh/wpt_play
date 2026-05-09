const express = require("express");
const path = require("path");
const { getResourceTopicGroups } = require("./resourceTopics");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/resources", express.static(path.join(__dirname, "resources")));
app.use("/vendor/react", express.static(path.join(__dirname, "node_modules", "react", "umd")));
app.use("/vendor/react-dom", express.static(path.join(__dirname, "node_modules", "react-dom", "umd")));

const tutorGuidance = {
  HTML: "HTML gives structure to the page. Focus on what each tag means and what it groups together.",
  CSS: "CSS controls presentation. Try changing colors, spacing, borders, and layout values to see immediate visual impact.",
  JavaScript: "JavaScript adds behavior. Watch how events, DOM updates, and variables change what the user sees.",
  AJAX: "AJAX lets a page fetch or send data without reloading. Pay attention to request flow, loading states, and JSON handling.",
  React: "React builds UI from components and state. Notice how UI is re-rendered when state changes.",
  Node: "Node runs JavaScript on the server. Think in terms of runtime, files, async work, and backend logic.",
  Express: "Express is a thin framework on top of Node for routes, middleware, requests, and responses."
};

async function askOpenAI(question, topic, code) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a friendly web development tutor. Explain clearly, keep answers practical, and relate the answer to the student's current code."
        },
        {
          role: "user",
          content: [
            `Topic: ${topic}`,
            `Question: ${question}`,
            "Current code:",
            code || "No code provided."
          ].join("\n\n")
        }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
}

app.post("/api/ask", async (req, res) => {
  try {
    const { question = "", topic = "", code = "" } = req.body || {};
    const cleanQuestion = String(question).trim();
    const cleanTopic = String(topic).trim() || "General";
    const hint = tutorGuidance[cleanTopic] || "Break the concept into structure, style, behavior, and data flow.";

    if (!cleanQuestion) {
      return res.json({
        answer: "Ask a specific question like: 'Why does this button not update the DOM?' or 'What does border-collapse do in a table?'"
      });
    }

    if (OPENAI_API_KEY) {
      try {
        const answer = await askOpenAI(cleanQuestion, cleanTopic, code);
        if (answer) {
          return res.json({ answer });
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    const response = [
      `Topic: ${cleanTopic}`,
      hint,
      `Your question: ${cleanQuestion}`,
      code
        ? "From your current code, the best next step is to change one small thing and observe the result in the preview."
        : "Try opening an example first, then tweak one line at a time.",
      "If you want a stronger AI answer later, connect this endpoint to OpenAI or another model provider with an API key."
    ].join("\n\n");

    return res.json({ answer: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: `Tutor error: ${error.message}` });
  }
});

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/topics", (_req, res) => {
  res.json({ groups: getResourceTopicGroups() });
});

app.get("/api/tutor-status", (_req, res) => {
  res.json({
    mode: OPENAI_API_KEY ? `OpenAI-compatible model (${OPENAI_MODEL})` : "built-in fallback guide"
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Web Concepts Lab is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
