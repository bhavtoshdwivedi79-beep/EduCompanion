import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();

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

                <li onClick={() => setSidebarOpen(false)}>
                    👤 Profile
                </li>

                <li onClick={() => setSidebarOpen(false)}>
                    ⚙ Settings
                </li>

            </ul>

            <div className="sidebar-bottom">

                <button
                    className="logout-btn"
                    onClick={() => {

                        localStorage.removeItem("token");
                        navigate("/login");

                    }}
                >

                    <span>🚪</span>

                    Logout

                </button>

            </div>

        </aside>

    );
}

export default Sidebar;