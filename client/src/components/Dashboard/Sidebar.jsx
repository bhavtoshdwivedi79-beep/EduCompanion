import "./Sidebar.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

                <Link to="/dashboard">
                    <li onClick={() => setSidebarOpen(false)}>
                        🏠 Dashboard
                    </li>
                </Link>

                <Link to="/chat">
                    <li onClick={() => setSidebarOpen(false)}>
                        🤖 AI Chat
                    </li>
                </Link>

                <Link to="/notes">
                    <li onClick={() => setSidebarOpen(false)}>
                        📝 Smart Notes
                    </li>
                </Link>

                <Link to="/quiz">
                    <li onClick={() => setSidebarOpen(false)}>
                        ❓ AI Quiz
                    </li>
                </Link>

                <Link to="/saved-notes">
                    <li onClick={() => setSidebarOpen(false)}>
                        💾 Saved Notes
                    </li>
                </Link>

                <Link to="/chat-history">
                    <li onClick={() => setSidebarOpen(false)}>
                        💬 Chat History
                    </li>
                </Link>

                <Link to="/quiz-history">
                    <li onClick={() => setSidebarOpen(false)}>
                        📜 Quiz History
                    </li>
                </Link>

                <Link to="/profile">
                    <li onClick={() => setSidebarOpen(false)}>
                        👤 Profile
                    </li>
                </Link>

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