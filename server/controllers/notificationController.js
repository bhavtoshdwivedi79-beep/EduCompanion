import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            notifications,
        });

    } catch (error) {
        console.error("❌ Get Notifications Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load notifications",
            error: error.message,
        });
    }
};


export const createNotification = async (req, res) => {
    try {
        const { message, type } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Notification message is required",
            });
        }

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const notification = await Notification.create({
            user: req.user._id,
            message,
            type: type || "info",
        });

        res.status(201).json({
            success: true,
            notification,
        });

    } catch (error) {
        console.error("❌ Create Notification Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create notification",
            error: error.message,
        });
    }
};


export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id },
            { read: true }
        );

        res.json({
            success: true,
        });

    } catch (error) {
        console.error("❌ Mark Notifications Read Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read",
            error: error.message,
        });
    }
};


export const deleteNotification = async (req, res) => {
    try {
        const notification =
            await Notification.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id,
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.json({
            success: true,
            message: "Notification deleted",
        });

    } catch (error) {
        console.error(
            "Delete notification error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
};


export const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({
            user: req.user._id,
        });

        res.json({
            success: true,
        });

    } catch (error) {
        console.error("❌ Clear Notifications Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to clear notifications",
            error: error.message,
        });
    }
};