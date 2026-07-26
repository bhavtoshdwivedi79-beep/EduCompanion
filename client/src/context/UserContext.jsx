import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const fetchUser = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) return;

            const { data } = await axios.get(
                "http://localhost:5000/api/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUser(data.profile);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchUser();

    }, []);

    return (

        <UserContext.Provider
            value={{
                user,
                setUser,
                fetchUser,
            }}
        >

            {children}

        </UserContext.Provider>

    );

};

export const useUser = () => useContext(UserContext);