import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function askAI(history) {

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
- Remember previous conversation and answer accordingly.
- Be friendly and conversational.`,
        },

        ...history,
    ];

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
    });

    return completion.choices[0].message.content;
}

export async function generateNotes(topic) {

    const completion = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

            {
                role: "system",
                content: `You are EduCompanion AI.

Create beautiful study notes in Markdown.

The notes must contain:

# Title

## Introduction

## Definition

## Key Points

## Detailed Explanation

## Examples

## Advantages

## Disadvantages

## Interview Questions

## Important Exam Questions

## Summary

Keep the language simple and student friendly.
Use bullet points wherever possible.
Never return plain text.
Always use Markdown formatting.`,
            },

            {
                role: "user",
                content: `Generate complete study notes on "${topic}".`,
            },

        ],

        temperature: 0.6,
        max_tokens: 1800,

    });

    return completion.choices[0].message.content;

}

export async function generateQuizAI(topic)  {

    const messages = [

        {
            role: "system",
            content: `
You are an AI Quiz Generator.

Generate exactly 10 multiple-choice questions.

Return ONLY a valid JSON array.

Each object must have this format:

{
  "question": "Question here",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "answer": "Correct Option"
}

Rules:
- No markdown
- No explanation
- No headings
- No extra text
- Return only JSON
`
        },

        {
            role: "user",
            content: `Generate a quiz on ${topic}`
        }

    ];

    const completion = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages,

        temperature: 0.5,

        max_tokens: 1500,

    });

    return JSON.parse(completion.choices[0].message.content);

}