import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/ai",
});

export const sendMessage = (message, history) =>
    API.post("/chat", {
        message,
        history,
    });