import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/profile",
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {

        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

});

export const uploadAvatar = (formData) => {

    return API.post("/avatar", formData);

};

export const removeAvatar = () => {

    return API.delete("/avatar");

};

export const getProfile = () => {

    return API.get("/");

};