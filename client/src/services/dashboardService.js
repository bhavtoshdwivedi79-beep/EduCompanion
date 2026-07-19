import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/dashboard",
});

export const getDashboardData = async () => {

    const token = localStorage.getItem("token");

    const res = await API.get("/", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data.dashboard;
};