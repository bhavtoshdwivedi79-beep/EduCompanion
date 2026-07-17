import "./Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {

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

                <li onClick={() => setSidebarOpen(false)}>
                    👤 Profile
                </li>

                <li onClick={() => setSidebarOpen(false)}>
                    ⚙ Settings
                </li>

                <li onClick={() => setSidebarOpen(false)}>
                    🚪 Logout
                </li>

            </ul>

        </aside>

    );
}

export default Sidebar;