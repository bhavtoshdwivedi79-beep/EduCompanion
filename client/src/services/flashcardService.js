import axios from "axios";

const API = "http://localhost:5000/api/flashcards";

const getToken = () => localStorage.getItem("token");

// Generate Flashcards
export const generateFlashcards = async (topic) => {

    const response = await axios.post(

        `${API}/generate`,

        { topic },

        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }

    );

    return response.data;

};

// Get All Saved Flashcards
export const getFlashcards = async () => {

    const response = await axios.get(

        API,

        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }

    );

    return response.data;

};

// Delete Flashcard
export const deleteFlashcard = async (id) => {

    const response = await axios.delete(

        `${API}/${id}`,

        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }

    );

    return response.data;

};