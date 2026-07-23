import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

function MainLayout() {

    const location = useLocation();

    const dashboardRoutes = [
        "/dashboard",
        "/chat",
        "/notes",
        "/quiz",
        "/saved-notes",
        "/quiz-history",
        "/chat-history",
    ];

    const hideNavbar = dashboardRoutes.includes(location.pathname);

    return (
        <>
            {!hideNavbar && <Navbar />}

            <Outlet />
        </>
    );
}

export default MainLayout;