import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/conversations",
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});

export const getConversations = () => API.get("/");

export const createConversation = () => API.post("/");

export const deleteConversation = (id) => API.delete(`/${id}`);