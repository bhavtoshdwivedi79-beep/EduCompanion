import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/saved-notes",
});

export const saveNote = (topic, notes) => {

    const token = localStorage.getItem("token");

    return API.post(
        "/",
        { topic, notes },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

};

export const getSavedNotes = () => {

    const token = localStorage.getItem("token");

    return API.get("/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

};

export const deleteSavedNote = (id) => {

    const token = localStorage.getItem("token");

    return API.delete(`/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

};