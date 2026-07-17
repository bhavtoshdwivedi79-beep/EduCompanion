import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/ai",
});

export const sendMessage = (message) => {

    const token = localStorage.getItem("token");

    return API.post(
        "/chat",
        {
            message,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export const getHistory = () => {

    const token = localStorage.getItem("token");

    return API.get("/history", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

};

export const generateNotes = (topic) => {

    const token = localStorage.getItem("token");

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