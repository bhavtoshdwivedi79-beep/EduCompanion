import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <h2 className="sidebar-logo">
        EduCompanion
      </h2>

      <ul>

        <li>🏠 Dashboard</li>
        <li>🤖 AI Chat</li>
        <li>📝 Smart Notes</li>
        <li>❓ AI Quiz</li>
        <li>📅 Study Planner</li>
        <li>👤 Profile</li>
        <li>⚙ Settings</li>
        <li>🚪 Logout</li>

      </ul>

    </aside>
  );
}

export default Sidebar;