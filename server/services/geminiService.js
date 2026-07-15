import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function askAI(prompt, history = []) {

    const messages = [
        {
            role: "system",
            content: `You are EduCompanion, an AI Study Assistant.

Rules:
- Use Markdown formatting.
- Explain concepts in simple English.
- Use headings and bullet points.
- Use code blocks whenever writing code.
- Keep answers clear and student-friendly.
- Give examples whenever possible.
- End with a short summary if the answer is long.
- If the user asks a follow-up question, use the previous conversation as context.
- Be friendly and conversational.`,
        },

        // Previous Conversation
        ...history.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
        })),

        // Current Question
        {
            role: "user",
            content: prompt,
        },
    ];

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
    });

    return completion.choices[0].message.content;
}