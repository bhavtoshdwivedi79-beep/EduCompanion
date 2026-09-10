import Chat from "../models/Chat.js";
import Conversation from "../models/Conversation.js";

import {
    analyzeImage,
    analyzePDF,
    analyzePDFImages,
    askAI,
    generateNotes as generateNotesAI,
    generateQuizAI,
    generateFlashcards,
    generateNotesFromPDF,
    generateQuizFromPDF,
    generateQuizFromPDFImages
} from "../services/geminiService.js";

import {
    extractPDFText
} from "../services/pdfService.js";

import {
    convertPDFToImages
} from "../services/pdfImageService.js";

import updateStreak from "../utils/updateStreak.js";

import {
    uploadImage,
    deleteImage,
    uploadFile,
    deleteFile,
} from "../config/cloudinary.js";


// ======================================================
// CHAT WITH AI
// ======================================================

export const chatWithAI = async (
    req,
    res
) => {

    try {

        console.log(
            "MESSAGE:",
            req.body.message
        );


        console.log(
            "FILE:",
            req.file
                ? {
                    name:
                        req.file.originalname,

                    type:
                        req.file.mimetype,

                    size:
                        req.file.size,
                }
                : null
        );


        const {
            message,
            conversationId,
        } = req.body;


        // ==================================================
        // FIND OR CREATE CONVERSATION
        // ==================================================

        let conversation;


        if (conversationId) {

            conversation =
                await Conversation.findOne({

                    _id:
                        conversationId,

                    user:
                        req.user._id,

                });


            if (!conversation) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Conversation not found",

                });

            }

        } else {

            conversation =
                await Conversation.create({

                    user:
                        req.user._id,

                    title:
                        message
                            ? (
                                message.length > 40
                                    ? message.substring(
                                        0,
                                        40
                                    ) + "..."
                                    : message
                            )
                            : "New Chat",

                });

        }


        // ==================================================
        // IMAGE CHAT
        // ==================================================

        if (
            req.file &&
            req.file.mimetype.startsWith(
                "image/"
            )
        ) {

            console.log(
                "🖼️ Image detected"
            );


            // ------------------------------------------------
            // Upload image
            // ------------------------------------------------

            let cloudinaryResult;

            try {

                console.log(
                    "☁️ Uploading image to Cloudinary..."
                );


                cloudinaryResult =
                    await uploadImage(
                        req.file.buffer
                    );


                console.log(
                    "✅ Image uploaded"
                );

            } catch (uploadError) {

                console.error(
                    "❌ Image upload failed:",
                    uploadError.message
                );

            }


            // ------------------------------------------------
            // Analyze image
            // ------------------------------------------------

            console.log(
                "🤖 Analyzing image with AI..."
            );


            const imageAnswer =
                await analyzeImage(

                    req.file.buffer,

                    req.file.mimetype,

                    message

                );


            console.log(
                "✅ Image analysis completed"
            );


            // ------------------------------------------------
            // Save chat
            // ------------------------------------------------

            const chat =
                await Chat.create({

                    user:
                        req.user._id,

                    conversation:
                        conversation._id,

                    question:
                        message ||
                        `📷 ${req.file.originalname}`,

                    answer:
                        imageAnswer,

                    imageUrl:
                        cloudinaryResult?.secure_url ||
                        "",

                    imagePublicId:
                        cloudinaryResult?.public_id ||
                        "",

                    imageName:
                        req.file.originalname,

                });


            await updateStreak(
                req.user._id
            );


            return res.status(200).json({

                success: true,

                reply:
                    imageAnswer,

                conversationId:
                    conversation._id,

                imageUrl:
                    chat.imageUrl,

                imagePublicId:
                    chat.imagePublicId,

                imageName:
                    chat.imageName,

            });

        }


        // ==================================================
        // PDF CHAT
        // ==================================================

        if (
            req.file &&
            req.file.mimetype ===
            "application/pdf"
        ) {

            console.log(
                "📄 PDF received:",
                {
                    name:
                        req.file.originalname,

                    size:
                        req.file.size,
                }
            );


            try {

                // ==========================================
                // EXTRACT PDF TEXT
                // ==========================================

                console.log(
                    "📖 Reading PDF..."
                );


                const {
                    pdfText,
                    pages,
                } =
                    await extractPDFText(
                        req.file.buffer
                    );


                console.log(
                    `📄 PDF pages detected: ${pages}`
                );


                console.log(
                    `📝 Raw extracted characters: ${pdfText.length}`
                );


                // ==========================================
                // CLEAN TEXT
                // ==========================================

                const cleanedPDFText =
                    (pdfText || "")
                        .replace(
                            /--\s*\d+\s+of\s+\d+\s*--/gi,
                            ""
                        )
                        .replace(
                            /\n{3,}/g,
                            "\n\n"
                        )
                        .trim();


                const meaningfulText =
                    cleanedPDFText
                        .replace(/\s+/g, "")
                        .trim();


                const hasMeaningfulText =
                    meaningfulText.length >= 30;


                console.log(
                    `🔎 Meaningful PDF text: ${hasMeaningfulText}`
                );


                console.log(
                    `📝 Cleaned text characters: ${cleanedPDFText.length}`
                );


                let pdfAnswer;


                // ==========================================
                // TEXT PDF + VISUAL PAGES
                // ==========================================

                if (
                    hasMeaningfulText
                ) {

                    console.log(
                        "📄 Text-based PDF detected"
                    );


                    // ==========================================
                    // CONVERT PDF PAGES TO IMAGES
                    // ==========================================

                    console.log(
                        `🖼️ Converting ${pages} text-PDF pages to images...`
                    );


                    const pageImages =
                        await convertPDFToImages(

                            req.file.buffer,

                            pages

                        );


                    console.log(
                        `🖼️ Converted ${pageImages.length}/${pages} text-PDF pages to images`
                    );


                    if (
                        !pageImages ||
                        pageImages.length === 0
                    ) {

                        throw new Error(
                            "Unable to generate images from text-based PDF."
                        );

                    }


                    // ==========================================
                    // ANALYZE PDF
                    // ==========================================

                    console.log(
                        "🤖 Analyzing PDF text with AI..."
                    );


                    pdfAnswer =
                        await analyzePDF(

                            cleanedPDFText,

                            pageImages,

                            message

                        );

                    console.log("🤖 PDF AI RESPONSE:", pdfAnswer);
                    console.log("🤖 PDF AI RESPONSE TYPE:", typeof pdfAnswer);

                    console.log(
                        "✅ Text PDF analyzed successfully"
                    );


                    console.log(
                        `✅ Text PDF visual pages ready: ${pageImages.length}`
                    );

                }


                // ==========================================
                // SCANNED PDF
                // ==========================================

                else {

                    console.log(
                        "📸 Scanned/Image-based PDF detected"
                    );


                    console.log(
                        `🖼️ Converting ${pages} PDF pages to images...`
                    );


                    const pageImages =
                        await convertPDFToImages(

                            req.file.buffer,

                            pages

                        );


                    console.log(
                        `🖼️ Converted ${pageImages.length}/${pages} PDF pages to images`
                    );


                    if (
                        !pageImages ||
                        pageImages.length === 0
                    ) {

                        return res.status(400).json({

                            success: false,

                            message:
                                "Unable to read the pages of this scanned PDF.",

                        });

                    }


                    // ======================================
                    // ANALYZE SCANNED PAGES
                    // ======================================

                    console.log(
                        "🤖 Analyzing scanned PDF pages with AI..."
                    );


                    pdfAnswer =
                        await analyzePDFImages(
                            pageImages,
                            message
                        );

                    console.log(
                        "🤖 SCANNED PDF AI RESPONSE:",
                        pdfAnswer
                    );

                    console.log(
                        "🤖 SCANNED PDF AI RESPONSE TYPE:",
                        typeof pdfAnswer
                    );

                    if (!pdfAnswer) {
                        throw new Error(
                            "AI did not return an answer for the scanned PDF."
                        );
                    }

                    console.log(
                        "✅ Scanned PDF analyzed successfully"
                    );

                }


                // ==========================================
                // UPLOAD PDF
                // ==========================================

                let cloudinaryResult = null;


                try {

                    console.log(
                        "☁️ Uploading PDF to Cloudinary..."
                    );


                    cloudinaryResult =
                        await uploadFile(

                            req.file.buffer,

                            req.file.originalname

                        );


                    console.log(
                        "✅ PDF uploaded to Cloudinary"
                    );

                } catch (uploadError) {

                    console.error(
                        "⚠️ Cloudinary upload failed:",
                        uploadError.message
                    );

                }


                // ==========================================
                // SAVE PDF CHAT
                // ==========================================

                const chat =
                    await Chat.create({

                        user:
                            req.user._id,

                        conversation:
                            conversation._id,

                        question:
                            message ||
                            `📄 ${req.file.originalname}`,

                        answer:
                            pdfAnswer,

                        fileUrl:
                            cloudinaryResult?.secure_url ||
                            "",

                        filePublicId:
                            cloudinaryResult?.public_id ||
                            "",

                        fileName:
                            req.file.originalname,

                        fileType:
                            req.file.mimetype,

                        // ==================================
                        // IMPORTANT:
                        // STORE PDF TEXT FOR FUTURE CHAT
                        // ==================================

                        extractedText:
                            cleanedPDFText || "",

                    });


                console.log(
                    "✅ PDF chat saved successfully"
                );


                console.log(
                    `💾 Stored PDF context: ${cleanedPDFText.length} characters`
                );


                // ==========================================
                // UPDATE STREAK
                // ==========================================

                await updateStreak(
                    req.user._id
                );


                // ==========================================
                // RESPONSE
                // ==========================================

                return res.status(200).json({

                    success: true,

                    reply:
                        pdfAnswer,

                    conversationId:
                        conversation._id,

                    fileUrl:
                        chat.fileUrl,

                    filePublicId:
                        chat.filePublicId,

                    fileName:
                        chat.fileName,

                    fileType:
                        chat.fileType,

                    pages,

                });


            } catch (pdfError) {

                console.error(
                    "❌ PDF CHAT ERROR:",
                    pdfError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        pdfError.message ||
                        "Unable to process this PDF.",

                });

            }

        }


        // ==================================================
        // NORMAL TEXT CHAT
        // ==================================================

        if (!message) {

            return res.status(400).json({

                success: false,

                message:
                    "Message is required",

            });

        }


        // ==================================================
        // FIND PREVIOUS CHATS
        // ==================================================

        const previousChats =
            await Chat.find({

                user:
                    req.user._id,

                conversation:
                    conversation._id,

            })
                .sort({
                    createdAt: -1,
                })
                .limit(4);


        console.log(
            `🧠 Previous chat records: ${previousChats.length}`
        );


        // ==================================================
        // FIND LATEST PDF CONTEXT
        // ==================================================

        const latestPDF =
            await Chat.findOne({

                user:
                    req.user._id,

                conversation:
                    conversation._id,

                fileType:
                    "application/pdf",

                extractedText:
                {
                    $exists: true,

                    $ne: "",
                },

            })
                .sort({
                    createdAt: -1,
                });


        // ==================================================
        // PDF CONTEXT
        // ==================================================

        let pdfContext = "";

        let pdfFileName = "";


        if (latestPDF) {

            pdfContext =
                latestPDF.extractedText || "";

            pdfFileName =
                latestPDF.fileName || "Uploaded PDF";


            // ------------------------------------------------
            // IMPORTANT:
            // Keep PDF context reasonably small.
            // ------------------------------------------------

            const MAX_PDF_CONTEXT = 6000;


            if (
                pdfContext.length >
                MAX_PDF_CONTEXT
            ) {

                pdfContext =
                    pdfContext.substring(
                        0,
                        MAX_PDF_CONTEXT
                    );

            }


            console.log(
                "📄 Previous PDF context found"
            );


            console.log(
                `📄 PDF context characters: ${pdfContext.length}`
            );


            console.log(
                `📄 PDF file: ${pdfFileName}`
            );

        } else {

            console.log(
                "📄 No previous PDF context found"
            );

        }


        // ==================================================
        // CREATE AI HISTORY
        // ==================================================

        const history = [];


        // ==================================================
        // ADD PDF CONTEXT
        // ==================================================

        if (pdfContext) {

            history.push({

                role:
                    "user",

                content:
                    `
PDF CONTEXT

The student uploaded this PDF earlier
in the current conversation.

Use this PDF as the primary source when
the student's question is related to it.

PDF filename:
${pdfFileName}

Extracted PDF text:
${pdfContext}

IMPORTANT:
- Do not invent information.
- If the answer is not present in the PDF,
  say that clearly.
- The PDF context is persistent conversation
  context and should be used for follow-up
  questions.
            `.trim(),

            });


            history.push({

                role:
                    "assistant",

                content:
                    "I have the uploaded PDF context available and will use it for relevant follow-up questions.",

            });

        }


        // ==================================================
        // ADD PREVIOUS CHAT HISTORY
        // ==================================================

        // We only keep a SMALL amount of previous history.
        // This prevents the request from becoming too large.

        const MAX_QUESTION_CHARS = 500;

        const MAX_ANSWER_CHARS = 1000;


        // Oldest → newest
        previousChats
            .reverse()
            .forEach((chat) => {

                // ------------------------------------------
                // Do not add the original PDF upload again.
                // PDF content is already added above.
                // ------------------------------------------

                if (
                    chat._id?.toString() ===
                    latestPDF?._id?.toString()
                ) {

                    return;

                }


                const question =
                    (chat.question || "")
                        .substring(
                            0,
                            MAX_QUESTION_CHARS
                        );


                const answer =
                    (chat.answer || "")
                        .substring(
                            0,
                            MAX_ANSWER_CHARS
                        );


                if (!question) {

                    return;

                }


                history.push({

                    role:
                        "user",

                    content:
                        question,

                });


                if (answer) {

                    history.push({

                        role:
                            "assistant",

                        content:
                            answer,

                    });

                }

            });


        // ==================================================
        // CURRENT USER QUESTION
        // ==================================================

        history.push({

            role:
                "user",

            content:
                message,

        });


        // ==================================================
        // DEBUG HISTORY SIZE
        // ==================================================

        console.log(
            `🧠 Final AI history messages: ${history.length}`
        );


        const historyCharacters =
            history.reduce(

                (
                    total,
                    item
                ) =>
                    total +
                    (
                        item.content?.length ||
                        0
                    ),

                0

            );


        console.log(
            `📝 Final AI history characters: ${historyCharacters}`
        );


        // ==================================================
        // ASK AI
        // ==================================================

        const answer =
            await askAI(
                history
            );




        // ==================================================
        // UPDATE TITLE
        // ==================================================

        const totalMessages =
            await Chat.countDocuments({

                conversation:
                    conversation._id,

            });


        if (
            totalMessages === 0
        ) {

            conversation.title =
                message.length > 40

                    ? message.substring(
                        0,
                        40
                    ) + "..."

                    : message;


            await conversation.save();

        }


        // ==================================================
        // SAVE NORMAL CHAT
        // ==================================================

        await Chat.create({

            user:
                req.user._id,

            conversation:
                conversation._id,

            question:
                message,

            answer:
                answer,

        });


        await updateStreak(
            req.user._id
        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            reply:
                answer,

            conversationId:
                conversation._id,

        });


    } catch (error) {

        console.error(
            "❌ chatWithAI ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "AI Error",

        });

    }

};


// ======================================================
// GET CHAT HISTORY
// ======================================================

export const getChatHistory = async (
    req,
    res
) => {

    try {

        const chats =
            await Chat.find({

                user:
                    req.user._id,

                conversation:
                    req.params.conversationId,

            })

                .sort({
                    createdAt: 1,
                });


        return res.status(200).json({

            success: true,

            chats,

        });


    } catch (error) {

        console.error(
            "❌ getChatHistory ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch history",

        });

    }

};



// ======================================================
// DELETE CHAT
// ======================================================

export const deleteChat = async (
    req,
    res
) => {

    try {

        // ==============================================
        // FIND CHAT
        // ==============================================

        const chat =
            await Chat.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id,

            });


        if (!chat) {

            return res.status(404).json({

                success: false,

                message:
                    "Chat not found",

            });

        }


        // ==============================================
        // DELETE IMAGE
        // ==============================================

        if (
            chat.imagePublicId
        ) {

            try {

                console.log(
                    "☁️ Deleting image from Cloudinary..."
                );


                await deleteImage(
                    chat.imagePublicId
                );


                console.log(
                    "✅ Cloudinary image deleted"
                );

            } catch (cloudinaryError) {

                console.error(
                    "⚠️ Cloudinary image delete failed:",
                    cloudinaryError.message
                );

            }

        }


        // ==============================================
        // DELETE PDF
        // ==============================================

        if (
            chat.filePublicId
        ) {

            try {

                console.log(
                    "☁️ Deleting PDF from Cloudinary..."
                );


                await deleteFile(
                    chat.filePublicId
                );


                console.log(
                    "✅ Cloudinary PDF deleted"
                );

            } catch (cloudinaryError) {

                console.error(
                    "⚠️ Cloudinary PDF delete failed:",
                    cloudinaryError.message
                );

            }

        }


        // ==============================================
        // DELETE MONGODB CHAT
        // ==============================================

        await Chat.deleteOne({

            _id:
                chat._id,

        });


        return res.status(200).json({

            success: true,

            message:
                "Chat deleted successfully",

        });


    } catch (error) {

        console.error(
            "❌ deleteChat ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server Error",

        });

    }

};



// ======================================================
// GENERATE NOTES
// ======================================================

export const generateNotes = async (
    req,
    res
) => {

    try {

        const {
            topic
        } = req.body;


        if (!topic) {

            return res.status(400).json({

                success: false,

                message:
                    "Topic is required",

            });

        }


        const notes =
            await generateNotesAI(
                topic
            );


        await updateStreak(
            req.user._id
        );


        return res.status(200).json({

            success: true,

            notes,

        });


    } catch (error) {

        console.error(
            "❌ generateNotes ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate notes",

        });

    }

};



// ======================================================
// GENERATE QUIZ
// ======================================================

export const generateQuiz = async (
    req,
    res
) => {

    try {

        const {
            topic
        } = req.body;


        if (!topic) {

            return res.status(400).json({

                success: false,

                message:
                    "Topic is required",

            });

        }


        const quiz =
            await generateQuizAI(
                topic
            );


        await updateStreak(
            req.user._id
        );


        return res.status(200).json({

            success: true,

            quiz,

        });


    } catch (error) {

        console.error(
            "❌ generateQuiz ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate quiz",

        });

    }

};

// ======================================================
// GENERATE NOTES FROM UPLOADED PDF
// TEXT + IMAGE/SCANNED PDF SUPPORT
// SMART PIPELINE
// ======================================================

export const generatePDFNotes = async (
    req,
    res
) => {

    try {

        // ==============================================
        // VALIDATE PDF
        // ==============================================

        if (
            !req.file ||
            req.file.mimetype !== "application/pdf"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a PDF file."

            });

        }


        console.log(
            "📄 PDF Notes request:",
            req.file.originalname
        );


        // ==============================================
        // EXTRACT TEXT + PAGE COUNT
        // ==============================================

        const {
            pdfText,
            pages
        } =
            await extractPDFText(
                req.file.buffer
            );


        // ==============================================
        // CLEAN EXTRACTED TEXT
        // ==============================================

        const cleanedPDFText =
            (pdfText || "")
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


        console.log(
            `📄 PDF pages: ${pages}`
        );

        console.log(
            `📝 Extracted text: ${cleanedPDFText.length
            } characters`
        );


        // ==============================================
        // DETECT TEXT PDF VS SCANNED PDF
        // ==============================================

        const meaningfulText =
            cleanedPDFText
                .replace(/\s+/g, "")
                .trim();


        const hasReadableText =
            meaningfulText.length >= 30;


        console.log(
            `📄 Readable PDF text: ${hasReadableText}`
        );


        // ==============================================
        // PAGE IMAGES
        // ONLY REQUIRED FOR SCANNED PDF
        // ==============================================

        let pageImages = [];


        if (!hasReadableText) {

            console.log(
                "🖼️ Scanned/image PDF detected."
            );

            console.log(
                "🔄 Converting PDF pages to images..."
            );


            try {

                pageImages =
                    await convertPDFToImages(
                        req.file.buffer,
                        pages
                    );


                console.log(
                    `🖼️ Converted ${pageImages.length
                    }/${pages} pages`
                );


                if (
                    !Array.isArray(pageImages) ||
                    pageImages.length === 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This PDF appears to be image-based, but its pages could not be processed."

                    });

                }

            }

            catch (imageError) {

                console.error(
                    "❌ PDF image conversion failed:",
                    imageError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to process the scanned PDF pages."

                });

            }

        }

        else {

            console.log(
                "📄 Text-based PDF detected."
            );

            console.log(
                "⏭️ Skipping unnecessary PDF image conversion."
            );

        }


        // ==============================================
        // GENERATE NOTES
        // ==============================================

        console.log(
            "🤖 Starting PDF notes generation..."
        );


        const notes =
            await generateNotesFromPDF(
                cleanedPDFText,
                pageImages
            );


        // ==============================================
        // UPDATE STREAK
        // ==============================================

        await updateStreak(
            req.user._id
        );


        // ==============================================
        // SUCCESS RESPONSE
        // ==============================================

        console.log(
            "✅ PDF notes generated successfully."
        );


        return res.status(200).json({

            success: true,

            notes,

            fileName:
                req.file.originalname,

            pages,

        });

    }

    catch (error) {

        console.error(
            "❌ generatePDFNotes ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to generate PDF notes."

        });

    }

};

// ======================================================
// GENERATE QUIZ FROM UPLOADED PDF
// TEXT + IMAGE PDF SUPPORT
// ======================================================

export const generatePDFQuiz = async (req, res) => {
    try {
        if (
            !req.file ||
            req.file.mimetype !== "application/pdf"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please upload a valid PDF file."
            });
        }

        // ----------------------------------------------------
        // Previous questions for Retry / New Quiz
        // ----------------------------------------------------

        let previousQuestions = [];

        if (req.body.previousQuestions) {
            try {
                previousQuestions =
                    JSON.parse(
                        req.body.previousQuestions
                    );

                if (!Array.isArray(previousQuestions)) {
                    previousQuestions = [];
                }
            } catch (parseError) {
                console.warn(
                    "⚠️ Could not parse previousQuestions:",
                    parseError.message
                );

                previousQuestions = [];
            }
        }

        // ----------------------------------------------------
        // STEP 1: Try normal PDF text extraction
        // ----------------------------------------------------

        const {
            pdfText,
            pages
        } = await extractPDFText(
            req.file.buffer
        );

        const cleanedPDFText =
            (pdfText || "")
                .replace(
                    /--\s*\d+\s+of\s+\d+\s*--/gi,
                    ""
                )
                .replace(
                    /\n{3,}/g,
                    "\n\n"
                )
                .trim();

        const meaningfulText =
            cleanedPDFText
                .replace(/\s+/g, "")
                .trim();

        const hasMeaningfulText =
            meaningfulText.length >= 30;

        // ----------------------------------------------------
        // CASE 1: NORMAL TEXT PDF
        // ----------------------------------------------------

        if (hasMeaningfulText) {
            console.log(
                "📄 PDF Quiz Mode: TEXT"
            );

            const quiz =
                await generateQuizFromPDF(
                    cleanedPDFText,
                    previousQuestions
                );

            await updateStreak(
                req.user._id
            );

            return res.status(200).json({
                success: true,
                quiz,
                fileName:
                    req.file.originalname,
                pages,
                mode: "text"
            });
        }

        // ----------------------------------------------------
        // CASE 2: SCANNED / IMAGE PDF
        // ----------------------------------------------------

        console.log(
            "🖼️ PDF Quiz Mode: SCANNED / IMAGE PDF"
        );

        console.log(
            "📄 Extracted text is insufficient. Rendering PDF pages..."
        );

        let pageImages;

        try {
            pageImages =
                await convertPDFToImages(
                    req.file.buffer,
                    pages
                );
        } catch (renderError) {
            console.error(
                "❌ PDF page rendering failed:",
                renderError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not convert the scanned PDF pages into images."
            });
        }

        if (
            !Array.isArray(pageImages) ||
            pageImages.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Could not read any pages from this PDF."
            });
        }

        console.log(
            `🖼️ Successfully rendered ${pageImages.length} PDF pages.`
        );

        // ----------------------------------------------------
        // Vision AI → Quiz
        // ----------------------------------------------------

        const quiz =
            await generateQuizFromPDFImages(
                pageImages,
                previousQuestions
            );

        await updateStreak(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            quiz,
            fileName:
                req.file.originalname,
            pages,
            mode: "vision"
        });

    } catch (error) {
        console.error(
            "❌ GENERATE PDF QUIZ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to generate quiz from PDF."
        });
    }
};