import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


// ======================================================
// NORMAL AI CHAT
// ======================================================

export async function askAI(history = []) {

    const MAX_HISTORY_CHARS = 12000;

    let totalChars = 0;

    const limitedHistory = [];

    for (
        let i = history.length - 1;
        i >= 0;
        i--
    ) {

        const message = history[i];

        if (
            !message ||
            !message.content
        ) {
            continue;
        }

        let content =
            String(message.content);

        if (content.length > 2500) {

            content =
                content.substring(0, 2500) +
                "\n\n[Previous response shortened for context.]";

        }

        if (
            totalChars + content.length >
            MAX_HISTORY_CHARS
        ) {
            break;
        }

        limitedHistory.unshift({
            role: message.role,
            content,
        });

        totalChars += content.length;
    }


    const messages = [

        {
            role: "system",

            content: `
You are EduCompanion, an AI Study Assistant.

Rules:

- Use Markdown formatting.
- Explain concepts in simple English.
- Use headings and bullet points.
- Use code blocks whenever writing code.
- Keep answers clear and student-friendly.
- Give examples whenever possible.
- End with a short summary if the answer is long.
- Remember previous conversation and answer accordingly.
- Be friendly and conversational.
            `,
        },

        ...limitedHistory,

    ];


    console.log(
        `🧠 AI history: ${limitedHistory.length} messages`
    );

    console.log(
        `📝 AI history characters: ${totalChars}`
    );


    const completion =
        await groq.chat.completions.create({

            model:
                "openai/gpt-oss-120b",

            messages,

            temperature:
                0.7,

            max_completion_tokens:
                1024,

            reasoning_effort:
                "low",

        });


    const answer =
        completion
            ?.choices?.[0]
            ?.message
            ?.content;


    if (!answer) {

        throw new Error(
            "AI returned an empty response"
        );

    }


    return answer;

}



// ======================================================
// ANALYZE NORMAL IMAGE
// ======================================================

export async function analyzeImage(
    imageBuffer,
    mimeType,
    question
) {

    if (
        !imageBuffer ||
        !Buffer.isBuffer(imageBuffer)
    ) {

        throw new Error(
            "Invalid image buffer"
        );

    }


    const base64Image =
        imageBuffer.toString("base64");


    if (!base64Image) {

        throw new Error(
            "Unable to convert image to Base64"
        );

    }


    const completion =
        await groq.chat.completions.create({

            model:
                "qwen/qwen3.6-27b",

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

            temperature:
                0.7,

            max_completion_tokens:
                1500,

        });


    const answer =
        completion
            ?.choices?.[0]
            ?.message
            ?.content;


    if (!answer) {

        throw new Error(
            "Image AI returned an empty response"
        );

    }


    return answer;

}



// ======================================================
// ANALYZE TEXT / VISUAL PDF
// ======================================================

export async function analyzePDF(
    pdfText,
    pageImages = [],
    question = ""
) {

    // ==================================================
    // VALIDATE PDF TEXT
    // ==================================================

    if (
        !pdfText ||
        !pdfText.trim()
    ) {

        throw new Error(
            "No readable text found in PDF"
        );

    }


    const cleanQuestion =
        String(question || "").trim();


    const lowerQuestion =
        cleanQuestion.toLowerCase();


    console.log(
        `🔎 PDF question: ${cleanQuestion}`
    );


    // ==================================================
    // VISUAL KEYWORDS
    // ==================================================

    const visualKeywords = [

        "image",
        "photo",
        "photograph",
        "picture",
        "person",
        "face",
        "appearance",
        "look like",
        "shown",
        "visible",
        "visual",
        "chart",
        "graph",
        "diagram",
        "table",
        "figure",
        "screenshot",
        "illustration",
        "logo",
        "qr code",
        "qr",
        "color",
        "colour",
        "wearing",
        "attire",
        "dress",
        "clothing"

    ];


    const isVisualQuestion =
        visualKeywords.some(
            keyword =>
                lowerQuestion.includes(keyword)
        );


    console.log(
        `🧠 Question type: ${
            isVisualQuestion
                ? "VISUAL"
                : "TEXT"
        }`
    );


    // ==================================================
    // LIMIT PDF TEXT
    // ==================================================

    const MAX_TEXT_CHARS = 12000;


    const limitedText =
        pdfText.length > MAX_TEXT_CHARS

            ? pdfText.substring(
                0,
                MAX_TEXT_CHARS
            )

            : pdfText;


    console.log(
        `📄 PDF text available: ${limitedText.length} characters`
    );



    // ==================================================
    // TEXT PDF
    // ==================================================

    if (!isVisualQuestion) {

        console.log(
            "📝 Normal text PDF question detected"
        );


        try {

            const completion =
                await groq.chat.completions.create({

                    model:
                        "openai/gpt-oss-120b",

                    messages: [

                        {

                            role: "system",

                            content: `
You are EduCompanion, an AI Study Assistant.

The student has uploaded a PDF and is asking a question about its contents.

Use the extracted PDF text as the PRIMARY source.

Student-friendly rules:

- Answer the student's exact question.
- Use ONLY information supported by the PDF text.
- Do not invent information.
- If the answer cannot be found in the PDF, clearly say that.
- Explain in simple English.
- Use Markdown formatting when useful.
- Use headings and bullet points when appropriate.
- If the student asks "explain in brief", give a short and concise explanation.
- If the student asks "explain in detail", provide a detailed explanation.
- If the student asks about a specific topic, focus on that topic.
- If the student asks for a definition, provide the definition first.
- If the student asks for comparison, use a table when appropriate.
- If the student asks a mathematical or technical question, explain the reasoning clearly.
- Do not mention internal processing.
- Do not mention that you are an AI.

Student question:

${cleanQuestion || "Explain the PDF briefly."}

PDF content:

${limitedText}
                            `.trim(),

                        },

                        {

                            role: "user",

                            content:
                                cleanQuestion ||
                                "Explain the main content of this PDF briefly.",

                        },

                    ],

                    temperature:
                        0.3,

                    max_completion_tokens:
                        1200,

                    // IMPORTANT:
                    // GPT-OSS supports low/medium/high.
                    // "none" is NOT valid.
                    reasoning_effort:
                        "low",

                });


            const answer =
                completion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (!answer) {

                throw new Error(
                    "Text PDF AI returned an empty response"
                );

            }


            console.log(
                "✅ Text PDF analysis completed successfully"
            );


            return answer;

        }

        catch (error) {

            console.error(
                "❌ TEXT PDF AI ERROR:",
                error
            );


            throw error;

        }

    }



    // ==================================================
    // VISUAL PDF
    // ==================================================

    console.log(
        "🖼️ Visual PDF question detected"
    );


    if (
        !pageImages ||
        !Array.isArray(pageImages) ||
        pageImages.length === 0
    ) {

        throw new Error(
            "No PDF page images available for visual analysis"
        );

    }



    // ==================================================
    // VISUAL QUESTION CATEGORY
    // ==================================================

    const personKeywords = [

        "person",
        "image",
        "photo",
        "photograph",
        "picture",
        "face",
        "appearance",
        "look like",
        "shown",
        "wearing",
        "attire",
        "dress",
        "clothing"

    ];


    const structuredVisualKeywords = [

        "chart",
        "graph",
        "diagram",
        "table",
        "figure",
        "screenshot",
        "illustration",
        "logo",
        "qr code",
        "qr"

    ];


    const isPersonQuestion =
        personKeywords.some(
            keyword =>
                lowerQuestion.includes(keyword)
        );


    const isStructuredVisualQuestion =
        structuredVisualKeywords.some(
            keyword =>
                lowerQuestion.includes(keyword)
        );


    console.log(
        `🧠 Person visual question: ${isPersonQuestion}`
    );


    console.log(
        `📊 Structured visual question: ${isStructuredVisualQuestion}`
    );



    // ==================================================
    // SELECT PAGES
    // ==================================================

    let selectedPageImages = [];


    if (isPersonQuestion) {

        selectedPageImages =
            pageImages.slice(0, 1);

    }

    else if (
        isStructuredVisualQuestion
    ) {

        selectedPageImages =
            pageImages.slice(0, 2);

    }

    else {

        selectedPageImages =
            pageImages.slice(0, 1);

    }


    console.log(
        `🖼️ Selected ${selectedPageImages.length}/${pageImages.length} PDF page(s)`
    );



    // ==================================================
    // SUPPORTING TEXT
    // ==================================================

    const visualContext =
        limitedText.length > 1500

            ? limitedText.substring(
                0,
                1500
            )

            : limitedText;



    // ==================================================
    // MULTIMODAL CONTENT
    // ==================================================

    const content = [];


    content.push({

        type: "text",

        text: `
You are EduCompanion, an AI Study Assistant.

The student is asking a visual question about an uploaded PDF.

Student question:

${cleanQuestion || "Describe the visual content of this PDF."}

Use the PDF page image as the PRIMARY source.

The extracted PDF text is only supporting context.

IMPORTANT RULES:

- Carefully inspect the provided page image.
- Answer the student's exact question.
- Describe only information clearly visible in the image.
- Do not invent visual details.
- If the question asks about a person, describe visible characteristics only.
- Do not identify a real person by facial appearance alone.
- If the requested information is unclear or not visible, say so.
- Use extracted PDF text only for document context.
- Keep the answer concise and useful.
- Use Markdown when helpful.

Supporting PDF text:

${visualContext}
        `.trim()

    });



    // ==================================================
    // ADD PAGE IMAGES
    // ==================================================

    for (
        let index = 0;
        index < selectedPageImages.length;
        index++
    ) {

        const imageBuffer =
            selectedPageImages[index];


        if (
            !imageBuffer ||
            !Buffer.isBuffer(imageBuffer)
        ) {

            console.warn(
                `⚠️ Skipping invalid PDF page image ${index + 1}`
            );

            continue;

        }


        const base64Image =
            imageBuffer.toString("base64");


        if (!base64Image) {

            continue;

        }


        console.log(
            `🖼️ Preparing visual PDF page ${index + 1}`
        );


        content.push({

            type: "text",

            text:
                `PDF Page ${index + 1}`

        });


        content.push({

            type: "image_url",

            image_url: {

                url:
                    `data:image/jpeg;base64,${base64Image}`

            }

        });

    }



    // ==================================================
    // VALIDATE IMAGE CONTENT
    // ==================================================

    if (content.length <= 1) {

        throw new Error(
            "No valid PDF page images available"
        );

    }



    // ==================================================
    // VISION REQUEST
    // ==================================================

    try {

        console.log(
            "🤖 Sending visual PDF question to Vision AI..."
        );


        const completion =
            await groq.chat.completions.create({

                model:
                    "qwen/qwen3.6-27b",

                messages: [

                    {

                        role: "system",

                        content: `
You are EduCompanion.

Answer visual PDF questions using the provided page images.

Rules:

- Inspect the images carefully.
- Answer the exact student question.
- Use visible information only.
- Do not invent details.
- Use simple English.
- Use Markdown where useful.
- Keep the answer concise.
                        `,

                    },

                    {

                        role: "user",

                        content,

                    },

                ],

                temperature:
                    0.2,

                max_completion_tokens:
                    700,

            });


        const answer =
            completion
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!answer) {

            throw new Error(
                "Vision AI returned an empty response"
            );

        }


        console.log(
            "✅ Visual PDF analysis completed"
        );


        return answer;

    }

    catch (error) {

        console.error(
            "❌ VISUAL PDF AI ERROR:",
            error
        );


        // ==================================================
        // VISUAL FALLBACK
        // ==================================================

        console.log(
            "🔄 Trying minimal visual fallback..."
        );


        try {

            const firstImage =
                pageImages[0];


            if (
                !firstImage ||
                !Buffer.isBuffer(firstImage)
            ) {

                throw error;

            }


            const base64Image =
                firstImage.toString("base64");


            const fallbackCompletion =
                await groq.chat.completions.create({

                    model:
                        "qwen/qwen3.6-27b",

                    messages: [

                        {

                            role: "user",

                            content: [

                                {

                                    type: "text",

                                    text: `
Answer this question about the PDF page:

${cleanQuestion}

Inspect the image carefully.

Only use information clearly visible in the image.
Do not invent information.
If the requested information is not visible, say so.
                                    `.trim(),

                                },

                                {

                                    type: "image_url",

                                    image_url: {

                                        url:
                                            `data:image/jpeg;base64,${base64Image}`

                                    },

                                },

                            ],

                        },

                    ],

                    temperature:
                        0.2,

                    max_completion_tokens:
                        500,

                });


            const fallbackAnswer =
                fallbackCompletion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (!fallbackAnswer) {

                throw error;

            }


            console.log(
                "✅ Visual fallback completed"
            );


            return fallbackAnswer;

        }

        catch (fallbackError) {

            console.error(
                "❌ Visual fallback failed:",
                fallbackError
            );


            throw fallbackError;

        }

    }

}



// ======================================================
// ANALYZE SCANNED PDF
// ONE PAGE AT A TIME
// ======================================================

export async function analyzePDFImages(
    imageBuffers,
    question
) {

    if (
        !imageBuffers ||
        !Array.isArray(imageBuffers) ||
        imageBuffers.length === 0
    ) {

        throw new Error(
            "No PDF page images found"
        );

    }


    console.log(
        `🤖 Analyzing ${imageBuffers.length} PDF pages with AI...`
    );


    const results = [];


    for (
        let index = 0;
        index < imageBuffers.length;
        index++
    ) {

        console.log(
            `📦 Processing page ${index + 1}/${imageBuffers.length}...`
        );


        let imageBuffer =
            imageBuffers[index];


        // ==================================================
        // NORMALIZE BUFFER
        // ==================================================

        try {

            if (!Buffer.isBuffer(imageBuffer)) {

                imageBuffer =
                    Buffer.from(imageBuffer);

            }

        }

        catch (bufferError) {

            console.error(
                `❌ Buffer conversion failed for page ${index + 1}:`,
                bufferError.message
            );


            results.push(
                `## Page ${index + 1}\n\nUnable to read this page.`
            );


            continue;

        }


        // ==================================================
        // VALIDATE
        // ==================================================

        if (
            !imageBuffer ||
            !Buffer.isBuffer(imageBuffer) ||
            imageBuffer.length === 0
        ) {

            results.push(
                `## Page ${index + 1}\n\nUnable to read this page.`
            );


            continue;

        }


        console.log(
            `📏 Page ${index + 1} image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`
        );


        const base64Image =
            imageBuffer.toString("base64");


        if (
            !base64Image ||
            base64Image.length < 100
        ) {

            results.push(
                `## Page ${index + 1}\n\nUnable to read this page.`
            );


            continue;

        }


        // ==================================================
        // AI ANALYSIS
        // ==================================================

        try {

            console.log(
                `🤖 Sending page ${index + 1} to AI...`
            );


            const completion =
                await groq.chat.completions.create({

                    model:
                        "qwen/qwen3.6-27b",

                    messages: [

                        {

                            role: "system",

                            content: `
You are EduCompanion, an AI Study Assistant.

You are analyzing ONE page of a scanned PDF.

Carefully inspect the provided image.

Rules:

- Read all visible text carefully.
- Extract important information.
- Explain diagrams and charts.
- Solve mathematical problems step by step.
- Explain code if present.
- Try to understand handwritten notes.
- Do not invent information.
- If something is unclear, mention it.
- Answer the student's question using information visible on the page.
- Use simple English.
- Use Markdown formatting.
- Be concise but informative.
                            `,

                        },

                        {

                            role: "user",

                            content: [

                                {

                                    type: "text",

                                    text:
                                        question ||
                                        "Explain the content of this PDF page clearly.",

                                },

                                {

                                    type: "image_url",

                                    image_url: {

                                        url:
                                            `data:image/jpeg;base64,${base64Image}`,

                                    },

                                },

                            ],

                        },

                    ],

                    temperature:
                        0.5,

                    max_completion_tokens:
                        1000,

                });


            const answer =
                completion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (!answer) {

                results.push(
                    `## Page ${index + 1}\n\nAI could not analyze this page.`
                );

                continue;

            }


            results.push(
                `## Page ${index + 1}\n\n${answer}`
            );


            console.log(
                `✅ Page ${index + 1} analyzed successfully`
            );

        }

        catch (error) {

            console.error(
                `❌ Error analyzing page ${index + 1}:`,
                error.message
            );


            results.push(
                `## Page ${index + 1}\n\nUnable to analyze this page.`
            );

        }


        // ==================================================
        // DELAY
        // ==================================================

        if (
            index <
            imageBuffers.length - 1
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1500
                    )
            );

        }

    }


    const finalAnswer =
        results.join(
            "\n\n---\n\n"
        );


    console.log(
        "✅ Scanned PDF analysis completed"
    );


    return finalAnswer;

}



// ======================================================
// GENERATE NOTES
// ======================================================

export async function generateNotes(topic) {

    if (
        !topic ||
        !topic.trim()
    ) {

        throw new Error(
            "Topic is required"
        );

    }


    console.log(
        `📝 Generating notes for: ${topic}`
    );


    try {

        const completion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                messages: [

                    {

                        role: "system",

                        content: `
You are EduCompanion AI, an expert study assistant.

Create clear, complete and student-friendly study notes.

Rules:

- Use Markdown formatting.
- Use clear headings and subheadings.
- Use bullet points wherever useful.
- Explain concepts in simple English.
- Give practical and academic examples.
- Focus on exam preparation.
- Include important concepts and definitions.
- Avoid unnecessary complexity.
- Do not mention that you are an AI.
- Do not return JSON.
- Return only the study notes.

TABLE RULES:

- Use Markdown tables when information is naturally comparative or structured.
- Use tables for comparisons such as advantages vs disadvantages, types, features, differences, classifications, or similar structured information.
- Always include a clear header row in every table.
- Keep table cells concise and readable.
- Use valid GitHub-Flavored Markdown table syntax.

Use this structure:

# Topic Title

## Introduction

## Definition

## Key Concepts

## Detailed Explanation

## Examples

## Advantages

## Disadvantages

## Applications

## Important Points for Exam

## Interview Questions

## Summary
                        `,

                    },

                    {

                        role: "user",

                        content:
                            `Create complete study notes on "${topic}".`,

                    },

                ],

                temperature:
                    0.5,

                max_completion_tokens:
                    2500,

                reasoning_effort:
                    "low",

            });


        const answer =
            completion
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!answer) {

            throw new Error(
                "AI returned an empty response"
            );

        }


        console.log(
            "✅ Notes generated successfully"
        );


        return answer;

    }

    catch (error) {

        console.error(
            "❌ GENERATE NOTES ERROR:",
            error
        );


        throw new Error(
            error?.message ||
            "Failed to generate notes"
        );

    }

}



// ======================================================
// GENERATE QUIZ
// ======================================================

export async function generateQuizAI(topic) {

    if (
        !topic ||
        !topic.trim()
    ) {

        throw new Error(
            "Quiz topic is required"
        );

    }


    console.log(
        "🧠 Generating quiz for:",
        topic
    );


    try {

        const completion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                messages: [

                    {

                        role: "system",

                        content: `
You are EduCompanion AI Quiz Generator.

Generate exactly 10 multiple-choice questions about the requested topic.

Rules:

- Generate exactly 10 questions.
- Every question must have exactly 4 options.
- Only one option must be correct.
- The answer must exactly match one of the options.
- Questions should be educational and accurate.
- Cover beginner to intermediate concepts.
- Do not generate duplicate questions.
- Keep questions clear and student-friendly.
- Do not include explanations.
- Do not include markdown.
- Return data according to the provided JSON schema.
                        `,

                    },

                    {

                        role: "user",

                        content:
                            `Generate a quiz on the topic: "${topic.trim()}"`

                    },

                ],

                response_format: {

                    type:
                        "json_schema",

                    json_schema: {

                        name:
                            "quiz",

                        strict:
                            true,

                        schema: {

                            type:
                                "object",

                            properties: {

                                quiz: {

                                    type:
                                        "array",

                                    items: {

                                        type:
                                            "object",

                                        properties: {

                                            question: {

                                                type:
                                                    "string"

                                            },

                                            options: {

                                                type:
                                                    "array",

                                                items: {

                                                    type:
                                                        "string"

                                                },

                                                minItems:
                                                    4,

                                                maxItems:
                                                    4

                                            },

                                            answer: {

                                                type:
                                                    "string"

                                            }

                                        },

                                        required: [

                                            "question",
                                            "options",
                                            "answer"

                                        ],

                                        additionalProperties:
                                            false

                                    },

                                    minItems:
                                        10,

                                    maxItems:
                                        10

                                }

                            },

                            required: [

                                "quiz"

                            ],

                            additionalProperties:
                                false

                        }

                    }

                },

                temperature:
                    0.3,

                max_completion_tokens:
                    4000,

                reasoning_effort:
                    "low",

            });


        const rawResponse =
            completion
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!rawResponse) {

            throw new Error(
                "AI returned an empty quiz response"
            );

        }


        let parsedResponse;


        try {

            parsedResponse =
                JSON.parse(rawResponse);

        }

        catch (jsonError) {

            console.error(
                "❌ Quiz JSON Parse Error:",
                jsonError.message
            );


            throw new Error(
                "AI returned invalid quiz JSON"
            );

        }


        if (
            !parsedResponse ||
            !Array.isArray(
                parsedResponse.quiz
            )
        ) {

            throw new Error(
                "Invalid quiz format returned by AI"
            );

        }


        if (
            parsedResponse.quiz.length !== 10
        ) {

            throw new Error(
                `Expected 10 questions but received ${parsedResponse.quiz.length}`
            );

        }


        const quiz =
            parsedResponse.quiz.map(
                (item, index) => {

                    if (
                        !item ||
                        typeof item.question !== "string" ||
                        !Array.isArray(item.options) ||
                        typeof item.answer !== "string"
                    ) {

                        throw new Error(
                            `Invalid question format at question ${index + 1}`
                        );

                    }


                    if (
                        item.options.length !== 4
                    ) {

                        throw new Error(
                            `Question ${index + 1} must have exactly 4 options`
                        );

                    }


                    const options =
                        item.options.map(
                            option =>
                                String(option).trim()
                        );


                    if (
                        new Set(options).size !== 4
                    ) {

                        throw new Error(
                            `Question ${index + 1} contains duplicate options`
                        );

                    }


                    const answer =
                        String(
                            item.answer
                        ).trim();


                    if (
                        !options.includes(answer)
                    ) {

                        throw new Error(
                            `Correct answer does not match any option in question ${index + 1}`
                        );

                    }


                    return {

                        question:
                            item.question.trim(),

                        options,

                        answer,

                    };

                }
            );


        console.log(
            "✅ Quiz generated successfully"
        );


        console.log(
            `📝 Total questions: ${quiz.length}`
        );


        return quiz;

    }

    catch (error) {

        console.error(
            "❌ generateQuizAI ERROR:",
            error
        );


        throw error;

    }

}



// ======================================================
// GENERATE FLASHCARDS
// ======================================================

export async function generateFlashcards(topic) {

    if (
        !topic ||
        !topic.trim()
    ) {

        throw new Error(
            "Topic is required"
        );

    }


    console.log(
        `🃏 Generating flashcards for: ${topic}`
    );


    try {

        const completion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                messages: [

                    {

                        role: "system",

                        content: `
You are EduCompanion AI Flashcard Generator.

Generate exactly 10 useful study flashcards.

Rules:

- Cover beginner to intermediate concepts.
- Questions should test understanding.
- Answers should be short and easy to remember.
- Answers should normally be 1-3 lines.
- Keep the content technically correct.
- Avoid duplicate questions.
- Cover different parts of the topic.
                        `,

                    },

                    {

                        role: "user",

                        content:
                            `Generate 10 flashcards on "${topic}".`,

                    },

                ],

                temperature:
                    0.4,

                max_completion_tokens:
                    2500,

                reasoning_effort:
                    "low",

                response_format: {

                    type:
                        "json_schema",

                    json_schema: {

                        name:
                            "flashcards",

                        strict:
                            true,

                        schema: {

                            type:
                                "object",

                            properties: {

                                flashcards: {

                                    type:
                                        "array",

                                    items: {

                                        type:
                                            "object",

                                        properties: {

                                            question: {

                                                type:
                                                    "string"

                                            },

                                            answer: {

                                                type:
                                                    "string"

                                            }

                                        },

                                        required: [

                                            "question",
                                            "answer"

                                        ],

                                        additionalProperties:
                                            false

                                    },

                                    minItems:
                                        10,

                                    maxItems:
                                        10

                                }

                            },

                            required: [

                                "flashcards"

                            ],

                            additionalProperties:
                                false

                        }

                    }

                },

            });


        const content =
            completion
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!content) {

            throw new Error(
                "AI returned an empty flashcard response"
            );

        }


        const data =
            JSON.parse(content);


        if (
            !data.flashcards ||
            !Array.isArray(
                data.flashcards
            )
        ) {

            throw new Error(
                "Invalid flashcard format returned by AI"
            );

        }


        console.log(
            `✅ Flashcards generated successfully: ${data.flashcards.length}`
        );


        return data.flashcards;

    }

    catch (error) {

        console.error(
            "❌ GENERATE FLASHCARDS ERROR:",
            error
        );


        throw new Error(
            error?.message ||
            "Failed to generate flashcards"
        );

    }

}

// ======================================================
// GENERATE NOTES FROM PDF
// ======================================================

export async function generateNotesFromPDF(pdfText) {

    if (!pdfText || !pdfText.trim()) {
        throw new Error("PDF text is required");
    }

    console.log(
        `📄 Generating notes from PDF: ${pdfText.length} characters`
    );

    try {

        const MAX_CHUNK_CHARS = 12000;

        const chunks = [];

        for (
            let i = 0;
            i < pdfText.length;
            i += MAX_CHUNK_CHARS
        ) {

            chunks.push(
                pdfText.substring(
                    i,
                    i + MAX_CHUNK_CHARS
                )
            );

        }

        console.log(
            `📚 PDF divided into ${chunks.length} chunks`
        );

        const chunkSummaries = [];

        // ----------------------------------------------
        // SUMMARIZE EACH CHUNK
        // ----------------------------------------------

        for (
            let index = 0;
            index < chunks.length;
            index++
        ) {

            console.log(
                `📝 Summarizing PDF chunk ${index + 1}/${chunks.length}`
            );

            const completion =
                await groq.chat.completions.create({

                    model:
                        "openai/gpt-oss-120b",

                    messages: [

                        {
                            role: "system",

                            content: `
You are EduCompanion AI.

Summarize the provided section of a student's PDF.

Rules:

- Use ONLY information present in the PDF section.
- Do not invent information.
- Focus on important academic concepts.
- Remove unnecessary repetition.
- Use simple English.
- Use headings and bullet points.
- Keep the summary concise.
- Preserve important definitions, formulas, examples and key facts.
- Do not write an introduction about yourself.
- Return only the summary.
                            `.trim(),
                        },

                        {
                            role: "user",

                            content:
                                `Summarize PDF section ${index + 1}:\n\n${chunks[index]}`,
                        },

                    ],

                    temperature:
                        0.3,

                    max_completion_tokens:
                        1800,

                    reasoning_effort:
                        "low",

                });


            const summary =
                completion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (summary) {

                chunkSummaries.push(
                    summary
                );

            }

        }

        // ----------------------------------------------
        // FINAL COMBINED NOTES
        // ----------------------------------------------

        const combinedSummary =
            chunkSummaries.join("\n\n");


        console.log(
            "📚 Creating final brief PDF notes..."
        );


        const finalCompletion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                messages: [

                    {

                        role: "system",

                        content: `
You are EduCompanion AI.

Create final brief study notes from the supplied PDF section summaries.

Rules:

- Use ONLY the supplied information.
- Do not invent information.
- Remove duplicate information.
- Organize topics logically.
- Keep the notes concise but useful.
- Preserve important definitions.
- Preserve important formulas.
- Preserve important examples.
- Use Markdown.
- Use headings and bullet points.
- Use tables when comparison is useful.
- Focus on exam preparation.
- Do not mention that you are an AI.
- Return ONLY the final notes.

Suggested structure:

# PDF Study Notes

## Main Topics

## Important Concepts

## Definitions

## Important Points

## Formulas

## Examples

## Exam Focus

## Quick Revision

## Summary
                        `.trim(),

                    },

                    {

                        role:
                            "user",

                        content:
                            combinedSummary,

                    },

                ],

                temperature:
                    0.3,

                max_completion_tokens:
                    3000,

                reasoning_effort:
                    "low",

            });


        const finalNotes =
            finalCompletion
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!finalNotes) {

            throw new Error(
                "AI returned empty PDF notes"
            );

        }


        console.log(
            "✅ PDF notes generated successfully"
        );


        return finalNotes;

    }

    catch (error) {

        console.error(
            "❌ generateNotesFromPDF ERROR:",
            error
        );

        throw error;

    }

}



// ======================================================
// GENERATE QUIZ FROM PDF
// ======================================================

export async function generateQuizFromPDF(
    pdfText,
    previousQuestions = []
) {

    if (!pdfText || !pdfText.trim()) {

        throw new Error(
            "PDF text is required"
        );

    }


    console.log(
        "🧠 Generating quiz from uploaded PDF..."
    );


    // --------------------------------------------------
    // LIMIT PDF CONTEXT
    // --------------------------------------------------

    const MAX_PDF_CHARS = 30000;

    let limitedPDFText =
        pdfText;


    if (
        limitedPDFText.length >
        MAX_PDF_CHARS
    ) {

        limitedPDFText =
            limitedPDFText.substring(
                0,
                MAX_PDF_CHARS
            );

    }


    // --------------------------------------------------
    // PREVIOUS QUESTIONS
    // --------------------------------------------------

    let previousQuestionText =
        "None";


    if (
        Array.isArray(previousQuestions) &&
        previousQuestions.length > 0
    ) {

        previousQuestionText =
            previousQuestions
                .map(
                    (question, index) =>
                        `${index + 1}. ${question}`
                )
                .join("\n");

    }


    try {

        const completion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                messages: [

                    {

                        role:
                            "system",

                        content: `
You are EduCompanion AI Quiz Generator.

Generate exactly 10 MCQ questions based ONLY on the uploaded PDF.

Rules:

- Generate exactly 10 questions.
- Every question must have exactly 4 options.
- Only one option is correct.
- The answer must exactly match one option.
- Questions MUST be based on the PDF content.
- Do not use outside knowledge.
- Questions should test different parts of the PDF.
- Mix conceptual, factual and understanding-based questions.
- Do not generate duplicate questions.
- Questions must be different from the previous quiz questions.
- Do not simply change the wording of a previous question.
- Ask about different information from the PDF.
- Keep questions student-friendly.
- Do not include explanations.
- Return valid JSON according to the schema.
                        `.trim(),

                    },

                    {

                        role:
                            "user",

                        content:
                            `
UPLOADED PDF:

${limitedPDFText}

PREVIOUS QUIZ QUESTIONS:

${previousQuestionText}

Generate a NEW set of 10 questions.
Do not repeat or rephrase the previous questions.
                            `.trim(),

                    },

                ],

                response_format: {

                    type:
                        "json_schema",

                    json_schema: {

                        name:
                            "pdf_quiz",

                        strict:
                            true,

                        schema: {

                            type:
                                "object",

                            properties: {

                                quiz: {

                                    type:
                                        "array",

                                    minItems:
                                        10,

                                    maxItems:
                                        10,

                                    items: {

                                        type:
                                            "object",

                                        properties: {

                                            question: {

                                                type:
                                                    "string"

                                            },

                                            options: {

                                                type:
                                                    "array",

                                                minItems:
                                                    4,

                                                maxItems:
                                                    4,

                                                items: {

                                                    type:
                                                        "string"

                                                }

                                            },

                                            answer: {

                                                type:
                                                    "string"

                                            }

                                        },

                                        required: [

                                            "question",
                                            "options",
                                            "answer"

                                        ],

                                        additionalProperties:
                                            false

                                    }

                                }

                            },

                            required: [

                                "quiz"

                            ],

                            additionalProperties:
                                false

                        }

                    }

                },

                temperature:
                    0.7,

                max_completion_tokens:
                    4000,

                reasoning_effort:
                    "low",

            });


        const rawResponse =
            completion
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!rawResponse) {

            throw new Error(
                "AI returned empty PDF quiz"
            );

        }


        const parsed =
            JSON.parse(
                rawResponse
            );


        if (
            !parsed.quiz ||
            !Array.isArray(parsed.quiz)
        ) {

            throw new Error(
                "Invalid PDF quiz format"
            );

        }


        if (
            parsed.quiz.length !== 10
        ) {

            throw new Error(
                `Expected 10 questions but received ${parsed.quiz.length}`
            );

        }


        const quiz =
            parsed.quiz.map(
                (item, index) => {

                    if (
                        !item.question ||
                        !Array.isArray(item.options) ||
                        item.options.length !== 4 ||
                        !item.answer
                    ) {

                        throw new Error(
                            `Invalid question ${index + 1}`
                        );

                    }


                    const options =
                        item.options.map(
                            option =>
                                String(option).trim()
                        );


                    if (
                        new Set(options).size !== 4
                    ) {

                        throw new Error(
                            `Duplicate options in question ${index + 1}`
                        );

                    }


                    const answer =
                        String(
                            item.answer
                        ).trim();


                    if (
                        !options.includes(answer)
                    ) {

                        throw new Error(
                            `Answer does not match options in question ${index + 1}`
                        );

                    }


                    return {

                        question:
                            item.question.trim(),

                        options,

                        answer,

                    };

                }
            );


        console.log(
            "✅ PDF quiz generated successfully"
        );


        return quiz;

    }

    catch (error) {

        console.error(
            "❌ generateQuizFromPDF ERROR:",
            error
        );

        throw error;

    }

}