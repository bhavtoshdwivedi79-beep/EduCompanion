import axios from "axios";

const API_URL = "http://localhost:5000/api/ai";

const API = axios.create({
    baseURL: API_URL,
});


// ===============================
// SEND AI MESSAGE + IMAGE
// ===============================

export const sendMessage = async (
    message,
    conversationId,
    file = null
) => {

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("message", message);

    if (conversationId) {
        formData.append(
            "conversationId",
            conversationId
        );
    }

    if (file) {
        formData.append(
            "file",
            file
        );
    }

    return API.post(
        "/chat",
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// CHAT HISTORY
// ===============================

export const getHistory = async (
    conversationId,
    token
) => {

    return API.get(
        `/history/${conversationId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// GENERATE NOTES
// ===============================

export const generateNotes = (topic) => {

    const token =
        localStorage.getItem("token");

    return API.post(
        "/notes",
        { topic },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// SAVE NOTE
// ===============================

export const saveNote = (topic, notes) => {

    const token =
        localStorage.getItem("token");

    return API.post(
        "/saved-notes",
        {
            topic,
            notes,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// GET SAVED NOTES
// ===============================

export const getSavedNotes = () => {

    const token =
        localStorage.getItem("token");

    return API.get(
        "/saved-notes",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// DELETE SAVED NOTE
// ===============================

export const deleteSavedNote = (id) => {

    const token =
        localStorage.getItem("token");

    return API.delete(
        `/saved-notes/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// GET ALL CHAT HISTORY
// ===============================

export const getChatHistory = () => {

    const token =
        localStorage.getItem("token");

    return API.get(
        "/history",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};


// ===============================
// DELETE CHAT
// ===============================

export const deleteChat = (id) => {

    const token =
        localStorage.getItem("token");

    return API.delete(
        `/chat/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};