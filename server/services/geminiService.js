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
        `🧠 Question type: ${isVisualQuestion
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
// SUPPORTS TEXT + SCANNED/IMAGE PDF
// IMPROVED OCR + MATH + STRUCTURE
// ======================================================

export async function generateNotesFromPDF(
    pdfText = "",
    pageImages = []
) {

    // ==================================================
    // BASIC PDF TEXT CLEANUP
    // ==================================================

    const cleanText =
        String(pdfText || "")
            .replace(
                /--\s*\d+\s+of\s+\d+\s*--/gi,
                ""
            )
            .replace(
                /\r\n/g,
                "\n"
            )
            .replace(
                /\r/g,
                "\n"
            )
            .replace(
                /\n{3,}/g,
                "\n\n"
            )
            .trim();


    const hasReadableText =
        cleanText
            .replace(/\s+/g, "")
            .length >= 30;


    console.log(
        `📄 PDF notes - readable text: ${hasReadableText}`
    );

    console.log(
        `📝 PDF text characters: ${cleanText.length}`
    );

    console.log(
        `🖼️ PDF page images available: ${Array.isArray(pageImages)
            ? pageImages.length
            : 0
        }`
    );


    // ==================================================
    // COMMON NOTE-GENERATION INSTRUCTIONS
    // ==================================================

    const notesInstructions = `
You are EduCompanion AI, an expert educational study-notes generator.

Create professional, concise, exam-friendly study notes from the
provided PDF content.

Use ONLY the information present in the supplied source.

IMPORTANT RULES:

1. Do not invent facts, examples, formulas, applications, definitions,
   or explanations that are not supported by the source.

2. Preserve the original technical meaning.

3. Correct only obvious OCR/spacing errors when the intended meaning
   is completely clear from the surrounding context.

4. Do not merge technical words, variable names, or symbols together.

5. Preserve technical terminology accurately.

6. Remove unnecessary repetition.

7. Combine information belonging to the same topic even if it appears
   on different PDF pages.

8. Do not organize the final notes page-by-page.

9. Use clear Markdown headings and subheadings.

10. Use bullet points for important points.

11. Use numbered lists for ordered steps or procedures.

12. Use Markdown tables when the source contains comparisons,
    classifications, or structured information that is clearer as a
    table.

13. Keep tables concise and readable.

14. Include important examples when they help understand a concept.

15. Keep the notes concise, but do not remove important exam-relevant
    information.

16. Do not mention OCR, Vision AI, scanning, image processing,
    internal processing, prompts, or AI.

17. Do not mention that you are an AI.

18. Return ONLY the final study notes.

==================================================
MATHEMATICAL FORMATTING
==================================================

Mathematical expressions and formulas are extremely important.

Whenever the source contains:

- equations
- formulas
- inequalities
- mathematical expressions
- complexity notation
- summations
- square roots
- logarithms
- fractions
- subscripts
- superscripts
- Greek symbols
- mathematical relationships

preserve them accurately.

For DISPLAY formulas use:

$$
formula
$$

For INLINE mathematical expressions use:

$formula$

Do NOT use:

\\[
formula
\\]

or:

\\(
formula
\\)

Do NOT put mathematical formulas inside code blocks.

Preserve mathematical operators and symbols.

Examples:

$$
degree(x) \\leq \\lfloor \\log_{\\phi}(n) \\rfloor
$$

$$
BF(x) = height(left) - height(right)
$$

Inline example:

The search complexity is $O(\\log n)$.

Preserve symbols such as:

≤ ≥ < > ± √ ∑ ∞ π φ θ α β γ

when they are supported by the source.

Do not replace a mathematical formula with a vague verbal
description when the actual formula is available.

==================================================
TECHNICAL / CODE FORMATTING
==================================================

If the PDF contains code:

- Preserve code accurately.
- Keep variable names separated correctly.
- Preserve indentation where possible.
- Use fenced code blocks.
- Do not convert code into ordinary prose.

For example:

\`\`\`text
Node* next;
Node* prev;
\`\`\`

==================================================
OCR CLEANUP
==================================================

The source may contain OCR errors.

Fix obvious errors such as:

"nodex" → "node x"

"heapH" → "heap H"

"heightleft" → "height(left)"

only when the intended meaning is clear.

Do NOT guess unclear content.

If a word, formula, number, or symbol is genuinely unreadable,
preserve the uncertainty rather than inventing a replacement.

==================================================
RECOMMENDED STRUCTURE
==================================================

# PDF Study Notes

## Main Topics

## Important Concepts

## Definitions

## Detailed Explanation

## Important Points

## Formulas

## Examples

## Applications

## Exam Focus

## Quick Revision

## Summary

Use only the sections that are actually supported by the source.
Do not create empty sections.
`.trim();


    // ==================================================
    // TEXT PDF
    // ==================================================

    if (hasReadableText) {

        console.log(
            "📄 Using improved text-based PDF notes pipeline..."
        );


        const MAX_TEXT_CHARS = 50000;


        let limitedText =
            cleanText;


        // --------------------------------------------------
        // For very large PDFs, preserve beginning, middle and
        // ending instead of blindly taking only the beginning.
        // --------------------------------------------------

        if (
            cleanText.length >
            MAX_TEXT_CHARS
        ) {

            const chunkSize =
                Math.floor(
                    MAX_TEXT_CHARS / 3
                );


            const beginning =
                cleanText.slice(
                    0,
                    chunkSize
                );


            const middleStart =
                Math.floor(
                    (
                        cleanText.length -
                        chunkSize
                    ) / 2
                );


            const middle =
                cleanText.slice(
                    middleStart,
                    middleStart + chunkSize
                );


            const ending =
                cleanText.slice(
                    -chunkSize
                );


            limitedText = `
BEGINNING OF PDF:

${beginning}


MIDDLE OF PDF:

${middle}


END OF PDF:

${ending}
            `.trim();

        }


        try {

            console.log(
                "🤖 Generating structured notes from text PDF..."
            );


            const completion =
                await groq.chat.completions.create({

                    model:
                        "openai/gpt-oss-120b",

                    messages: [

                        {
                            role: "system",

                            content:
                                notesInstructions,

                        },

                        {

                            role: "user",

                            content:
                                `
Create complete but concise study notes from the following PDF content.

Preserve important technical details and mathematical notation.

PDF CONTENT:

${limitedText}
                                `.trim(),

                        },

                    ],

                    temperature:
                        0.25,

                    max_completion_tokens:
                        4500,

                    reasoning_effort:
                        "low",

                });


            const notes =
                completion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (!notes) {

                throw new Error(
                    "AI returned empty PDF notes."
                );

            }


            console.log(
                "✅ Text PDF notes generated successfully"
            );


            return notes.trim();

        }

        catch (error) {

            console.error(
                "❌ Text PDF notes generation error:",
                error
            );

            throw error;

        }

    }


    // ==================================================
    // SCANNED / IMAGE PDF
    // ==================================================

    console.log(
        "🖼️ No readable PDF text found."
    );

    console.log(
        "🔄 Switching to improved Vision AI pipeline..."
    );


    if (
        !Array.isArray(pageImages) ||
        pageImages.length === 0
    ) {

        throw new Error(
            "This PDF contains no readable text and its pages could not be converted to images."
        );

    }


    const pageResults = [];


    // ==================================================
    // VISION AI — PAGE-BY-PAGE EXTRACTION
    // ==================================================

    for (
        let index = 0;
        index < pageImages.length;
        index++
    ) {

        const imageBuffer =
            pageImages[index];


        if (
            !imageBuffer ||
            !Buffer.isBuffer(imageBuffer)
        ) {

            console.warn(
                `⚠️ Skipping invalid page ${index + 1}`
            );

            continue;

        }


        console.log(
            `🖼️ Reading scanned PDF page ${index + 1
            }/${pageImages.length}...`
        );


        const base64Image =
            imageBuffer.toString(
                "base64"
            );


        if (!base64Image) {

            console.warn(
                `⚠️ Empty image for page ${index + 1}`
            );

            continue;

        }


        try {

            const completion =
                await groq.chat.completions.create({

                    model:
                        "qwen/qwen3.6-27b",

                    messages: [

                        {

                            role: "system",

                            content: `
You are an expert document-reading assistant for EduCompanion.

You are reading ONE page of a scanned educational PDF.

Your task is to accurately extract the educational information
visible on this page so another AI can later create polished
study notes.

Read the page carefully.

EXTRACT:

- headings
- subheadings
- definitions
- concepts
- explanations
- important facts
- formulas
- mathematical expressions
- examples
- algorithms
- steps
- procedures
- comparisons
- tables
- diagram labels
- information conveyed by diagrams
- charts
- code
- important exam-related points

==================================================
OCR ACCURACY
==================================================

Pay special attention to:

- spaces between words
- spaces between technical terms and variables
- subscripts
- superscripts
- mathematical symbols
- parentheses
- brackets
- punctuation
- numbers
- variable names
- operators
- code syntax

For example:

"nodex" should be interpreted as "node x" only when the
surrounding context clearly supports that interpretation.

"heapH" should be interpreted as "heap H" only when clearly
supported by context.

Do not invent unreadable text.

==================================================
MATHEMATICS
==================================================

Preserve formulas accurately.

Use LaTeX notation.

For display formulas use:

$$
formula
$$

For inline formulas use:

$formula$

Examples:

$$
BF(x) = height(left) - height(right)
$$

$$
T(n) = O(\\log n)
$$

Do not put formulas inside code blocks.

Preserve symbols such as:

≤ ≥ < > ± √ ∑ ∞ π φ θ α β γ

when visible.

==================================================
CODE
==================================================

If code is visible, preserve it as code.

Do not rewrite code into prose.

==================================================
DIAGRAMS AND TABLES
==================================================

If a diagram is visible, explain the educational information
communicated by it.

If a table is visible, preserve its rows, columns and relationships
as accurately as possible.

==================================================
IMPORTANT
==================================================

Do not answer questions.

Do not create final study notes.

Do not invent missing information.

Return only the extracted educational content from this page.
                            `.trim(),

                        },

                        {

                            role: "user",

                            content: [

                                {

                                    type: "text",

                                    text:
                                        `
Extract the educational content from PDF page ${index + 1
                                            } accurately and completely.
                                        `.trim(),

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
                        0.1,

                    max_completion_tokens:
                        1800,

                });


            const pageContent =
                completion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (
                pageContent &&
                pageContent.trim()
            ) {

                pageResults.push(
                    `
PAGE ${index + 1}

${pageContent.trim()}
                    `.trim()
                );

            }


            console.log(
                `✅ Page ${index + 1} processed`
            );

        }

        catch (error) {

            console.error(
                `❌ Failed to process page ${index + 1
                }:`,
                error.message
            );

        }


        // --------------------------------------------------
        // Small delay between Vision requests
        // --------------------------------------------------

        if (
            index <
            pageImages.length - 1
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1200
                    )
            );

        }

    }


    // ==================================================
    // CHECK VISION RESULTS
    // ==================================================

    if (
        pageResults.length === 0
    ) {

        throw new Error(
            "Vision AI could not read any page of this PDF."
        );

    }


    const extractedContent =
        pageResults.join(
            "\n\n"
        );


    console.log(
        `📚 Vision extracted content: ${extractedContent.length
        } characters`
    );


    // ==================================================
    // LIMIT FINAL VISION CONTENT
    // ==================================================

    const MAX_EXTRACTED_CHARS = 40000;


    let limitedExtractedContent =
        extractedContent;


    // --------------------------------------------------
    // Preserve content from beginning, middle and end
    // instead of losing everything after 30k characters.
    // --------------------------------------------------

    if (
        extractedContent.length >
        MAX_EXTRACTED_CHARS
    ) {

        const chunkSize =
            Math.floor(
                MAX_EXTRACTED_CHARS / 3
            );


        const beginning =
            extractedContent.slice(
                0,
                chunkSize
            );


        const middleStart =
            Math.floor(
                (
                    extractedContent.length -
                    chunkSize
                ) / 2
            );


        const middle =
            extractedContent.slice(
                middleStart,
                middleStart + chunkSize
            );


        const ending =
            extractedContent.slice(
                -chunkSize
            );


        limitedExtractedContent = `
BEGINNING OF PDF:

${beginning}


MIDDLE OF PDF:

${middle}


END OF PDF:

${ending}
        `.trim();

    }


    // ==================================================
    // FINAL NOTES GENERATION
    // ==================================================

    console.log(
        "📝 Creating polished final notes from scanned PDF..."
    );


    try {

        const finalCompletion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

                messages: [

                    {

                        role: "system",

                        content:
                            notesInstructions,

                    },

                    {

                        role: "user",

                        content:
                            `
Create the final polished study notes from the extracted
educational content below.

IMPORTANT:

- Do not organize the final answer page-by-page.
- Merge related concepts from different pages.
- Remove duplicate information.
- Preserve formulas accurately.
- Preserve important definitions.
- Preserve examples.
- Preserve technical terminology.
- Correct only obvious OCR spacing errors when the meaning is clear.
- Use proper mathematical Markdown.
- Make the notes useful for exam preparation.

EXTRACTED PDF CONTENT:

${limitedExtractedContent}
                            `.trim(),

                    },

                ],

                temperature:
                    0.25,

                max_completion_tokens:
                    4500,

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
                "AI returned empty notes for scanned PDF."
            );

        }


        console.log(
            "✅ Scanned/image PDF notes generated successfully"
        );


        return finalNotes.trim();

    }

    catch (error) {

        console.error(
            "❌ Final scanned PDF notes generation error:",
            error
        );

        throw error;

    }

}

// ============================================================
// PDF QUIZ GENERATION - TEXT PDF
// ============================================================

export async function generateQuizFromPDF(
    pdfText,
    previousQuestions = []
) {
    if (!pdfText || pdfText.trim().length < 30) {
        throw new Error("PDF does not contain enough readable text.");
    }

    const cleanText = pdfText
        .replace(/\s+/g, " ")
        .trim();

    // Keep enough content for quiz generation.
    // We take content from throughout the PDF instead of only
    // blindly using the first characters.
    const MAX_CHARS = 30000;

    let sourceText = cleanText;

    if (cleanText.length > MAX_CHARS) {
        const chunkSize = Math.floor(MAX_CHARS / 3);

        const beginning = cleanText.slice(0, chunkSize);
        const middleStart = Math.floor(
            (cleanText.length - chunkSize) / 2
        );
        const middle = cleanText.slice(
            middleStart,
            middleStart + chunkSize
        );

        const ending = cleanText.slice(-chunkSize);

        sourceText = `
BEGINNING OF PDF:
${beginning}

MIDDLE OF PDF:
${middle}

END OF PDF:
${ending}
        `.trim();
    }

    const previous = Array.isArray(previousQuestions)
        ? previousQuestions
            .filter(Boolean)
            .map((q) => String(q).trim())
            .filter(Boolean)
        : [];

    const previousSection =
        previous.length > 0
            ? `
IMPORTANT:
The following questions were already generated.

Do NOT repeat them.
Do NOT create rephrased versions of them.
Generate genuinely different questions.

PREVIOUS QUESTIONS:
${previous.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`
            : "";

    const prompt = `
You are an expert educational quiz generator.

Create a quiz using ONLY the educational content present in the
provided PDF content.

Generate EXACTLY 10 multiple-choice questions.

Requirements:

1. Exactly 10 questions.
2. Each question must have exactly 4 options.
3. Exactly ONE option must be correct.
4. Questions must test understanding of the PDF content.
5. Do not ask about information that is not present in the PDF.
6. Avoid duplicate or nearly identical questions.
7. If previous questions are provided, do not repeat or rephrase them.
8. Use clear student-friendly language.
9. Mix definitions, concepts, applications, comparisons and reasoning
   where the PDF content allows.
10. Return ONLY valid JSON.

JSON format:

{
  "quiz": [
    {
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "answer": "Option 1"
    }
  ]
}

The "answer" field MUST exactly match one of the four options.

${previousSection}

PDF CONTENT:
${sourceText}
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a precise educational quiz generator. Return valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.5,
            max_tokens: 5000,
            response_format: {
                type: "json_object"
            }
        });

        const raw = completion?.choices?.[0]?.message?.content;

        if (!raw) {
            throw new Error("AI returned an empty quiz response.");
        }

        const parsed =
            typeof raw === "string"
                ? JSON.parse(raw)
                : raw;

        const generatedQuiz = parsed?.quiz;

        if (!Array.isArray(generatedQuiz)) {
            throw new Error("AI returned an invalid quiz structure.");
        }

        if (generatedQuiz.length !== 10) {
            throw new Error(
                `AI generated ${generatedQuiz.length} questions instead of 10.`
            );
        }

        const finalQuiz = generatedQuiz.map((item, index) => {
            if (!item || typeof item !== "object") {
                throw new Error(
                    `Invalid question structure at question ${index + 1}.`
                );
            }

            const question = String(
                item.question || ""
            ).trim();

            const options = Array.isArray(item.options)
                ? item.options
                    .map((option) => String(option).trim())
                    .filter(Boolean)
                : [];

            const answer = String(
                item.answer || ""
            ).trim();

            if (!question) {
                throw new Error(
                    `Question ${index + 1} is empty.`
                );
            }

            if (options.length !== 4) {
                throw new Error(
                    `Question ${index + 1} does not contain exactly 4 options.`
                );
            }

            const uniqueOptions = new Set(
                options.map((option) => option.toLowerCase())
            );

            if (uniqueOptions.size !== 4) {
                throw new Error(
                    `Question ${index + 1} contains duplicate options.`
                );
            }

            if (!options.includes(answer)) {
                throw new Error(
                    `Question ${index + 1} has an invalid correct answer.`
                );
            }

            return {
                question,
                options,
                answer
            };
        });

        // Final duplicate-question check
        const questionSet = new Set();

        for (const item of finalQuiz) {
            const normalized = item.question
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

            if (questionSet.has(normalized)) {
                throw new Error(
                    "AI generated duplicate questions."
                );
            }

            questionSet.add(normalized);
        }

        return finalQuiz;

    } catch (error) {
        console.error(
            "❌ PDF TEXT QUIZ GENERATION ERROR:",
            error
        );

        throw new Error(
            error.message ||
            "Failed to generate quiz from PDF."
        );
    }
}


// ============================================================
// PDF QUIZ GENERATION - SCANNED / IMAGE PDF
// ============================================================

export async function generateQuizFromPDFImages(
    imageBuffers,
    previousQuestions = []
) {
    if (
        !Array.isArray(imageBuffers) ||
        imageBuffers.length === 0
    ) {
        throw new Error(
            "No PDF page images were available for quiz generation."
        );
    }

    console.log(
        `🖼️ PDF Quiz Vision Mode: ${imageBuffers.length} page(s)`
    );

    /*
     * Processing a very large PDF page-by-page can create a huge
     * number of Vision requests.
     *
     * We therefore select pages distributed throughout the PDF.
     * This is much better than taking only the first few pages.
     */
    const MAX_VISION_PAGES = 15;

    let selectedImages = imageBuffers;

    if (imageBuffers.length > MAX_VISION_PAGES) {
        const selectedIndexes = [];
        const step =
            (imageBuffers.length - 1) /
            (MAX_VISION_PAGES - 1);

        for (
            let i = 0;
            i < MAX_VISION_PAGES;
            i++
        ) {
            const index = Math.round(i * step);

            if (!selectedIndexes.includes(index)) {
                selectedIndexes.push(index);
            }
        }

        selectedImages = selectedIndexes.map(
            (index) => imageBuffers[index]
        );

        console.log(
            `📚 Large PDF detected. Using ${selectedImages.length} distributed pages for quiz generation.`
        );
    }

    // --------------------------------------------------------
    // STEP 1: Vision AI extracts educational content
    // --------------------------------------------------------

    const visionPrompt = `
Read this PDF page carefully.

Extract the important educational content visible on this page.

Include:

- headings
- definitions
- concepts
- explanations
- important facts
- formulas
- examples
- comparisons
- processes
- steps
- tables
- diagram information
- labels
- code concepts if present

Do NOT invent information.

Do NOT answer a question.

Your job is only to accurately convert the visible educational
content into clear text that another AI can use to create quiz
questions.

If the page contains mostly images or diagrams, describe the
educational information conveyed by those diagrams.

Return concise but information-rich text.
`;

    // --------------------------------------------------------
    // STEP 1: Vision AI extracts educational content
    // --------------------------------------------------------

    let visionResult;

    try {
        visionResult = await analyzePDFImages(
            selectedImages,
            visionPrompt
        );
    } catch (error) {
        console.error(
            "❌ Vision PDF extraction failed:",
            error
        );

        throw new Error(
            "Vision AI could not read the scanned PDF pages."
        );
    }

    // --------------------------------------------------------
    // analyzePDFImages() in EduCompanion returns the
    // combined page analysis as a STRING.
    // Keep this code flexible in case the function
    // returns an array in the future.
    // --------------------------------------------------------

    let extractedContent = "";

    if (Array.isArray(visionResult)) {
        extractedContent = visionResult
            .filter(Boolean)
            .map((page) => String(page).trim())
            .filter((page) => page.length > 20)
            .join("\n\n");
    } else if (typeof visionResult === "string") {
        extractedContent = visionResult.trim();
    } else if (
        visionResult &&
        typeof visionResult === "object"
    ) {
        // Extra safety if the service ever returns an object
        extractedContent = String(
            visionResult.content ||
            visionResult.text ||
            visionResult.result ||
            ""
        ).trim();
    }

    if (!extractedContent) {
        throw new Error(
            "Vision AI could not extract quiz content from this PDF."
        );
    }

    if (extractedContent.length < 50) {
        throw new Error(
            "Vision AI could not extract enough educational content from this PDF."
        );
    }

    console.log(
        `📝 Vision extracted ${extractedContent.length} characters of content.`
    );

    if (extractedContent.length < 50) {
        throw new Error(
            "Vision AI could not extract enough educational content from this PDF."
        );
    }

    console.log(
        `📝 Vision extracted ${extractedContent.length} characters of content.`
    );

    // --------------------------------------------------------
    // STEP 2: GPT generates quiz from Vision output
    // --------------------------------------------------------

    const MAX_CONTENT_CHARS = 30000;

    let quizContent = extractedContent;

    if (quizContent.length > MAX_CONTENT_CHARS) {
        const chunkSize =
            Math.floor(MAX_CONTENT_CHARS / 3);

        const beginning =
            quizContent.slice(0, chunkSize);

        const middleStart =
            Math.floor(
                (quizContent.length - chunkSize) / 2
            );

        const middle =
            quizContent.slice(
                middleStart,
                middleStart + chunkSize
            );

        const ending =
            quizContent.slice(-chunkSize);

        quizContent = `
BEGINNING OF PDF:
${beginning}

MIDDLE OF PDF:
${middle}

END OF PDF:
${ending}
        `.trim();
    }

    const previous = Array.isArray(previousQuestions)
        ? previousQuestions
            .filter(Boolean)
            .map((q) => String(q).trim())
            .filter(Boolean)
        : [];

    const previousSection =
        previous.length > 0
            ? `
IMPORTANT:

These questions have already been generated.

Do NOT repeat them.
Do NOT create rephrased versions.
Create genuinely different questions.

PREVIOUS QUESTIONS:
${previous.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`
            : "";

    const quizPrompt = `
You are an expert educational quiz generator.

Generate a quiz ONLY from the educational content extracted from
a scanned/image-based PDF.

Generate EXACTLY 10 multiple-choice questions.

Requirements:

1. Exactly 10 questions.
2. Exactly 4 options per question.
3. Exactly ONE correct answer per question.
4. Every answer must be supported by the extracted PDF content.
5. Do not use outside knowledge.
6. Do not invent facts.
7. Do not repeat questions.
8. Do not create rephrased versions of previous questions.
9. Questions should cover different parts of the PDF where possible.
10. Mix definitions, concepts, understanding, applications,
    comparisons and reasoning when supported by the content.
11. Return ONLY valid JSON.

JSON format:

{
  "quiz": [
    {
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "answer": "Option 1"
    }
  ]
}

The "answer" field MUST exactly match one of the four options.

${previousSection}

EXTRACTED PDF CONTENT:
${quizContent}
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a precise educational quiz generator. Return valid JSON only."
                },
                {
                    role: "user",
                    content: quizPrompt
                }
            ],
            temperature: 0.6,
            max_tokens: 5000,
            response_format: {
                type: "json_object"
            }
        });

        const raw = completion?.choices?.[0]?.message?.content;

        if (!raw) {
            throw new Error(
                "AI returned an empty quiz response."
            );
        }

        const parsed =
            typeof raw === "string"
                ? JSON.parse(raw)
                : raw;

        const generatedQuiz = parsed?.quiz;

        if (!Array.isArray(generatedQuiz)) {
            throw new Error(
                "AI returned an invalid quiz structure."
            );
        }

        if (generatedQuiz.length !== 10) {
            throw new Error(
                `AI generated ${generatedQuiz.length} questions instead of 10.`
            );
        }

        const finalQuiz = generatedQuiz.map(
            (item, index) => {
                if (
                    !item ||
                    typeof item !== "object"
                ) {
                    throw new Error(
                        `Invalid question structure at question ${index + 1}.`
                    );
                }

                const question = String(
                    item.question || ""
                ).trim();

                const options = Array.isArray(
                    item.options
                )
                    ? item.options
                        .map((option) =>
                            String(option).trim()
                        )
                        .filter(Boolean)
                    : [];

                const answer = String(
                    item.answer || ""
                ).trim();

                if (!question) {
                    throw new Error(
                        `Question ${index + 1} is empty.`
                    );
                }

                if (options.length !== 4) {
                    throw new Error(
                        `Question ${index + 1} must have exactly 4 options.`
                    );
                }

                const uniqueOptions =
                    new Set(
                        options.map((option) =>
                            option.toLowerCase()
                        )
                    );

                if (uniqueOptions.size !== 4) {
                    throw new Error(
                        `Question ${index + 1} contains duplicate options.`
                    );
                }

                if (!options.includes(answer)) {
                    throw new Error(
                        `Question ${index + 1} has an invalid correct answer.`
                    );
                }

                return {
                    question,
                    options,
                    answer
                };
            }
        );

        // Check duplicate questions
        const questionSet = new Set();

        for (const item of finalQuiz) {
            const normalized =
                item.question
                    .toLowerCase()
                    .replace(/\s+/g, " ")
                    .trim();

            if (questionSet.has(normalized)) {
                throw new Error(
                    "AI generated duplicate questions."
                );
            }

            questionSet.add(normalized);
        }

        console.log(
            "✅ Scanned PDF quiz generated successfully."
        );

        return finalQuiz;

    } catch (error) {
        console.error(
            "❌ SCANNED PDF QUIZ GENERATION ERROR:",
            error
        );

        throw new Error(
            error.message ||
            "Failed to generate quiz from scanned PDF."
        );
    }
}