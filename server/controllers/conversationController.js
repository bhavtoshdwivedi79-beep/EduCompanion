import Conversation from "../models/Conversation.js";

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

        await Conversation.findOneAndDelete({

            _id: req.params.id,
            user: req.user._id

        });

        res.json({

            success: true

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false

        });

    }

};