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

export async function analyzeImage(
    imageBuffer,
    mimeType,
    question
) {

    const base64Image =
        imageBuffer.toString("base64");

    const completion =
        await groq.chat.completions.create({

            model: "qwen/qwen3.6-27b",

            messages: [

                {
                    role: "system",

                    content: `
You are EduCompanion, an AI Study Assistant.

Analyze the uploaded image carefully.

Answer the student's question based only on what is visible in the image.

Rules:

- Explain in simple English.
- Use Markdown formatting.
- If the image contains text, read it carefully.
- If it contains a diagram, explain the diagram.
- If it contains a mathematical problem, solve it step by step.
- If the image contains code, explain the code clearly.
- If the image is unclear, honestly say that it is unclear.
- Do not invent information that is not visible in the image.
- Be student-friendly.
                    `,
                },

                {
                    role: "user",

                    content: [

                        {
                            type: "text",

                            text:
                                question ||
                                "Explain this image in detail.",
                        },

                        {
                            type: "image_url",

                            image_url: {

                                url:
                                    `data:${mimeType};base64,${base64Image}`,

                            },

                        },

                    ],

                },

            ],

            temperature: 0.7,

            max_completion_tokens: 1500,

        });

    return completion
        .choices[0]
        .message
        .content;
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

export async function generateQuizAI(topic) {

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

    let response = completion.choices[0].message.content;

    response = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(response);

}

export async function generateFlashcards(topic) {

    const messages = [

        {
            role: "system",
            content: `
You are an AI Flashcard Generator.

Generate exactly 10 flashcards.

Return ONLY a valid JSON array.

Each flashcard must follow this format:

{
   "question":"Question here",
   "answer":"Answer here"
}

Rules:
- Return only JSON.
- No markdown.
- No explanation.
- No headings.
- No numbering.
- Keep answers short (1-3 lines).
- Cover beginner to intermediate concepts.
`
        },

        {
            role: "user",
            content: `Generate flashcards on "${topic}".`
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