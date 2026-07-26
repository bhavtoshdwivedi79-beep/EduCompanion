import "./Topbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

function Topbar({ sidebarOpen, setSidebarOpen }) {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const { user } = useUser();

    return (

        <header className="topbar">

            <button
                className="menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                ☰
            </button>

            <input
                type="text"
                placeholder="Search..."
            />

            <div className="topbar-right">

                <button
                    className="theme-btn"
                    onClick={toggleTheme}
                >
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>

                <div className="notification">

                    <button
                        className="bell-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        🔔
                    </button>

                    {showNotifications && (
                        <div className="notification-box">
                            <p>🎉 Welcome to EduCompanion!</p>
                            <p>📝 2 New Notes Generated</p>
                            <p>🔥 Keep your streak alive!</p>
                        </div>
                    )}

                </div>

                <Link to="/profile" className="profile-preview">

                    <img
                        src={
                            user?.avatar ||
                            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        }
                        alt="User"
                    />

                    <span>{user?.name}</span>

                </Link>

            </div>

        </header>

    );
}

export default Topbar;