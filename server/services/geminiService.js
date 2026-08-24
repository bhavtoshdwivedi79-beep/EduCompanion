import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


// ======================================================
// NORMAL AI CHAT
// ======================================================

export async function askAI(history) {

    // ==================================================
    // LIMIT CONVERSATION HISTORY
    // ==================================================

    const MAX_HISTORY_CHARS = 12000;

    let totalChars = 0;

    const limitedHistory = [];

    // Latest messages are more important,
    // so process history from newest to oldest.
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

        // Limit each individual message
        if (content.length > 2500) {

            content =
                content.substring(
                    0,
                    2500
                ) +
                "\n\n[Previous response shortened for context.]";

        }

        // Check total history size
        if (
            totalChars + content.length >
            MAX_HISTORY_CHARS
        ) {

            break;

        }

        limitedHistory.unshift({

            role:
                message.role,

            content,

        });

        totalChars += content.length;

    }


    // ==================================================
    // AI MESSAGES
    // ==================================================

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


    // ==================================================
    // ASK GROQ
    // ==================================================

    const completion =
        await groq.chat.completions.create({

            model:
                "openai/gpt-oss-120b",

            messages,

            temperature:
                0.7,

            max_tokens:
                1024,

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

// ======================================================
// ANALYZE TEXT-BASED PDF
// QUESTION-AWARE PDF ANALYSIS
// ======================================================

export async function analyzePDF(
    pdfText,
    pageImages,
    question
) {

    // ==================================================
    // VALIDATE INPUT
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
        (question || "").trim();


    // ==================================================
    // DETECT QUESTION TYPE
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


    const lowerQuestion =
        cleanQuestion.toLowerCase();


    const isVisualQuestion =
        visualKeywords.some(
            keyword =>
                lowerQuestion.includes(
                    keyword
                )
        );


    console.log(
        `🔎 PDF question: ${cleanQuestion}`
    );


    console.log(
        `🧠 Question type: ${isVisualQuestion
            ? "VISUAL"
            : "TEXT"
        }`
    );


    // ==================================================
    // LIMIT EXTRACTED TEXT
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
    // VISUAL QUESTION
    // ==================================================

    if (
        isVisualQuestion
    ) {

        console.log(
            "🖼️ Visual question detected"
        );


        // ==================================================
        // VALIDATE PAGE IMAGES
        // ==================================================

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
        // DETECT VISUAL QUESTION CATEGORY
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
                    lowerQuestion.includes(
                        keyword
                    )
            );


        const isStructuredVisualQuestion =
            structuredVisualKeywords.some(
                keyword =>
                    lowerQuestion.includes(
                        keyword
                    )
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


        // --------------------------------------------------
        // PERSON / IMAGE QUESTIONS
        // --------------------------------------------------

        if (
            isPersonQuestion
        ) {

            console.log(
                "👤 Person/image question detected"
            );


            // For person/image questions, first page
            // is usually the most relevant resume/profile page.

            selectedPageImages =
                pageImages.slice(
                    0,
                    1
                );

        }


        // --------------------------------------------------
        // CHART / GRAPH / TABLE / DIAGRAM QUESTIONS
        // --------------------------------------------------

        else if (
            isStructuredVisualQuestion
        ) {

            console.log(
                "📊 Structured visual question detected"
            );


            // Limit pages to avoid exceeding Groq TPM.

            selectedPageImages =
                pageImages.slice(
                    0,
                    2
                );

        }


        // --------------------------------------------------
        // OTHER VISUAL QUESTIONS
        // --------------------------------------------------

        else {

            console.log(
                "🖼️ General visual question detected"
            );


            selectedPageImages =
                pageImages.slice(
                    0,
                    1
                );

        }


        console.log(
            `🖼️ Selected ${selectedPageImages.length}/${pageImages.length} PDF page(s) for visual analysis`
        );


        // ==================================================
        // LIMIT SUPPORTING PDF TEXT
        // ==================================================

        const visualContext =
            limitedText.length > 1500
                ? limitedText.substring(
                    0,
                    1500
                )
                : limitedText;


        console.log(
            `📝 Visual context text: ${visualContext.length} characters`
        );


        // ==================================================
        // CREATE MULTIMODAL CONTENT
        // ==================================================

        const content = [];


        content.push({

            type: "text",

            text: `
You are EduCompanion, an AI Study Assistant.

The student is asking a visual question about a PDF.

Student question:
${cleanQuestion || "Describe the visual content of this PDF."}

Use the PDF page image as the PRIMARY source.

The extracted PDF text is only supporting context.

IMPORTANT RULES:

- Carefully inspect the provided page image.
- Answer the student's exact question.
- Describe only information that is visibly present.
- Do not invent visual details.
- If the question asks about a person, describe visible characteristics only.
- Do not identify a real person by name from facial appearance alone.
- If the requested information is unclear or not visible, say so.
- Use the extracted text only to understand document context.
- Keep the answer concise and useful.
- Use Markdown when helpful.

Supporting PDF text:

${visualContext}
        `.trim()

        });


        // ==================================================
        // ADD SELECTED PAGE IMAGES
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
                !Buffer.isBuffer(
                    imageBuffer
                )
            ) {

                console.warn(
                    `⚠️ Skipping invalid page image ${index + 1}`
                );

                continue;

            }


            const base64Image =
                imageBuffer.toString(
                    "base64"
                );


            console.log(
                `🖼️ Preparing selected visual page ${index + 1}...`
            );


            content.push({

                type: "text",

                text:
                    `PDF Page ${index + 1}:`

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
        // VALIDATE CONTENT
        // ==================================================

        if (
            content.length <= 1
        ) {

            throw new Error(
                "No valid PDF page images available"
            );

        }


        // ==================================================
        // VISION AI REQUEST
        // ==================================================

        try {

            console.log(
                "🤖 Sending optimized visual PDF question to Vision AI..."
            );


            const completion =
                await groq.chat.completions.create({

                    model:
                        "qwen/qwen3.6-27b",


                    messages: [

                        {

                            role: "system",

                            content:
                                "You are EduCompanion. Answer visual PDF questions using the provided page images."

                        },

                        {

                            role: "user",

                            content

                        }

                    ],


                    temperature: 0.2,

                    max_completion_tokens: 600,

                    reasoning_effort:
                        "none"

                });


            const answer =
                completion
                    ?.choices?.[0]
                    ?.message?.content;


            if (
                !answer
            ) {

                throw new Error(
                    "Vision AI returned an empty response"
                );

            }


            console.log(
                "✅ Optimized visual PDF analysis completed"
            );


            return answer;

        }


        catch (error) {

            console.error(
                "❌ VISUAL PDF AI ERROR:",
                error
            );


            // ==================================================
            // FALLBACK
            // ==================================================

            if (
                error?.status === 413 ||
                error?.error?.code ===
                "rate_limit_exceeded"
            ) {

                console.warn(
                    "⚠️ Vision request exceeded TPM limit."
                );


                console.log(
                    "🔄 Retrying with minimal visual request..."
                );


                try {

                    const firstImage =
                        pageImages[0];


                    if (
                        !firstImage ||
                        !Buffer.isBuffer(
                            firstImage
                        )
                    ) {

                        throw error;

                    }


                    const base64Image =
                        firstImage.toString(
                            "base64"
                        );


                    const fallbackContent = [

                        {

                            type: "text",

                            text: `
Answer this visual question about the PDF:

${cleanQuestion}

Carefully inspect the page image.

Only describe information that is clearly visible.
Do not invent details.
If the requested information is not visible, say so.
                        `.trim()

                        },

                        {

                            type: "image_url",

                            image_url: {

                                url:
                                    `data:image/jpeg;base64,${base64Image}`

                            }

                        }

                    ];


                    const fallbackCompletion =
                        await groq.chat.completions.create({

                            model:
                                "qwen/qwen3.6-27b",


                            messages: [

                                {

                                    role:
                                        "user",

                                    content:
                                        fallbackContent

                                }

                            ],


                            temperature:
                                0.2,

                            max_completion_tokens:
                                400,

                            reasoning_effort:
                                "none"

                        });


                    const fallbackAnswer =
                        fallbackCompletion
                            ?.choices?.[0]
                            ?.message?.content;


                    if (
                        !fallbackAnswer
                    ) {

                        throw error;

                    }


                    console.log(
                        "✅ Minimal visual fallback completed"
                    );


                    return fallbackAnswer;

                }

                catch (
                fallbackError
                ) {

                    console.error(
                        "❌ Minimal visual fallback failed:",
                        fallbackError
                    );


                    throw fallbackError;

                }

            }


            throw error;

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

    // ======================================================
    // VALIDATE INPUT
    // ======================================================

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


    // ======================================================
    // PROCESS EACH PAGE
    // ======================================================

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
        // NORMALIZE IMAGE BUFFER
        // ==================================================

        try {

            // If it is already a Buffer
            if (Buffer.isBuffer(imageBuffer)) {

                console.log(
                    `📦 Page ${index + 1} is already a Buffer`
                );

            }

            // If pdf2pic somehow returned another
            // binary-compatible object
            else if (imageBuffer) {

                console.log(
                    `🔄 Converting page ${index + 1} data to Buffer`
                );

                imageBuffer =
                    Buffer.from(
                        imageBuffer
                    );

            }

        } catch (bufferError) {

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
        // VALIDATE BUFFER
        // ==================================================

        if (
            !imageBuffer ||
            !Buffer.isBuffer(imageBuffer) ||
            imageBuffer.length === 0
        ) {

            console.error(
                `❌ Invalid or empty image buffer for page ${index + 1}`
            );


            results.push(

                `## Page ${index + 1}\n\nUnable to read this page.`

            );

            continue;

        }


        console.log(
            `📏 Page ${index + 1} image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`
        );


        // ==================================================
        // CONVERT TO BASE64
        // ==================================================

        const base64Image =
            imageBuffer.toString("base64");


        console.log(
            `🔤 Page ${index + 1} Base64 length: ${base64Image.length}`
        );


        if (
            !base64Image ||
            base64Image.length < 100
        ) {

            console.error(
                `❌ Invalid Base64 image for page ${index + 1}`
            );


            results.push(

                `## Page ${index + 1}\n\nUnable to read this page.`

            );

            continue;

        }


        try {

            // ==================================================
            // SEND IMAGE TO GROQ VISION MODEL
            // ==================================================

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

Your job is to understand and explain the visible content.

Rules:

- Read all visible text carefully.
- Extract important information from the page.
- Explain diagrams and charts.
- Solve mathematical problems step by step.
- Explain code if present.
- Try to understand handwritten notes.
- Do not invent information.
- If something is unclear or unreadable, clearly mention it.
- Answer the student's question using information visible on the page.
- Use simple English.
- Use Markdown formatting.
- Use headings and bullet points where useful.
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

                    temperature: 0.7,

                    max_completion_tokens: 1000,

                    reasoning_effort: "none",

                });


            // ==================================================
            // GET AI RESPONSE
            // ==================================================

            const answer =
                completion
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            if (!answer) {

                console.warn(
                    `⚠️ AI returned empty response for page ${index + 1}`
                );


                results.push(

                    `## Page ${index + 1}\n\nAI could not analyze this page.`

                );

                continue;

            }


            // ==================================================
            // SAVE RESULT
            // ==================================================

            results.push(

                `## Page ${index + 1}\n\n${answer}`

            );


            console.log(
                `✅ Page ${index + 1} analyzed successfully`
            );


        } catch (error) {

            console.error(
                `❌ Error analyzing page ${index + 1}:`,
                error.message
            );


            results.push(

                `## Page ${index + 1}\n\nUnable to analyze this page.`

            );

        }


        // ==================================================
        // DELAY BETWEEN PAGES
        // ==================================================

        if (
            index <
            imageBuffers.length - 1
        ) {

            console.log(
                "⏳ Waiting before next page..."
            );


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1500
                    )
            );

        }

    }


    // ======================================================
    // COMBINE ALL PAGE RESULTS
    // ======================================================

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

    if (!topic || !topic.trim()) {
        throw new Error("Topic is required");
    }

    console.log(`📝 Generating notes for: ${topic}`);

    try {

        const completion =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-120b",

                messages: [

                    {
                        role: "system",

                        content: `
You are EduCompanion AI, an expert study assistant.

Create clear, complete and student-friendly study notes.

Topic:
The user will provide a topic.

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
- Do not replace useful tables with long paragraphs.
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

                temperature: 0.5,

                max_completion_tokens: 2500,

                include_reasoning: false,

            });


        const answer =
            completion?.choices?.[0]?.message?.content;


        if (!answer) {

            throw new Error(
                "AI returned an empty response"
            );

        }


        console.log(
            "✅ Notes generated successfully"
        );


        return answer;


    } catch (error) {

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

    if (!topic || !topic.trim()) {
        throw new Error("Quiz topic is required");
    }

    console.log("🧠 Generating quiz for:", topic);

    try {

        const completion =
            await groq.chat.completions.create({

                // ==================================================
                // USE GPT-OSS 120B
                // ==================================================

                model: "openai/gpt-oss-120b",

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

                // ==================================================
                // JSON SCHEMA
                // ==================================================

                response_format: {

                    type: "json_schema",

                    json_schema: {

                        name: "quiz",

                        strict: true,

                        schema: {

                            type: "object",

                            properties: {

                                quiz: {

                                    type: "array",

                                    items: {

                                        type: "object",

                                        properties: {

                                            question: {
                                                type: "string"
                                            },

                                            options: {

                                                type: "array",

                                                items: {
                                                    type: "string"
                                                },

                                                minItems: 4,

                                                maxItems: 4

                                            },

                                            answer: {
                                                type: "string"
                                            }

                                        },

                                        required: [
                                            "question",
                                            "options",
                                            "answer"
                                        ],

                                        additionalProperties: false

                                    },

                                    minItems: 10,

                                    maxItems: 10

                                }

                            },

                            required: [
                                "quiz"
                            ],

                            additionalProperties: false

                        }

                    }

                },

                temperature: 0.3,

                max_completion_tokens: 4000,

                reasoning_effort: "none",

            });


        // ==================================================
        // GET RESPONSE
        // ==================================================

        const rawResponse =
            completion?.choices?.[0]?.message?.content;


        console.log(
            "🤖 Quiz AI response received"
        );


        if (!rawResponse) {

            throw new Error(
                "AI returned an empty quiz response"
            );

        }


        console.log(
            "📦 Quiz response length:",
            rawResponse.length
        );


        // ==================================================
        // PARSE JSON
        // ==================================================

        let parsedResponse;

        try {

            parsedResponse =
                JSON.parse(rawResponse);

        } catch (jsonError) {

            console.error(
                "❌ Quiz JSON Parse Error:",
                jsonError.message
            );

            console.error(
                "❌ Raw response:",
                rawResponse
            );

            throw new Error(
                "AI returned invalid quiz JSON"
            );

        }


        // ==================================================
        // CHECK QUIZ ARRAY
        // ==================================================

        if (
            !parsedResponse ||
            !Array.isArray(parsedResponse.quiz)
        ) {

            throw new Error(
                "Invalid quiz format returned by AI"
            );

        }


        // ==================================================
        // CHECK QUESTION COUNT
        // ==================================================

        if (
            parsedResponse.quiz.length !== 10
        ) {

            throw new Error(
                `Expected 10 questions but received ${parsedResponse.quiz.length}`
            );

        }


        // ==================================================
        // VALIDATE QUESTIONS
        // ==================================================

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


                    // ------------------------------------------
                    // Exactly 4 options
                    // ------------------------------------------

                    if (
                        item.options.length !== 4
                    ) {

                        throw new Error(
                            `Question ${index + 1} must have exactly 4 options`
                        );

                    }


                    // ------------------------------------------
                    // Clean options
                    // ------------------------------------------

                    const options =
                        item.options.map(
                            option =>
                                String(option).trim()
                        );


                    // ------------------------------------------
                    // Check duplicate options
                    // ------------------------------------------

                    if (
                        new Set(options).size !== 4
                    ) {

                        throw new Error(
                            `Question ${index + 1} contains duplicate options`
                        );

                    }


                    // ------------------------------------------
                    // Clean answer
                    // ------------------------------------------

                    const answer =
                        String(
                            item.answer
                        ).trim();


                    // ------------------------------------------
                    // Answer must match option
                    // ------------------------------------------

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


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            "✅ Quiz generated successfully"
        );

        console.log(
            `📝 Total questions: ${quiz.length}`
        );


        return quiz;


    } catch (error) {

        console.error(
            "❌ generateQuizAI ERROR:"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Full error:",
            error
        );

        throw error;

    }

}

// ======================================================
// GENERATE FLASHCARDS
// ======================================================

export async function generateFlashcards(topic) {

    if (!topic || !topic.trim()) {
        throw new Error("Topic is required");
    }

    console.log(
        `🃏 Generating flashcards for: ${topic}`
    );

    try {

        const completion =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-120b",

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

                temperature: 0.4,

                max_completion_tokens: 2500,

                include_reasoning: false,

                response_format: {

                    type: "json_schema",

                    json_schema: {

                        name: "flashcards",

                        strict: true,

                        schema: {

                            type: "object",

                            properties: {

                                flashcards: {

                                    type: "array",

                                    items: {

                                        type: "object",

                                        properties: {

                                            question: {
                                                type: "string",
                                            },

                                            answer: {
                                                type: "string",
                                            },

                                        },

                                        required: [
                                            "question",
                                            "answer",
                                        ],

                                        additionalProperties: false,

                                    },

                                    minItems: 10,

                                    maxItems: 10,

                                },

                            },

                            required: [
                                "flashcards",
                            ],

                            additionalProperties: false,

                        },

                    },

                },

            });


        const content =
            completion?.choices?.[0]?.message?.content;


        if (!content) {

            throw new Error(
                "AI returned an empty flashcard response"
            );

        }


        const data =
            JSON.parse(content);


        if (
            !data.flashcards ||
            !Array.isArray(data.flashcards)
        ) {

            throw new Error(
                "Invalid flashcard format returned by AI"
            );

        }


        console.log(
            `✅ Flashcards generated successfully: ${data.flashcards.length}`
        );


        return data.flashcards;


    } catch (error) {

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