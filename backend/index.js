import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Standard error response helper
 */
const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

app.post("/analyze-task", async (req, res) => {
  try {
    const { title, description, comments } = req.body;

    /* -------------------- INPUT VALIDATION -------------------- */
    if (!title || typeof title !== "string") {
      return sendError(res, 400, "Task title is required.");
    }

    if (!description || typeof description !== "object") {
      return sendError(res, 400, "Task description object is required.");
    }

    if (comments && !Array.isArray(comments)) {
      return sendError(res, 400, "Comments must be an array.");
    }

    /* -------------------- CONVERT DESCRIPTION TO TEXT -------------------- */
    const descriptionText = `
Context: ${description.context || "N/A"}
Information: ${description.information?.join(", ") || "N/A"}
Task Points: ${description.taskPoints?.join(", ") || "N/A"}
Deliverables: ${description.deliverables?.join(", ") || "N/A"}
References: ${description.references?.join(", ") || "N/A"}
`;

    /* -------------------- PROMPT -------------------- */
    const prompt = `
You are a project management assistant.
Return ONLY valid JSON with these keys:
- current_progress
- work_completed (array)
- work_pending (array)
- open_questions (array)
- estimated_time_to_complete (string)

Task Title:
${title}

Task Description:
${descriptionText}

Comments:
${comments?.map(c => c.comment || c).join("\n") || "No comments"}
`;

    /* -------------------- LLM CALL -------------------- */
    const llmResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_completion_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000, // prevent hanging
      }
    );

    if (!llmResponse.data?.choices?.length) {
      return sendError(res, 502, "AI returned an empty response.");
    }

    /* -------------------- PARSE & CLEAN -------------------- */
    const rawOutput = llmResponse.data.choices[0].message.content;
    const analysis = cleanLLMJson(rawOutput);

    if (!analysis || Object.keys(analysis).length === 0) {
      return sendError(res, 502, "AI response could not be parsed. Please try again.");
    }

    /* -------------------- SUCCESS -------------------- */
    res.json({
      success: true,
      title,
      description,
      analysis,
    });
  } catch (error) {
    console.error("Analyze task error:", error.message);

    if (error.code === "ECONNABORTED") {
      return sendError(res, 504, "AI service timed out. Please try again.");
    }

    if (error.response?.status === 401) {
      return sendError(res, 500, "AI authentication failed.");
    }

    sendError(res, 500, "Something went wrong while generating the report.");
  }
});

/* -------------------- SAFE JSON CLEANER -------------------- */
function cleanLLMJson(text) {
  try {
    // Remove markdown code fences if present
    const cleaned = text.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    // Deduplicate array fields
    Object.keys(parsed).forEach((key) => {
      if (Array.isArray(parsed[key])) {
        parsed[key] = [...new Set(parsed[key])];
      }
    });

    return parsed;
  } catch (err) {
    console.error("JSON parse failed:", err.message);
    return null;
  }
}

/* -------------------- SERVER -------------------- */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
