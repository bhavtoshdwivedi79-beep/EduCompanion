import Chat from "../models/Chat.js";

// Get Chat History
export const getChatHistory = async (req, res) => {

    try {

        const chats = await Chat.find({

            user: req.user._id,

        }).sort({

            createdAt: -1,

        });

        res.status(200).json({

            success: true,

            chats,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to fetch chat history.",

        });

    }

};

// Delete Chat
export const deleteChat = async (req, res) => {

    try {

        const chat = await Chat.findOneAndDelete({

            _id: req.params.id,

            user: req.user._id,

        });

        if (!chat) {

            return res.status(404).json({

                success: false,

                message: "Chat not found",

            });

        }

        res.status(200).json({

            success: true,

            message: "Chat deleted successfully.",

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to delete chat.",

        });

    }

};