import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/ai",
});

export const generateQuiz = async (topic) => {

    const token = localStorage.getItem("token");

    const res = await API.post(
        "/quiz",
        { topic },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data.quiz;
};