import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const cleanAIJsonResponse = (response) => {
    if (!response) {
        return "";
    }

    let cleaned = String(response).trim();

    // Remove Markdown code fences
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");

    return cleaned.trim();
};

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
                4096,

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
                "qwen/qwen3.8-27b",

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
                2500,

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
                    "qwen/qwen3.8-27b",

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
                    900,

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
                        "qwen/qwen3.8-27b",

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
                        1000,

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
                        "qwen/qwen3.8-27b",

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
                        950,

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
                    4096,

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
                    4096,

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
                    4096,

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
                        "qwen/qwen3.8-27b",

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
                        4096,

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
    previousQuestions = [],
    questionCount = 10
) {
    if (!pdfText || pdfText.trim().length < 30) {
        throw new Error("PDF does not contain enough readable text.");
    }

    // --------------------------------------------------------
    // Validate question count
    // --------------------------------------------------------

    const allowedQuestionCounts = [10, 20, 30, 50];

    questionCount = Number(questionCount) || 10;

    if (!allowedQuestionCounts.includes(questionCount)) {
        throw new Error(
            "Question count must be 10, 20, 30, or 50."
        );
    }

    console.log(
        `🧠 PDF Text Quiz: Generating exactly ${questionCount} questions`
    );

    // --------------------------------------------------------
    // Clean PDF text
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Previous questions
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // AI PROMPT
    // --------------------------------------------------------

    const prompt = `
You are an expert educational quiz generator.

Create a quiz using ONLY the educational content present in the
provided PDF content.

Generate EXACTLY ${questionCount} multiple-choice questions.

Requirements:

1. Generate EXACTLY ${questionCount} questions.
2. Each question must have exactly 4 options.
3. Exactly ONE option must be correct.
4. Questions must test understanding of the PDF content.
5. Do not ask about information that is not present in the PDF.
6. Avoid duplicate or nearly identical questions.
7. If previous questions are provided, do not repeat or rephrase them.
8. Use clear student-friendly language.
9. Mix definitions, concepts, applications, comparisons and reasoning
   where the PDF content allows.
10. Try to cover different parts of the PDF content.
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

PDF CONTENT:
${sourceText}
`;

    try {
        // ----------------------------------------------------
        // GROQ AI
        // ----------------------------------------------------

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

            // More questions require more output tokens.
            max_tokens:
                Math.min(
                    20000,
                    Math.max(
                        5000,
                        questionCount * 500
                    )
                ),

            response_format: {
                type: "json_object"
            }
        });

        const raw =
            completion?.choices?.[0]?.message?.content;

        if (!raw) {
            throw new Error(
                "AI returned an empty quiz response."
            );
        }

        // ----------------------------------------------------
        // PARSE JSON
        // ----------------------------------------------------

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

        // ----------------------------------------------------
        // EXACT QUESTION COUNT VALIDATION
        // ----------------------------------------------------

        if (generatedQuiz.length !== questionCount) {
            throw new Error(
                `AI generated ${generatedQuiz.length} questions instead of ${questionCount}. Please try generating the quiz again.`
            );
        }

        // ----------------------------------------------------
        // VALIDATE EVERY QUESTION
        // ----------------------------------------------------

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

                const options =
                    Array.isArray(item.options)
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
                        `Question ${index + 1} does not contain exactly 4 options.`
                    );
                }

                // ------------------------------------------------
                // Duplicate options
                // ------------------------------------------------

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

                // ------------------------------------------------
                // Correct answer must match an option
                // ------------------------------------------------

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

        // --------------------------------------------------------
        // FINAL DUPLICATE QUESTION CHECK
        // --------------------------------------------------------

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
            `✅ PDF Text Quiz generated successfully: ${finalQuiz.length}/${questionCount}`
        );

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
    previousQuestions = [],
    questionCount = 10
) {
    if (
        !Array.isArray(imageBuffers) ||
        imageBuffers.length === 0
    ) {
        throw new Error(
            "No PDF page images were available for quiz generation."
        );
    }

    // --------------------------------------------------------
    // Validate question count
    // --------------------------------------------------------

    const allowedQuestionCounts = [10, 20, 30, 50];

    questionCount = Number(questionCount) || 10;

    if (!allowedQuestionCounts.includes(questionCount)) {
        throw new Error(
            "Question count must be 10, 20, 30, or 50."
        );
    }

    console.log(
        `🖼️ PDF Quiz Vision Mode: ${imageBuffers.length} page(s)`
    );

    console.log(
        `🧠 Vision Quiz: Generating exactly ${questionCount} questions`
    );

    // --------------------------------------------------------
    // Select distributed pages
    // --------------------------------------------------------

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

        selectedImages =
            selectedIndexes.map(
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

    let visionResult;

    try {

        visionResult =
            await analyzePDFImages(
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
    // Convert Vision result to text
    // --------------------------------------------------------

    let extractedContent = "";

    if (Array.isArray(visionResult)) {

        extractedContent =
            visionResult
                .filter(Boolean)
                .map((page) =>
                    String(page).trim()
                )
                .filter(
                    (page) =>
                        page.length > 20
                )
                .join("\n\n");

    } else if (
        typeof visionResult === "string"
    ) {

        extractedContent =
            visionResult.trim();

    } else if (
        visionResult &&
        typeof visionResult === "object"
    ) {

        extractedContent =
            String(
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

    // --------------------------------------------------------
    // STEP 2: Limit content size
    // --------------------------------------------------------

    const MAX_CONTENT_CHARS = 30000;

    let quizContent = extractedContent;

    if (
        quizContent.length >
        MAX_CONTENT_CHARS
    ) {

        const chunkSize =
            Math.floor(
                MAX_CONTENT_CHARS / 3
            );

        const beginning =
            quizContent.slice(
                0,
                chunkSize
            );

        const middleStart =
            Math.floor(
                (quizContent.length -
                    chunkSize) /
                2
            );

        const middle =
            quizContent.slice(
                middleStart,
                middleStart + chunkSize
            );

        const ending =
            quizContent.slice(
                -chunkSize
            );

        quizContent = `
BEGINNING OF PDF:
${beginning}

MIDDLE OF PDF:
${middle}

END OF PDF:
${ending}
        `.trim();
    }

    // --------------------------------------------------------
    // Previous questions
    // --------------------------------------------------------

    const previous =
        Array.isArray(previousQuestions)
            ? previousQuestions
                .filter(Boolean)
                .map((q) =>
                    String(q).trim()
                )
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
${previous
                .map(
                    (q, i) =>
                        `${i + 1}. ${q}`
                )
                .join("\n")}
`
            : "";

    // --------------------------------------------------------
    // QUIZ PROMPT
    // --------------------------------------------------------

    const quizPrompt = `
You are an expert educational quiz generator.

Generate a quiz ONLY from the educational content extracted from
a scanned/image-based PDF.

Generate EXACTLY ${questionCount} multiple-choice questions.

Requirements:

1. Generate EXACTLY ${questionCount} questions.
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

        // ----------------------------------------------------
        // GROQ AI
        // ----------------------------------------------------

        const completion =
            await groq.chat.completions.create({

                model:
                    "openai/gpt-oss-120b",

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

                // Increase token budget for larger quizzes.
                max_tokens:
                    Math.min(
                        20000,
                        Math.max(
                            5000,
                            questionCount * 500
                        )
                    ),

                response_format: {
                    type: "json_object"
                }
            });

        const raw =
            completion?.choices?.[0]?.message?.content;

        if (!raw) {
            throw new Error(
                "AI returned an empty quiz response."
            );
        }

        // ----------------------------------------------------
        // Parse JSON
        // ----------------------------------------------------

        const parsed =
            typeof raw === "string"
                ? JSON.parse(raw)
                : raw;

        const generatedQuiz =
            parsed?.quiz;

        if (
            !Array.isArray(
                generatedQuiz
            )
        ) {
            throw new Error(
                "AI returned an invalid quiz structure."
            );
        }

        // ----------------------------------------------------
        // EXACT QUESTION COUNT VALIDATION
        // ----------------------------------------------------

        if (
            generatedQuiz.length !==
            questionCount
        ) {
            throw new Error(
                `AI generated ${generatedQuiz.length} questions instead of ${questionCount}. Please try generating the quiz again.`
            );
        }

        // ----------------------------------------------------
        // Validate every question
        // ----------------------------------------------------

        const finalQuiz =
            generatedQuiz.map(
                (item, index) => {

                    if (
                        !item ||
                        typeof item !== "object"
                    ) {
                        throw new Error(
                            `Invalid question structure at question ${index + 1}.`
                        );
                    }

                    const question =
                        String(
                            item.question ||
                            ""
                        ).trim();

                    const options =
                        Array.isArray(
                            item.options
                        )
                            ? item.options
                                .map(
                                    (option) =>
                                        String(
                                            option
                                        ).trim()
                                )
                                .filter(
                                    Boolean
                                )
                            : [];

                    const answer =
                        String(
                            item.answer ||
                            ""
                        ).trim();

                    if (!question) {
                        throw new Error(
                            `Question ${index + 1} is empty.`
                        );
                    }

                    if (
                        options.length !== 4
                    ) {
                        throw new Error(
                            `Question ${index + 1} must have exactly 4 options.`
                        );
                    }

                    // ----------------------------------------
                    // Duplicate options
                    // ----------------------------------------

                    const uniqueOptions =
                        new Set(
                            options.map(
                                (option) =>
                                    option.toLowerCase()
                            )
                        );

                    if (
                        uniqueOptions.size !==
                        4
                    ) {
                        throw new Error(
                            `Question ${index + 1} contains duplicate options.`
                        );
                    }

                    // ----------------------------------------
                    // Correct answer validation
                    // ----------------------------------------

                    if (
                        !options.includes(
                            answer
                        )
                    ) {
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

        // --------------------------------------------------------
        // Duplicate question check
        // --------------------------------------------------------

        const questionSet =
            new Set();

        for (
            const item of finalQuiz
        ) {

            const normalized =
                item.question
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            if (
                questionSet.has(
                    normalized
                )
            ) {
                throw new Error(
                    "AI generated duplicate questions."
                );
            }

            questionSet.add(
                normalized
            );
        }

        console.log(
            `✅ Scanned PDF quiz generated successfully: ${finalQuiz.length}/${questionCount}`
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

// ======================================================
// ANALYZE STUDENT RESULT
// ======================================================

export async function analyzeStudentResult(
    resultText = "",
    resultImage = null,
    mimeType = ""
) {

    const cleanText = String(resultText || "").trim();

    // ======================================================
    // VALIDATION
    // ======================================================

    if (!cleanText && !resultImage) {
        throw new Error("No result data provided for analysis.");
    }

    // ======================================================
    // COMMON SYSTEM PROMPT
    // ======================================================

    const systemPrompt = `
You are EduCompanion, an academic result analysis assistant.

Your job is to carefully analyze a student's academic result
document and extract ONLY information that is actually present
in the document.

Return ONLY valid JSON.
Do not return Markdown.
Do not add explanations outside the JSON.

IMPORTANT EXTRACTION RULES:

1. Extract the student's name if clearly available.

2. Extract every subject for which marks can be reliably identified.

3. For every subject return:
   - subject
   - semester
   - marks
   - maxMarks
   - percentage

4. If the semester is clearly visible for a subject, include it.

5. If the semester cannot be determined reliably, use null.

6. NEVER invent semester numbers.

7. NEVER invent marks.

8. NEVER treat:
   - roll numbers
   - registration numbers
   - subject codes
   - semester numbers
   - credit values
   - grade points
   as marks.

9. Lab, practical, workshop, project and theory subjects
   should be treated as separate subjects when they are listed
   separately in the result.

10. If the same subject appears in multiple semesters,
    KEEP EACH RECORD if the document indicates they are separate
    attempts/semesters.

11. Do NOT remove duplicate subject names automatically.
    A duplicate can represent the same subject in different
    semesters or different result sections.

12. If the same subject appears twice and there is NO reliable
    evidence that they are separate records, keep the records
    separately rather than guessing.

13. If marks are missing or unclear, use null.

14. Calculate percentage only when obtained marks and maximum
    marks are both clearly available.

15. Do NOT convert CGPA into percentage unless the document
    explicitly provides that conversion.

16. Keep CGPA separate from overall percentage.

17. If the document contains an overall percentage, use that
    value when clearly identifiable.

18. If an overall percentage is not explicitly provided,
    calculate it from reliable marks only when the denominator
    is known.

19. Do not include subjects where marks cannot be identified
    at all.

20. Ignore unrelated information.

======================================================
SUBJECT CLASSIFICATION
======================================================

Classify each subject using its percentage:

Strong:
75% or above

Improvement:
50% to 74.99%

Weak:
Below 50%

If percentage is null, do not put that subject into any
classification.

Use the EXACT subject name from the subjects array when
creating strongSubjects, improvementSubjects and weakSubjects.

======================================================
OVERALL PERFORMANCE
======================================================

Calculate overallPercentage using:

total obtained marks
-------------------- × 100
total maximum marks

ONLY when reliable marks and maximum marks are available.

Do not include subjects with null marks in this calculation.

If the document itself provides a reliable overall percentage,
prefer the document's value.

======================================================
SGPA AND CGPA
======================================================

If SGPA is present in the document, extract it separately.

If CGPA is present in the document, extract it separately.

IMPORTANT:
- SGPA and CGPA are different values.
- NEVER treat SGPA as CGPA.
- NEVER calculate CGPA from a single semester result.
- NEVER calculate SGPA unless the document explicitly provides
  enough information to calculate it reliably.
- If SGPA is not present, use null.
- If CGPA is not present, use null.

======================================================
SUMMARY
======================================================

Provide a short factual summary.

Mention:
- student name if available
- overall percentage if available
- CGPA if available
- general performance pattern
- important strong/improvement/weak areas

Do not make personal judgments about the student.

======================================================
JSON FORMAT
======================================================

Return exactly this structure:

{
  "studentName": null,
  "semester": null,
  "sgpa": null,
  "cgpa": null,
  "overallPercentage": null,

  "subjects": [
    {
      "subject": "",
      "semester": null,
      "marks": null,
      "maxMarks": null,
      "percentage": null
    }
  ],

  "strongSubjects": [],
  "improvementSubjects": [],
  "weakSubjects": [],

  "summary": ""
}

Return ONLY JSON.
`.trim();



    const visionPrompt = `
Extract academic result data from this image.

Return ONLY valid JSON.

{
  "studentName": null,
  "semester": null,
  "sgpa": null,
  "cgpa": null,
  "subjects": [
    {
      "subject": "",
      "marks": null,
      "maxMarks": null
    }
  ]
}

Rules:

- Extract only information that is clearly visible.
- Do not guess any information.
- Extract the student name if clearly visible.
- Extract the semester if clearly visible.
- Extract SGPA if clearly visible.
- Extract CGPA only if clearly visible.
- NEVER treat SGPA as CGPA.
- NEVER calculate CGPA.
- Extract every subject with identifiable marks.
- Extract maximum marks if clearly visible.
- If maximum marks are not clearly visible, use null.
- Keep duplicate subjects if present.
- Do not calculate percentage.
- Do not include classifications.
- No explanation.
- No Markdown.
- Return complete valid JSON.
`.trim();

    // ======================================================
    // IMAGE / VISION RESULT
    // ======================================================

    if (resultImage) {

        if (!Buffer.isBuffer(resultImage)) {
            throw new Error("Invalid result image buffer.");
        }

        const base64Image =
            resultImage.toString("base64");

        console.log("🖼️ Sending result image to AI vision model...");

        const completion =
            await groq.chat.completions.create({
                model: "qwen/qwen3.8-27b",

                messages: [
                    {
                        role: "system",
                        content: visionPrompt
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extract the academic result information from this image."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url:
                                        `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],

                temperature: 0.1,

                max_completion_tokens: 800
            });

        const rawResponse =
            completion?.choices?.[0]?.message?.content?.trim();

        if (!rawResponse) {
            throw new Error(
                "AI returned an empty result analysis."
            );
        }

        console.log("🤖 RAW AI RESPONSE:");
        console.log(rawResponse);

        const cleanedResponse =
            cleanAIJsonResponse(rawResponse);

        let extractedResult;

        try {
            extractedResult = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error(
                "❌ Failed to parse vision result:",
                parseError.message
            );

            console.error(
                "🤖 RAW VISION RESPONSE:",
                rawResponse
            );

            throw new Error(
                "AI returned an invalid result format."
            );
        }


        /* ===============================
           EXTRACT SUBJECTS
        ================================ */

        const subjects =
            Array.isArray(extractedResult.subjects)
                ? extractedResult.subjects
                : [];


        /* ===============================
           PROCESS SUBJECTS
        ================================ */

        const processedSubjects = subjects.map((item) => {

            const marks =
                typeof item.marks === "number"
                    ? item.marks
                    : Number(item.marks);

            let maxMarks =
                typeof item.maxMarks === "number"
                    ? item.maxMarks
                    : Number(item.maxMarks);

            /*
             * This semester result uses marks out of 100.
             * If AI cannot extract maxMarks, use 100.
             */

            if (
                !Number.isFinite(maxMarks) ||
                maxMarks <= 0
            ) {
                maxMarks = 100;
            }

            let percentage = null;

            if (
                Number.isFinite(marks) &&
                Number.isFinite(maxMarks) &&
                maxMarks > 0
            ) {
                percentage =
                    Number(
                        ((marks / maxMarks) * 100).toFixed(2)
                    );
            }

            return {
                subject: item.subject || "",

                semester:
                    extractedResult.semester !== null &&
                        extractedResult.semester !== undefined
                        ? extractedResult.semester
                        : null,

                marks:
                    Number.isFinite(marks)
                        ? marks
                        : null,

                maxMarks,

                percentage
            };
        });


        /* ===============================
           STRONG / IMPROVEMENT / WEAK
        ================================ */

        const strongSubjects = [];
        const improvementSubjects = [];
        const weakSubjects = [];


        processedSubjects.forEach((item) => {

            if (item.percentage === null) {
                return;
            }


            if (item.percentage >= 75) {

                strongSubjects.push(item.subject);

            } else if (item.percentage >= 50) {

                improvementSubjects.push(item.subject);

            } else {

                weakSubjects.push(item.subject);
            }
        });


        /* ===============================
           OVERALL PERCENTAGE
        ================================ */

        const reliableSubjects =
            processedSubjects.filter(
                (item) =>
                    item.marks !== null &&
                    item.maxMarks !== null &&
                    item.maxMarks > 0
            );


        let overallPercentage = null;


        if (reliableSubjects.length > 0) {

            const totalMarks =
                reliableSubjects.reduce(
                    (total, item) =>
                        total + item.marks,
                    0
                );


            const totalMaxMarks =
                reliableSubjects.reduce(
                    (total, item) =>
                        total + item.maxMarks,
                    0
                );


            if (totalMaxMarks > 0) {

                overallPercentage =
                    Number(
                        (
                            (totalMarks / totalMaxMarks) * 100
                        ).toFixed(2)
                    );
            }
        }


        /* ===============================
           AI SUMMARY
        ================================ */

        let summary = "No summary available.";


        if (overallPercentage !== null) {

            summary =
                `${extractedResult.studentName || "The student"} `
                + `has an overall percentage of ${overallPercentage}%. `
                + `${strongSubjects.length} subject(s) are in the strong category, `
                + `${improvementSubjects.length} subject(s) need improvement, `
                + `and ${weakSubjects.length} subject(s) are in the weak category.`;
        }


        /* ===============================
           LOGS
        ================================ */

        console.log(
            "📊 Processed Subjects:",
            processedSubjects.length
        );

        console.log(
            "📈 Overall Percentage:",
            overallPercentage
        );

        console.log(
            "💪 Strong Subjects:",
            strongSubjects.length
        );

        console.log(
            "📚 Improvement Subjects:",
            improvementSubjects.length
        );

        console.log(
            "⚠️ Weak Subjects:",
            weakSubjects.length
        );

        console.log(
            "📊 Semester:",
            extractedResult.semester
        );

        console.log(
            "📈 SGPA:",
            extractedResult.sgpa
        );

        console.log(
            "📚 CGPA:",
            extractedResult.cgpa
        );

        console.log(
            "✅ Result image analysis completed."
        );


        /* ===============================
           FINAL RESULT
        ================================ */

        return {
            studentName:
                extractedResult.studentName || null,

            semester:
                extractedResult.semester !== null &&
                    extractedResult.semester !== undefined
                    ? extractedResult.semester
                    : null,

            sgpa:
                extractedResult.sgpa !== null &&
                    extractedResult.sgpa !== undefined
                    ? extractedResult.sgpa
                    : null,

            cgpa:
                extractedResult.cgpa !== null &&
                    extractedResult.cgpa !== undefined
                    ? extractedResult.cgpa
                    : null,

            overallPercentage,

            subjects: processedSubjects,

            strongSubjects,

            improvementSubjects,

            weakSubjects,

            summary
        };
    }

    // ======================================================
    // TEXT RESULT
    // ======================================================

    console.log(
        "📄 Sending extracted result text to AI..."
    );

    const completion =
        await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content:
                        `Analyze the following academic result document carefully.

RESULT DOCUMENT:

${cleanText}`
                }
            ],

            temperature: 0.1,

            max_completion_tokens: 4000,

            reasoning_effort: "low"
        });

    const rawResponse =
        completion?.choices?.[0]?.message?.content?.trim();

    if (!rawResponse) {
        throw new Error(
            "AI returned an empty result analysis."
        );
    }

    console.log("🤖 RAW AI RESPONSE:");
    console.log(rawResponse);

    const cleanedResponse =
        cleanAIJsonResponse(rawResponse);
    console.log("✅ Result text analysis completed.");

    return cleanedResponse;
}

function normalizeMathText(text) {
    if (!text || typeof text !== "string") {
        return text;
    }

    let result = text;

    // ======================================================
    // 1. Safe [MATH] ... [/MATH] format
    // ======================================================

    result = result.replace(
        /\[MATH\]([\s\S]*?)\[\/MATH\]/g,
        (match, content) => {
            return `\\(${convertMathExpression(content.trim())}\\)`;
        }
    );

    // ======================================================
    // 2. Convert LaTeX expressions already returned by AI
    //
    // Example:
    // (\frac{dy}{dx} - 4y = 3e^{2x})
    // ======================================================

    result = result.replace(
        /\((?=[^()\n]*(?:\\frac|\\int|\\sqrt|\\sum|\\begin|\\end|\\sin|\\cos|\\tan|\\ln|\\lambda|\\pi|\\partial|\\infty))([^()\n]*(?:\([^()\n]*\)[^()\n]*)*)\)/g,
        (match, content) => {
            return `\\(${repairLatex(content.trim())}\\)`;
        }
    );

    // ======================================================
    // 3. Convert simple math expressions in parentheses
    //
    // Example:
    // (x^4)
    // (f(x)=ln(1+2x))
    // ======================================================

    result = result.replace(
        /\(([^()\n]*(?:\^|=|\/|dx|dy|dt|d\^2|_[0-9]+)[^()\n]*)\)/g,
        (match, content) => {
            return `\\(${convertBasicMath(content.trim())}\\)`;
        }
    );

    return result;
}


// ==========================================================
// Repair LaTeX returned by AI
// ==========================================================

function repairLatex(expression) {
    let value = expression.trim();

    // ------------------------------------------------------
    // Repair common matrix row separator problem
    // AI sometimes returns:
    //
    // 2 & -1 & 0 \ 4 & 3 & -2 \ 1 & 5 & 1
    //
    // Convert it to:
    //
    // 2 & -1 & 0 \\ 4 & 3 & -2 \\ 1 & 5 & 1
    // ------------------------------------------------------

    if (
        value.includes("\\begin{pmatrix}") &&
        value.includes("\\end{pmatrix}")
    ) {
        value = value.replace(
            /\\(?!\\)/g,
            "\\\\"
        );
    }

    // ------------------------------------------------------
    // Normal mathematical names
    // ------------------------------------------------------

    value = value
        .replace(/\bln\b/g, "\\ln")
        .replace(/\bsin\b/g, "\\sin")
        .replace(/\bcos\b/g, "\\cos")
        .replace(/\btan\b/g, "\\tan")
        .replace(/\bpi\b/g, "\\pi")
        .replace(/\binfty\b/g, "\\infty");

    return value;
}


// ==========================================================
// Convert safe AI notation
// ==========================================================

function convertMathExpression(expression) {
    let math = expression.trim();

    // ------------------------------------------------------
    // INT(...)
    // ------------------------------------------------------

    if (/^INT\s*\(/i.test(math)) {
        const match = math.match(/^INT\s*\(([\s\S]*)\)$/i);

        if (match) {
            const parts = splitMathArguments(match[1]);

            if (parts.length >= 4) {
                return `\\int_{${convertBasicMath(parts[0])}}^{${convertBasicMath(parts[1])}} ${convertBasicMath(parts[2])}\\,${convertBasicMath(parts[3])}`;
            }
        }
    }

    // ------------------------------------------------------
    // DINT(...)
    // ------------------------------------------------------

    if (/^DINT\s*\(/i.test(math)) {
        const match = math.match(/^DINT\s*\(([\s\S]*)\)$/i);

        if (match) {
            const parts = splitMathArguments(match[1]);

            if (parts.length >= 7) {
                return `\\int_{${parts[0]}}^{${parts[1]}} \\int_{${parts[2]}}^{${parts[3]}} ${convertBasicMath(parts[4])}\\,${parts[5]}\\,${parts[6]}`;
            }
        }
    }

    // ------------------------------------------------------
    // INT_C(...)
    // ------------------------------------------------------

    if (/^INT_C\s*\(/i.test(math)) {
        const match = math.match(/^INT_C\s*\(([\s\S]*)\)$/i);

        if (match) {
            return `\\int_C ${convertBasicMath(match[1])}`;
        }
    }

    // ------------------------------------------------------
    // FRAC(...)
    // ------------------------------------------------------

    if (/^FRAC\s*\(/i.test(math)) {
        const match = math.match(/^FRAC\s*\(([\s\S]*)\)$/i);

        if (match) {
            const parts = splitMathArguments(match[1]);

            if (parts.length >= 2) {
                return `\\frac{${convertBasicMath(parts[0])}}{${convertBasicMath(parts[1])}}`;
            }
        }
    }

    // ------------------------------------------------------
    // SQRT(...)
    // ------------------------------------------------------

    if (/^SQRT\s*\(/i.test(math)) {
        const match = math.match(/^SQRT\s*\(([\s\S]*)\)$/i);

        if (match) {
            return `\\sqrt{${convertBasicMath(match[1])}}`;
        }
    }

    // ------------------------------------------------------
    // SUM(...)
    // ------------------------------------------------------

    if (/^SUM\s*\(/i.test(math)) {
        const match = math.match(/^SUM\s*\(([\s\S]*)\)$/i);

        if (match) {
            const parts = splitMathArguments(match[1]);

            if (parts.length >= 3) {
                return `\\sum_{${parts[0]}}^{${parts[1]}} ${convertBasicMath(parts[2])}`;
            }
        }
    }

    // ------------------------------------------------------
    // MATRIX(...)
    // ------------------------------------------------------

    if (/^MATRIX\s*\(/i.test(math)) {
        const match = math.match(
            /^MATRIX\s*\(\s*\[\[(.*?)\]\]\s*\)$/i
        );

        if (match) {
            const rows = match[1].split(/\]\s*,\s*\[/);

            const latexRows = rows.map((row) =>
                row
                    .replace(/^\[/, "")
                    .replace(/\]$/, "")
                    .split(",")
                    .map((value) => convertBasicMath(value.trim()))
                    .join(" & ")
            );

            return `\\begin{pmatrix}${latexRows.join(" \\\\ ")}\\end{pmatrix}`;
        }
    }

    // ------------------------------------------------------
    // DERIVATIVE(...)
    // ------------------------------------------------------

    if (/^DERIVATIVE\s*\(/i.test(math)) {
        const match = math.match(
            /^DERIVATIVE\s*\(([\s\S]*)\)$/i
        );

        if (match) {
            return `\\frac{d${match[1]}}{dx}`;
        }
    }

    // ------------------------------------------------------
    // SECOND_DERIVATIVE(...)
    // ------------------------------------------------------

    if (/^SECOND_DERIVATIVE\s*\(/i.test(math)) {
        const match = math.match(
            /^SECOND_DERIVATIVE\s*\(([\s\S]*)\)$/i
        );

        if (match) {
            return `\\frac{d^2${match[1]}}{dx^2}`;
        }
    }

    return convertBasicMath(math);
}


// ==========================================================
// Split arguments safely
// ==========================================================

function splitMathArguments(content) {
    const parts = [];
    let current = "";
    let depth = 0;

    for (const char of content) {
        if (
            char === "(" ||
            char === "[" ||
            char === "{"
        ) {
            depth++;
        }

        if (
            char === ")" ||
            char === "]" ||
            char === "}"
        ) {
            depth--;
        }

        if (char === "," && depth === 0) {
            parts.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    if (current.trim()) {
        parts.push(current.trim());
    }

    return parts;
}


// ==========================================================
// Basic math conversion
// ==========================================================

function convertBasicMath(expression) {
    return String(expression || "")
        .trim()
        .replace(/\bpi\b/g, "\\pi")
        .replace(/\binfty\b/g, "\\infty")
        .replace(/\bln\b/g, "\\ln")
        .replace(/\bsin\b/g, "\\sin")
        .replace(/\bcos\b/g, "\\cos")
        .replace(/\btan\b/g, "\\tan")
        .replace(/\blog\b/g, "\\log");
}

function forceMathMarkers(text) {
    if (!text || typeof text !== "string") {
        return text;
    }

    let result = text;

    // ------------------------------------------------------
    // Convert existing LaTeX delimiters
    // \( ... \) -> [MATH] ... [/MATH]
    // ------------------------------------------------------

    result = result.replace(
        /\\\(([\s\S]*?)\\\)/g,
        "[MATH]$1[/MATH]"
    );

    // ------------------------------------------------------
    // Convert LaTeX display delimiters
    // \[ ... \] -> [MATH] ... [/MATH]
    // ------------------------------------------------------

    result = result.replace(
        /\\\[([\s\S]*?)\\\]/g,
        "[MATH]$1[/MATH]"
    );

    return result;
}

// ======================================================
// ASSISTANCE TO WEAK SUBJECTS
// ======================================================
export async function generateWeakSubjectAssistance(
    subject,
    previousQuestions = []
) {

    if (!subject || !subject.trim()) {
        throw new Error("Subject is required.");
    }

    const systemPrompt = `
You are EduCompanion, an academic learning assistant.

The student has identified a weak academic subject.

Your task is to generate a NEW and VARIED set of practice questions
for that subject.

Return ONLY valid JSON.
Do not return Markdown.
Do not return explanations outside JSON.

======================================================
IMPORTANT RULES
======================================================

1. Use the exact subject provided by the student.

2. Generate questions that are academically relevant to the subject.

3. Every generation should try to produce DIFFERENT questions.

4. Avoid repeating common questions from previous generations.

5. Do NOT generate multiple questions that test exactly the same
   concept using only slightly different wording.

6. Cover DIFFERENT important concepts, topics, formulas, applications,
   or problem-solving approaches whenever possible.

7. Prefer variety across the question set.

8. Mix conceptual and application-based questions when appropriate.

9. Questions should be suitable for a college student.

10. Do not invent a specific university syllabus.

11. Do not assume a specific university examination pattern.

12. Theory questions should test conceptual understanding.

13. Numerical/problem-solving questions should be included only when
    numerical/problem-solving questions are meaningful for the subject.

14. Numerical questions should use different values, situations,
    formulas, or approaches instead of repeating the same problem.

15. Theory questions should not repeatedly ask the same definition
    or concept in slightly different wording.

16. If a concept is especially important, occasional repetition is
    acceptable, but prioritize variety.

17. DO NOT provide solutions yet.

18. Keep questions clear, useful, and practical for exam preparation.

19. When previous questions are provided by the user request,
do not repeat or closely rephrase those questions.

20. Treat the previous question list as already-used questions.

21. Generate genuinely new questions rather than changing only
numbers, names, or wording of an existing question.

======================================================
MATHEMATICAL FORMATTING
======================================================

22. IMPORTANT: Mathematical expressions MUST use the exact
    [MATH]...[/MATH] format.

23. NEVER use normal LaTeX delimiters such as:
    \( ... \)
    \[ ... \]
    $$ ... $$
    or parentheses around mathematical expressions.

24. NEVER write LaTeX commands directly outside [MATH] markers.

25. Inside [MATH]...[/MATH], use ONLY the following safe notation.

    Derivative:
    [MATH]dy/dx[/MATH]

    Second derivative:
    [MATH]d^2y/dx^2[/MATH]

    Integral:
    [MATH]INT(0,1,x^2,dx)[/MATH]

    Line integral:
    [MATH]INT_C(y dx + x dy)[/MATH]

    Double integral:
    [MATH]DINT(0,1,0,2,x^2*y,dx,dy)[/MATH]

    Fraction:
    [MATH]FRAC(3s+5,s^2+4s+13)[/MATH]

    Square root:
    [MATH]SQRT(x^2+1)[/MATH]

    Summation:
    [MATH]SUM(n=1,infty,1/n^2)[/MATH]

    Matrix:
    [MATH]MATRIX([[4,1,2],[-2,3,0],[1,-1,5]])[/MATH]

26. Standard mathematical functions may be written normally
    inside [MATH] markers:

    [MATH]sin(x)[/MATH]
    [MATH]cos(x)[/MATH]
    [MATH]tan(x)[/MATH]
    [MATH]ln(1+2x)[/MATH]
    [MATH]e^(2x)[/MATH]

27. Every mathematical expression MUST be completely enclosed
    between [MATH] and [/MATH].

28. NEVER use \frac, \int, \begin, \end, \sqrt, \sum,
    \sin, \cos, \ln or other LaTeX commands.

29. NEVER use LaTeX matrix syntax such as:
    \begin{pmatrix}
    \end{pmatrix}

30. NEVER use LaTeX commands even if they appear inside
    parentheses.

31. Use normal English outside [MATH] markers.

32. The [MATH] notation is an internal format used by the
    application and will be converted to LaTeX later.

33. Every [MATH] must have exactly one matching [/MATH].

34. Keep each question as ONE SINGLE-LINE JSON STRING.

35. NEVER insert an actual newline inside a question string.

36. NEVER insert a tab inside a question string.

37. Return ONLY valid JSON.

38. FINAL VALIDATION:
    Before returning the JSON, scan every question.

    If ANY mathematical expression is present, it MUST be
    enclosed in [MATH] and [/MATH].

39. ABSOLUTELY FORBIDDEN:
    Do NOT output:
    \( ... \)
    \[ ... \]
    $$ ... $$
    \frac
    \int
    \begin{pmatrix}
    \end{pmatrix}
    \sqrt
    \sum

40. ABSOLUTELY FORBIDDEN:
    Do NOT put mathematical expressions inside ordinary
    parentheses such as:

    (dy/dx + 3y = 6e^(2x))
    (\ln(1.3))
    (MATRIX(...))
    (DINT(...))

41. CORRECT:
    [MATH]dy/dx + 3y = 6e^(2x)[/MATH]

42. CORRECT:
    [MATH]ln(1.3)[/MATH]

43. CORRECT:
    [MATH]MATRIX([[2,1,0],[1,2,1],[0,1,2]])[/MATH]

44. CORRECT:
    [MATH]DINT(0,2,0,3,x^2*y,dx,dy)[/MATH]

45. The ONLY acceptable mathematical format is:
    [MATH]mathematical expression[/MATH]

46. Never output mathematical notation in any other format.

======================================================
QUESTION COUNTS
======================================================

Generate:

5 theory questions

5 numerical/problem-solving questions when applicable

If numerical questions are not naturally applicable to the subject,
return an empty numericalQuestions array.

======================================================
DIFFICULTY VARIETY
======================================================

Use a mixture of:

Easy
Medium
Hard

Do not make every question the same difficulty.

======================================================
JSON FORMAT
======================================================

{
    "subject": "",
    "theoryQuestions": [
        {
            "question": "",
            "difficulty": "Easy"
        }
    ],
    "numericalQuestions": [
        {
            "question": "",
            "difficulty": "Easy"
        }
    ]
}

Difficulty must be one of:

Easy
Medium
Hard

Return ONLY JSON.
`.trim();


    const previousQuestionsText =
        Array.isArray(previousQuestions) &&
            previousQuestions.length > 0
            ? previousQuestions
                .map(
                    (question, index) =>
                        `${index + 1}. ${question}`
                )
                .join("\n")
            : "No previous questions have been generated yet.";

    console.log(
        `🤖 Generating assistance for: ${subject}`
    );

    const completion =
        await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content:
                        `Generate academic practice questions for this weak subject:

SUBJECT:
${subject}

PREVIOUSLY GENERATED QUESTIONS:
${previousQuestionsText}

IMPORTANT:
Do not repeat or closely rephrase any question from the
previously generated questions.

Create a fresh set of questions covering different concepts
or approaches whenever possible.`
                }
            ],

            temperature: 0.3,

            max_completion_tokens: 3000,

            reasoning_effort: "low"
        });

    const rawResponse =
        completion?.choices?.[0]?.message?.content?.trim();

    if (!rawResponse) {
        throw new Error(
            "AI returned an empty assistance response."
        );
    }

    const cleanedResponse =
        cleanAIJsonResponse(rawResponse);

    let parsedResponse;

    try {
        parsedResponse = JSON.parse(cleanedResponse);

    } catch (error) {

        console.error(
            "❌ First JSON parse failed:",
            error.message
        );

        // ======================================================
        // Repair raw control characters inside JSON strings
        // ======================================================

        const repairedResponse =
            cleanedResponse
                .replace(/\r/g, "")
                .replace(/\t/g, " ");

        let insideString = false;
        let escaped = false;
        let safeJson = "";

        for (let i = 0; i < repairedResponse.length; i++) {

            const char = repairedResponse[i];

            if (char === '"' && !escaped) {
                insideString = !insideString;
            }

            if (
                insideString &&
                (char === "\n" || char === "\r")
            ) {
                safeJson += " ";
            } else {
                safeJson += char;
            }

            escaped =
                char === "\\" && !escaped;
        }

        try {

            parsedResponse = JSON.parse(safeJson);

            console.log(
                "✅ JSON repaired successfully."
            );

        } catch (repairError) {

            console.error(
                "❌ Failed to parse assistance response after repair:",
                repairError.message
            );

            console.error(
                "❌ Raw AI response:",
                cleanedResponse
            );

            return cleanedResponse;
        }
    }

    if (Array.isArray(parsedResponse.theoryQuestions)) {
        parsedResponse.theoryQuestions =
            parsedResponse.theoryQuestions.map((item) => ({
                ...item,
                question: normalizeMathText(item.question)
            }));
    }

    if (Array.isArray(parsedResponse.numericalQuestions)) {
        parsedResponse.numericalQuestions =
            parsedResponse.numericalQuestions.map((item) => ({
                ...item,
                question: normalizeMathText(item.question)
            }));
    }

    console.log(
        "✅ Weak subject assistance generated."
    );

    return JSON.stringify(parsedResponse);
}


export async function generateTheorySolutions(questions = []) {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Theory questions are required.");
    }

    const questionsText = questions
        .map(
            (item, index) =>
                `${index + 1}. ${item.question}`
        )
        .join("\n");

    const systemPrompt = `
You are EduCompanion, an academic learning assistant.

Your task is to provide detailed and clear solutions
for the given theory questions.

Return ONLY valid JSON.
Do not return Markdown outside JSON.

======================================================
IMPORTANT RULES
======================================================

1. Answer every question.

2. Give a clear and academically correct explanation.

3. Explain concepts in a way suitable for a college student.

4. Use simple and understandable language.

5. Provide enough detail for exam preparation.

6. Do not give extremely short answers.

7. If an example helps explain the concept, include one.

8. Keep each answer detailed but reasonably concise.
   Aim for approximately 150-250 words per answer.

9. Do not invent information.

10. Keep the answer directly related to the question.

11. Do not include unnecessary information.

12. Preserve the original question exactly.

======================================================
MATHEMATICAL FORMATTING
======================================================

1. Use valid LaTeX for all mathematical expressions,
   formulas, equations, integrals, derivatives, matrices,
   limits, and mathematical symbols.

2. Inline mathematical expressions must use:
   \( ... \)

3. Complex or important equations should use:
   $$ ... $$

4. NEVER use plain parentheses such as:
   (x^2 + y^2 = 4)
   as a replacement for LaTeX math delimiters.

5. For integrals, use proper LaTeX, for example:
   \(\int_0^{\pi/2} x\sin x\,dx\)

6. For matrices, use proper LaTeX, for example:
   \(\begin{pmatrix}4 & 1\\1 & 3\end{pmatrix}\)

7. For fractions, derivatives, limits, powers, and
   mathematical symbols, use proper LaTeX syntax.

8. Preserve mathematical expressions accurately.

9. Do not write mathematical expressions as plain text
   when LaTeX can represent them properly.

======================================================
JSON FORMAT
======================================================

{
    "solutions": [
        {
            "question": "",
            "answer": ""
        }
    ]
}

Return exactly one solution for every question.

Return ONLY valid JSON.
`.trim();

    const completion =
        await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content:
                        `Provide detailed solutions for these theory questions:

${questionsText}`
                }
            ],

            temperature: 0.3,

            max_completion_tokens: 8000,

            reasoning_effort: "low"
        });

    const rawResponse =
        completion?.choices?.[0]?.message?.content?.trim();

    if (!rawResponse) {
        throw new Error(
            "AI returned an empty theory solution response."
        );
    }

    const cleanedResponse =
        cleanAIJsonResponse(rawResponse);

    console.log(
        "✅ Theory solutions generated."
    );

    return cleanedResponse;
}

export async function generateNumericalSolutions(questions = []) {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Numerical questions are required.");
    }

    const questionsText = questions
        .map(
            (item, index) =>
                `${index + 1}. ${item.question}`
        )
        .join("\n");

    const systemPrompt = `
You are EduCompanion, an academic learning assistant.

Your task is to solve the given numerical/problem-solving
questions with proper step-by-step calculations.

Return ONLY valid JSON.
Do not return Markdown outside JSON.

======================================================
IMPORTANT RULES
======================================================

1. Solve every question.

2. Preserve the original question exactly.

3. Show the solution step by step.

4. Clearly identify the formula used whenever applicable.

5. Show substitution of values into the formula.

6. Show the calculation process clearly.

7. Clearly state the final answer.

8. Use correct units whenever applicable.

9. If multiple calculation steps are required, show all
   important steps.

10. Do not skip important mathematical steps.

11. Keep each solution detailed but reasonably concise.
    Use only the steps necessary to solve the problem clearly.

12. Do not invent missing values.

13. If a question is theoretical rather than numerical,
    provide the appropriate problem-solving explanation.

14. Keep the solution suitable for a college student.

15. Use simple and understandable language.

16. Do not provide unnecessary information.

======================================================
MATHEMATICAL FORMATTING
======================================================

1. Use valid LaTeX for all mathematical expressions,
   formulas, equations, integrals, derivatives, matrices,
   limits, and mathematical symbols.

2. Inline mathematical expressions must use:
   \( ... \)

3. Complex or important equations should use:
   $$ ... $$

4. NEVER use plain parentheses such as:
   (x^2 + y^2 = 4)
   as a replacement for LaTeX math delimiters.

5. For integrals, use proper LaTeX, for example:
   \(\int_0^{\pi/2} x\sin x\,dx\)

6. For matrices, use proper LaTeX, for example:
   \(\begin{pmatrix}4 & 1\\1 & 3\end{pmatrix}\)

7. For fractions, derivatives, limits, powers, and
   mathematical symbols, use proper LaTeX syntax.

8. Preserve mathematical expressions accurately.

9. Do not write mathematical expressions as plain text
   when LaTeX can represent them properly.

======================================================
JSON FORMAT
======================================================

{
    "solutions": [
        {
            "question": "",
            "steps": [
                ""
            ],
            "finalAnswer": ""
        }
    ]
}

Return exactly one solution for every question.

Return ONLY valid JSON.
`.trim();

    const completion =
        await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content:
                        `Solve these numerical questions step by step:

${questionsText}`
                }
            ],

            temperature: 0.2,

            max_completion_tokens: 8000,

            reasoning_effort: "low"
        });

    const rawResponse =
        completion?.choices?.[0]?.message?.content?.trim();

    if (!rawResponse) {
        throw new Error(
            "AI returned an empty numerical solution response."
        );
    }

    const cleanedResponse =
        cleanAIJsonResponse(rawResponse);

    console.log(
        "✅ Numerical solutions generated."
    );

    return cleanedResponse;
}