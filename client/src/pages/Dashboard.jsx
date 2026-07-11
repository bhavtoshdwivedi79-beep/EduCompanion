import "./Dashboard.css";

import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";

function Dashboard() {
    return (
        <div className="dashboard">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />
                <section className="welcome-section">

                    <div className="welcome-text">

                        <h1>Welcome Back, Bhavtosh 👋</h1>

                        <p>
                            Continue your learning journey with AI-powered tools.
                        </p>

                        <button className="start-btn">
                            Continue Learning
                        </button>

                    </div>

                    <div className="welcome-image">

                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            alt="Student"
                        />

                    </div>

                </section>

                <section className="stats">

                    <div className="stat-card">

                        <h2>📚</h2>

                        <h3>24</h3>

                        <p>Notes Created</p>

                    </div>

                    <div className="stat-card">

                        <h2>🤖</h2>

                        <h3>86</h3>

                        <p>AI Chats</p>

                    </div>

                    <div className="stat-card">

                        <h2>❓</h2>

                        <h3>18</h3>

                        <p>Quizzes Taken</p>

                    </div>

                    <div className="stat-card">

                        <h2>⏳</h2>

                        <h3>52</h3>

                        <p>Study Hours</p>

                    </div>

                </section>

                <section className="quick-actions">

                    <h2>⚡ Quick Actions</h2>

                    <div className="action-grid">

                        <div className="action-card">
                            🤖
                            <h3>Ask AI</h3>
                        </div>

                        <div className="action-card">
                            📝
                            <h3>Generate Notes</h3>
                        </div>

                        <div className="action-card">
                            ❓
                            <h3>Create Quiz</h3>
                        </div>

                        <div className="action-card">
                            📅
                            <h3>Study Planner</h3>
                        </div>

                    </div>

                </section>

                <section className="dashboard-grid">

                    <div className="profile-card">

                        <img
                            src="https://i.pravatar.cc/100"
                            alt="Profile"
                        />

                        <h3>Bhavtosh Dwivedi</h3>

                        <p>B.Tech CSE (Data Science)</p>

                        <span>Level 4 Learner 🚀</span>

                    </div>

                    <div className="streak-card">

                        <h2>🔥 Daily Streak</h2>

                        <h1>15 Days</h1>

                        <p>Keep learning every day!</p>

                    </div>

                    <div className="goal-card">

                        <h2>🎯 Today's Goal</h2>

                        <ul>

                            <li>✅ Complete React Dashboard</li>

                            <li>⬜ Study Node.js</li>

                            <li>⬜ Solve 2 DSA Problems</li>

                        </ul>

                    </div>

                </section>

                <section className="progress-section">

                    <h2>📚 Learning Progress</h2>

                    <div className="progress-card">

                        <p>Web Development</p>

                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: "75%" }}></div>
                        </div>

                        <p>75% Completed</p>

                    </div>

                </section>

                <section className="activity">

                    <h2>📈 Recent Activity</h2>

                    <div className="activity-card">

                        <p>✅ AI Quiz completed</p>

                        <p>📝 Notes generated</p>

                        <p>🤖 Asked AI about React Hooks</p>

                        <p>📅 Study Planner updated</p>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Dashboard;