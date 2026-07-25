import "./Sidebar.css";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutModal from "../LogoutModal/LogoutModal";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navigate = useNavigate();

    const handleLogout = () => {

        setShowLogoutModal(false);

        localStorage.removeItem("token");

        toast.success("👋 Logged out successfully!");

        navigate("/login");

    };

    return (

        <aside className={sidebarOpen ? "sidebar active" : "sidebar"}>

            <h2 className="sidebar-logo">
                EduCompanion
            </h2>

            <ul>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => isActive ? "active-link" : ""}
                >
                    <li>🏠 Dashboard</li>
                </NavLink>

                <NavLink
                    to="/chat"
                    className={({ isActive }) => isActive ? "active-link" : ""}
                >
                    <li>🤖 AI Chat</li>
                </NavLink>

                <NavLink
                    to="/notes"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>📝 Smart Notes</li>
                </NavLink>

                <NavLink
                    to="/quiz"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>❓ AI Quiz</li>
                </NavLink>

                <NavLink
                    to="/saved-notes"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>💾 Saved Notes</li>
                </NavLink>

                <NavLink
                    to="/chat-history"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        💬 Chat History
                    </li>
                </NavLink>

                <NavLink to="/quiz-history" className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        📜 Quiz History
                    </li>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        👤 Profile
                    </li>
                </NavLink>

                <li onClick={() => setSidebarOpen(false)}>
                    ⚙ Settings
                </li>

            </ul>

            <div className="sidebar-bottom">

                <button
                    className="logout-btn"
                    onClick={() => setShowLogoutModal(true)}
                >

                    <span>🚪</span>

                    Logout

                </button>

            </div>

            <LogoutModal

                isOpen={showLogoutModal}

                onClose={() => setShowLogoutModal(false)}

                onConfirm={handleLogout}

            />

        </aside>

    );
}

export default Sidebar;