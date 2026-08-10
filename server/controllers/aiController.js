import Chat from "../models/Chat.js";
import Conversation from "../models/Conversation.js";

import {
    analyzeImage,
    analyzePDF,
    askAI,
    generateNotes as generateNotesAI,
    generateQuizAI,
    generateFlashcards
} from "../services/geminiService.js";

import {
    extractPDFText
} from "../services/pdfService.js";

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

export const chatWithAI = async (req, res) => {

    try {

        console.log("MESSAGE:", req.body.message);

        console.log(
            "FILE:",
            req.file
                ? {
                    name: req.file.originalname,
                    type: req.file.mimetype,
                    size: req.file.size,
                }
                : null
        );


        const {
            message,
            conversationId,
        } = req.body;


        // ==================================================
        // 1. FIND OR CREATE CONVERSATION
        // ==================================================

        let conversation;


        if (conversationId) {

            conversation = await Conversation.findOne({

                _id: conversationId,

                user: req.user._id,

            });


            if (!conversation) {

                return res.status(404).json({

                    success: false,

                    message: "Conversation not found",

                });

            }

        } else {

            conversation = await Conversation.create({

                user: req.user._id,

                title: message
                    ? (
                        message.length > 40
                            ? message.substring(0, 40) + "..."
                            : message
                    )
                    : "Image Chat",

            });

        }


        // ==================================================
        // 2. IMAGE CHAT
        // ==================================================

        if (
            req.file &&
            req.file.mimetype.startsWith("image/")
        ) {

            console.log(
                "🖼️ Image detected"
            );


            // ------------------------------------------------
            // Upload image to Cloudinary
            // ------------------------------------------------

            console.log(
                "☁️ Uploading image to Cloudinary..."
            );


            const cloudinaryResult =
                await uploadImage(
                    req.file.buffer
                );


            console.log(
                "✅ Image uploaded:",
                cloudinaryResult.secure_url
            );


            // ------------------------------------------------
            // Analyze image using AI
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
            // Save chat + image information
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

                    // IMPORTANT
                    // These values make the image
                    // persistent after refresh.

                    imageUrl:
                        cloudinaryResult.secure_url,

                    imagePublicId:
                        cloudinaryResult.public_id,

                    imageName:
                        req.file.originalname,

                });


            console.log(
                "✅ Chat + image information saved"
            );


            // ------------------------------------------------
            // Update streak
            // ------------------------------------------------

            await updateStreak(
                req.user._id
            );


            // ------------------------------------------------
            // Send response
            // ------------------------------------------------

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

        // ======================================================
        // PDF CHAT
        // ======================================================

        if (
            req.file &&
            req.file.mimetype === "application/pdf"
        ) {

            console.log("📄 PDF received:", {
                name: req.file.originalname,
                size: req.file.size,
            });

            try {

                // ==============================================
                // 1. EXTRACT PDF TEXT
                // ==============================================

                console.log("📖 Reading PDF...");

                const {
                    pdfText,
                    pages,
                } = await extractPDFText(
                    req.file.buffer
                );

                if (!pdfText || !pdfText.trim()) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "This PDF does not contain readable text. It may be a scanned or image-only PDF.",
                    });

                }

                console.log(
                    `✅ PDF readable: ${pages} pages`
                );

                console.log(
                    `📝 Extracted characters: ${pdfText.length}`
                );


                // ==============================================
                // 2. ANALYZE PDF WITH AI
                // ==============================================

                console.log("🤖 Analyzing PDF with AI...");

                const pdfAnswer =
                    await analyzePDF(
                        pdfText,
                        message
                    );

                console.log(
                    "✅ PDF analyzed successfully"
                );


                // ==============================================
                // 3. OPTIONAL CLOUDINARY UPLOAD
                // ==============================================

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

                    // Do NOT stop PDF AI processing.
                }


                // ==============================================
                // 4. SAVE CHAT
                // ==============================================

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
                            cloudinaryResult?.secure_url || "",

                        filePublicId:
                            cloudinaryResult?.public_id || "",

                        fileName:
                            req.file.originalname,

                        fileType:
                            req.file.mimetype,

                    });


                // ==============================================
                // 5. UPDATE STREAK
                // ==============================================

                await updateStreak(
                    req.user._id
                );


                // ==============================================
                // 6. RESPONSE
                // ==============================================

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
        // 4. NORMAL TEXT CHAT
        // ==================================================

        if (!message) {

            return res.status(400).json({

                success: false,

                message:
                    "Message is required",

            });

        }


        // ==================================================
        // 5. GET PREVIOUS CHATS
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
        // 6. CREATE AI HISTORY
        // ==================================================

        const history = [];


        previousChats.forEach(
            (chat) => {

                history.push({

                    role: "user",

                    content:
                        chat.question,

                });


                history.push({

                    role: "assistant",

                    content:
                        chat.answer,

                });

            }
        );


        // Current message

        history.push({

            role: "user",

            content:
                message,

        });


        // ==================================================
        // 7. ASK AI
        // ==================================================

        const answer =
            await askAI(
                history
            );


        // ==================================================
        // 8. UPDATE CONVERSATION TITLE
        // ==================================================

        const totalMessages =
            await Chat.countDocuments({

                conversation:
                    conversation._id,

            });


        if (totalMessages === 0) {

            conversation.title =
                message.length > 40

                    ? message.substring(0, 40) + "..."

                    : message;


            await conversation.save();

        }


        // ==================================================
        // 9. SAVE NORMAL CHAT
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


        // ==================================================
        // 10. UPDATE STREAK
        // ==================================================

        await updateStreak(
            req.user._id
        );


        // ==================================================
        // 11. SEND RESPONSE
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

        // ------------------------------------------------
        // Find chat first
        // ------------------------------------------------

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


        // ------------------------------------------------
        // Delete image from Cloudinary
        // ------------------------------------------------

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
                    "⚠️ Cloudinary delete failed:",
                    cloudinaryError
                );

                // Continue deleting MongoDB chat.
            }

        }

        // ------------------------------------------------
        // Delete PDF / FILE from Cloudinary
        // ------------------------------------------------

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
                    cloudinaryError
                );

                // Continue deleting MongoDB chat.
            }

        }


        // ------------------------------------------------
        // Delete chat from MongoDB
        // ------------------------------------------------

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

        const { topic } = req.body;

        if (!topic) {

            return res.status(400).json({

                success: false,

                message: "Topic is required",

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