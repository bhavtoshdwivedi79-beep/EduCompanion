import axios from "axios";

const API = "http://localhost:5000/api/recycle-bin";

const getToken = () => localStorage.getItem("token");


// ==================================================
// GET RECYCLE BIN
// ==================================================

export const getRecycleBin = async () => {

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


// ==================================================
// RESTORE ITEM
// ==================================================

export const restoreRecycleBinItem = async (type, id) => {

    const response = await axios.patch(

        `${API}/${type}/${id}/restore`,

        {},

        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }

    );

    return response.data;

};


// ==================================================
// PERMANENTLY DELETE ITEM
// ==================================================

export const permanentlyDeleteRecycleBinItem = async (type, id) => {

    const response = await axios.delete(

        `${API}/${type}/${id}`,

        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }

    );

    return response.data;

};