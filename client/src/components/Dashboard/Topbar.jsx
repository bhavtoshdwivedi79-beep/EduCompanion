import "./Topbar.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Topbar({ sidebarOpen, setSidebarOpen }) {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const [user, setUser] = useState({
        name: "",
        email: "",
    });

    const navigate = useNavigate();

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const token = localStorage.getItem("token");

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

        fetchUser();

    }, []);

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
                            <p>🔥 Keep your streak alive!</p>
                        </div>
                    )}

                </div>

                <Link to="/profile" className="profile-preview">

                    <img
                        src="https://i.pravatar.cc/40"
                        alt="User"
                    />

                    <span>{user?.name}</span>

                </Link>

            </div>

        </header>

    );
}

export default Topbar;