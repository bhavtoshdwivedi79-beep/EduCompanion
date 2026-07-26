import "./Sidebar.css";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LogoutModal from "../LogoutModal/LogoutModal";
import { HiOutlineBars3 } from "react-icons/hi2";

function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
}) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navigate = useNavigate();

    const handleLogout = () => {

        setShowLogoutModal(false);

        localStorage.removeItem("token");

        toast.success("👋 Logged out successfully!");

        navigate("/login");

    };

    return (

        <aside
            className={`sidebar ${sidebarOpen ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
        >

            <h2 className="sidebar-logo">

                {collapsed ? "🎓" : "EduCompanion"}

            </h2>

            <div className="collapse-wrapper">

                <button
                    className={`collapse-btn ${collapsed ? "rotate" : ""}`}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <HiOutlineBars3 />
                </button>

            </div>

            <ul>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => isActive ? "active-link" : ""}
                >
                    <li>
                        <span>🏠</span>
                        {!collapsed && <span>Dashboard</span>}
                    </li>
                </NavLink>

                <NavLink
                    to="/chat"
                    className={({ isActive }) => isActive ? "active-link" : ""}
                >
                    <li>
                        <span>🏠</span>
                        {!collapsed && <span>AI Chat</span>}
                    </li>
                </NavLink>

                <NavLink
                    to="/notes"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        <span>📝</span>
                        {!collapsed && <span>Smart Notes</span>}

                    </li>
                </NavLink>

                <NavLink
                    to="/quiz"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        <span>❓</span>
                        {!collapsed && <span>AI Quiz</span>}
                    </li>
                </NavLink>

                <NavLink
                    to="/saved-notes"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        <span>💾</span>
                        {!collapsed && <span>Saved Notes</span>}
                    </li>
                </NavLink>

                <NavLink
                    to="/chat-history"
                    className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        <span>💬</span>
                        {!collapsed && <span>Chat History</span>}
                    </li>
                </NavLink>

                <NavLink to="/quiz-history" className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        <span>📜</span>
                        {!collapsed && <span>Quiz History</span>}
                    </li>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => isActive ? "active-link" : ""}>
                    <li>
                        <span>👤</span>
                        {!collapsed && <span>Profile</span>}
                    </li>
                </NavLink>

                <NavLink onClick={() => setSidebarOpen(false)}>
                    <li>
                        <span>⚙</span> 
                        {!collapsed && <span>Settings</span>}</li>
                </NavLink>

            </ul>

            <div className="sidebar-bottom">

                <button
                    className="logout-btn"
                    onClick={() => setShowLogoutModal(true)}
                >

                    <span>🚪</span>
                    {!collapsed && "Logout"}

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