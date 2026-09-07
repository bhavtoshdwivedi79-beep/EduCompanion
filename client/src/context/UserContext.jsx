import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getProfile } from "../services/profileService";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    // ======================================================
    // FETCH LOGGED-IN USER PROFILE
    // ======================================================

    const fetchUser = async () => {

        const token =
            localStorage.getItem("token");


        // --------------------------------------------------
        // NO TOKEN
        // --------------------------------------------------

        if (!token) {

            console.log(
                "⚠️ No token found"
            );

            setUser(null);

            setLoading(false);

            return null;

        }


        try {

            console.log(
                "👤 Fetching user profile..."
            );


            const response =
                await getProfile();


            console.log(
                "✅ Profile API response:",
                response.data
            );


            // --------------------------------------------------
            // VALIDATE RESPONSE
            // --------------------------------------------------

            if (
                response.data?.success &&
                response.data?.profile
            ) {

                setUser(
                    response.data.profile
                );

                return response.data.profile;

            }


            console.warn(
                "⚠️ Invalid profile response:",
                response.data
            );


            setUser(null);

            return null;


        } catch (error) {

            console.error(
                "❌ Failed to fetch user:",
                error?.response?.data ||
                error.message
            );


            setUser(null);

            return null;


        } finally {

            // VERY IMPORTANT:
            // Loading will always stop,
            // even if API fails.

            setLoading(false);

        }

    };


    // ======================================================
    // FETCH USER WHEN APP STARTS
    // ======================================================

    useEffect(() => {

        fetchUser();

    }, []);


    // ======================================================
    // CONTEXT VALUE
    // ======================================================

    return (

        <UserContext.Provider
            value={{
                user,
                setUser,
                fetchUser,
                loading,
            }}
        >

            {children}

        </UserContext.Provider>

    );

};


// ======================================================
// CUSTOM HOOK
// ======================================================

export const useUser = () => {

    const context =
        useContext(UserContext);


    if (!context) {

        throw new Error(
            "useUser must be used inside UserProvider"
        );

    }


    return context;

};