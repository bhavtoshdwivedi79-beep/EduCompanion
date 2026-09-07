import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/pdf",
});

/* ================= AUTH ================= */

const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/* ================= PDF NOTES ================= */

export const generatePDFNotes = async (pdfFile) => {

    const formData = new FormData();

    formData.append("pdf", pdfFile);

    const res = await API.post(
        "/notes",
        formData,
        getConfig()
    );

    return res.data;
};

/* ================= PDF QUIZ ================= */

export const generatePDFQuiz = async (
    pdfFile,
    previousQuestions = []
) => {

    const formData = new FormData();

    formData.append("pdf", pdfFile);

    formData.append(
        "previousQuestions",
        JSON.stringify(previousQuestions)
    );

    const res = await API.post(
        "/quiz",
        formData,
        getConfig()
    );

    return res.data;
};