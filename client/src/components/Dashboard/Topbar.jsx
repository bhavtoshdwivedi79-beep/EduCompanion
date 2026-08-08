import "./Topbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { GraduationCap } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function Topbar({ sidebarOpen, setSidebarOpen }) {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const { user } = useUser();

    const {
        notifications,
        markAllRead
    } = useNotifications();

    const unread =
        notifications.filter(n => !n.read).length;

    return (

        <header className="topbar">

            <button
                className="menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                ☰
            </button>

            <div className="topbar-logo">

                <GraduationCap size={28} />

                <h2>EduCompanion</h2>

            </div>

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
                        onClick={() => {

                            setShowNotifications(!showNotifications);

                            if (!showNotifications) {

                                markAllRead();

                            }

                        }}
                    >

                        🔔

                        {unread > 0 && (

                            <span className="notification-count">

                                {unread}

                            </span>

                        )}

                    </button>

                    {showNotifications && (

                        <div className="notification-box">

                            <div className="notification-header">

                                <h4>Notifications</h4>

                                {notifications.length > 0 && (

                                    <button
                                        className="mark-read-btn"
                                        onClick={markAllRead}
                                    >
                                        Mark all read
                                    </button>

                                )}

                            </div>

                            {notifications.length === 0 ? (

                                <p className="empty-notification">
                                    No notifications yet.
                                </p>

                            ) : (

                                notifications.map((item) => (

                                    <div
                                        key={item._id}
                                        className={`notification-item ${!item.read ? "unread" : ""}`}
                                    >

                                        <p>{item.message}</p>

                                        <small>
                                            {new Date(item.createdAt).toLocaleString()}
                                        </small>

                                    </div>

                                ))

                            )}

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