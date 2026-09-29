import { Outlet, useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

function MainLayout() {

    const location = useLocation();

    const dashboardRoutes = [
        "/dashboard",
        "/chat",
        "/notes",
        "/quiz",
        "/pdf-study-assistant",
        "/saved-notes",
        "/quiz-history",
        "/chat-history",
        "/study-planner",
        "/flashcards",
        "/flashcard-history",
        "/profile",
        "/recycle-bin",
    ];

    const hideNavbar = dashboardRoutes.includes(location.pathname);

    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return (
        <>
            {!hideNavbar && <Navbar />}

            <Outlet />
        </>
    );
}

export default MainLayout;