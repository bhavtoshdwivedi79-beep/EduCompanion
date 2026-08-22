import Chat from "../models/Chat.js";
import Conversation from "../models/Conversation.js";

import {
    analyzeImage,
    analyzePDF,
    analyzePDFImages,
    askAI,
    generateNotes as generateNotesAI,
    generateQuizAI,
    generateFlashcards
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
                // TEXT PDF
                // ==========================================

                if (
                    hasMeaningfulText
                ) {

                    console.log(
                        "📄 Text-based PDF detected"
                    );


                    console.log(
                        "🤖 Analyzing PDF text with AI..."
                    );


                    pdfAnswer =
                        await analyzePDF(

                            cleanedPDFText,

                            message

                        );


                    console.log(
                        "✅ Text PDF analyzed successfully"
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
                // SAVE CHAT
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

                    });


                console.log(
                    "✅ PDF chat saved successfully"
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
        // PREVIOUS CHATS
        // ==================================================

        const previousChats =
            await Chat.find({

                user:
                    req.user._id,

                conversation:
                    conversation._id,

            })

                .sort({
                    createdAt: 1,
                })

                .limit(10);


        // ==================================================
        // AI HISTORY
        // ==================================================

        const history = [];


        previousChats.forEach(
            (chat) => {

                history.push({

                    role:
                        "user",

                    content:
                        chat.question,

                });


                history.push({

                    role:
                        "assistant",

                    content:
                        chat.answer,

                });

            }
        );


        history.push({

            role:
                "user",

            content:
                message,

        });


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