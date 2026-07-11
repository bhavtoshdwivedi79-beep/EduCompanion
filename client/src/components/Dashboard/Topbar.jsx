import "./Topbar.css";
import { useState } from "react";

function Topbar({ sidebarOpen, setSidebarOpen }) {

    const [showNotifications, setShowNotifications] = useState(false);

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

                <button className="theme-btn">
                    🌙
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

                            <p>🔥 Keep your 15-day streak alive!</p>

                        </div>

                    )}

                </div>

                <img
                    src="https://i.pravatar.cc/40"
                    alt="User"
                />

            </div>

        </header>

    );
}

export default Topbar;