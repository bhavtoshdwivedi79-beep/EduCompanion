import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const API = "http://localhost:5000/api/notifications";

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // =========================
    // FETCH NOTIFICATIONS
    // =========================
    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get(
                API,
                getAuthConfig()
            );

            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error(
                "Failed to fetch notifications:",
                error.response?.data || error.message
            );
        }
    };

    // =========================
    // ADD NOTIFICATION
    // =========================
    const addNotification = async (
        message,
        type = "note"
    ) => {
        try {
            const { data } = await axios.post(
                API,
                {
                    message,
                    type,
                },
                getAuthConfig()
            );

            if (data.success) {
                setNotifications((prev) => [
                    data.notification,
                    ...prev,
                ]);
            }
        } catch (error) {
            console.error(
                "Failed to create notification:",
                error.response?.data || error.message
            );
        }
    };

    // =========================
    // MARK ALL AS READ
    // =========================
    const markAllRead = async () => {
        try {
            const { data } = await axios.put(
                `${API}/read-all`,
                {},
                getAuthConfig()
            );

            if (data.success) {
                setNotifications((prev) =>
                    prev.map((item) => ({
                        ...item,
                        read: true,
                    }))
                );
            }
        } catch (error) {
            console.error(
                "Failed to mark notifications as read:",
                error.response?.data || error.message
            );
        }
    };

    // =========================
    // DELETE ONE NOTIFICATION
    // =========================
    const deleteNotification = async (id) => {
        try {
            const { data } = await axios.delete(
                `${API}/${id}`,
                getAuthConfig()
            );

            if (data.success) {
                setNotifications((prev) =>
                    prev.filter((item) => item._id !== id)
                );
            }
        } catch (error) {
            console.error(
                "Failed to delete notification:",
                error.response?.data || error.message
            );
        }
    };

    // =========================
    // CLEAR ALL NOTIFICATIONS
    // =========================
    const clearNotifications = async () => {
        try {
            const { data } = await axios.delete(
                `${API}/clear`,
                getAuthConfig()
            );

            if (data.success) {
                setNotifications([]);
            }
        } catch (error) {
            console.error(
                "Failed to clear notifications:",
                error.response?.data || error.message
            );
        }
    };

    // =========================
    // LOAD ON START
    // =========================
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            fetchNotifications();
        }
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                markAllRead,
                deleteNotification,
                clearNotifications,
                fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () =>
    useContext(NotificationContext);