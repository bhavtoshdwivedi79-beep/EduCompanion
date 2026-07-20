import axios from "axios";

const aiAPI = axios.create({
    baseURL: "http://localhost:5000/api/ai",
});

const quizAPI = axios.create({
    baseURL: "http://localhost:5000/api/quiz",
});

export const generateQuiz = async (topic) => {

    const token = localStorage.getItem("token");

    const res = await aiAPI.post(
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

export const saveQuizResult = async (quizData) => {

    const token = localStorage.getItem("token");

    const res = await quizAPI.post(
        "/save",
        quizData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data;
};