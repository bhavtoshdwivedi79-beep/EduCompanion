import Conversation from "../models/Conversation.js";
import Chat from "../models/Chat.js";

// Create New Conversation
export const createConversation = async (req, res) => {

    try {

        const conversation = await Conversation.create({

            user: req.user._id,
            title: "New Chat"

        });

        res.status(201).json({

            success: true,
            conversation

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Failed to create conversation"

        });

    }

};


// Get All Conversations
export const getConversations = async (req, res) => {

    try {

        const conversations = await Conversation.find({

            user: req.user._id

        }).sort({

            updatedAt: -1

        });

        res.json({

            success: true,
            conversations

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Failed"

        });

    }

};


// Delete Conversation
export const deleteConversation = async (req, res) => {

    try {

        const conversation = await Conversation.findOne({

            _id: req.params.id,
            user: req.user._id,

        });

        if (!conversation) {

            return res.status(404).json({

                success: false,
                message: "Conversation not found",

            });

        }

        await Chat.deleteMany({

            conversation: conversation._id,

        });

        await Conversation.findByIdAndDelete(conversation._id);

        res.json({

            success: true,
            message: "Conversation deleted successfully",

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error",

        });

    }

};

export const renameConversation = async (req, res) => {

    try {

        const { title } = req.body;

        if (!title || title.trim() === "") {

            return res.status(400).json({

                success: false,
                message: "Title is required",

            });

        }

        const conversation = await Conversation.findOne({

            _id: req.params.id,
            user: req.user._id,

        });

        if (!conversation) {

            return res.status(404).json({

                success: false,
                message: "Conversation not found",

            });

        }

        conversation.title = title;

        await conversation.save();

        res.json({

            success: true,
            conversation,

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: "Server Error",

        });

    }

};