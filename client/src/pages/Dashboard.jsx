import "./Dashboard.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState({

        user: {
            name: "",
            email: "",
        },

        notes: 0,
        chats: 0,
        quizzes: 0,
        accuracy: 0,
        streak: 0,
        activities: [],

    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const data = await getDashboardData();

                setDashboard(data);

            } catch (err) {

                console.log(err);

            } finally {

                setLoading(false);

            }

        };

        fetchDashboard();

    }, []);

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading Dashboard...
            </div>
        );

    }

    return (
        <div className="dashboard">

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <div className="dashboard-main">

                <Topbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                <section className="welcome-section">

                    <div className="welcome-text">

                        <h1>

                            Welcome Back,
                            {" "}
                            {dashboard.user.name || "Learner"} 👋

                        </h1>

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

                        <h3>{dashboard.notes}</h3>

                        <p>Notes Created</p>

                    </div>

                    <div className="stat-card">

                        <h2>🤖</h2>

                        <h3>{dashboard.chats}</h3>

                        <p>AI Chats</p>

                    </div>

                    <div className="stat-card">

                        <h2>❓</h2>

                        <h3>{dashboard.quizzes}</h3>

                        <p>Quizzes Taken</p>

                    </div>

                    <div className="stat-card">

                        <h2>🎯</h2>

                        <h3>{dashboard.accuracy}%</h3>

                        <p>Quiz Accuracy</p>

                    </div>

                </section>

                <section className="quick-actions">

                    <h2>⚡ Quick Actions</h2>

                    <div className="action-grid">

                        <div
                            className="action-card"
                            onClick={() => navigate("/chat")}
                        >
                            🤖
                            <h3>Ask AI</h3>
                        </div>

                        <div
                            className="action-card"
                            onClick={() => navigate("/notes")}
                        >
                            📝
                            <h3>Generate Notes</h3>
                        </div>

                        <div
                            className="action-card"
                            onClick={() => navigate("/quiz")}
                        >
                            ❓
                            <h3>Create Quiz</h3>
                        </div>

                        <div
                            className="action-card"
                            onClick={() => navigate("/quiz-history")}
                        >
                            📜
                            <h3>Quiz History</h3>
                        </div>


                        <div
                            className="action-card"
                            onClick={() => navigate("/saved-notes")}
                        >
                            💾
                            <h3>Saved Notes</h3>
                        </div>

                    </div>

                </section>

                <section className="dashboard-grid">

                    <div className="profile-card">

                        <img
                            src="https://i.pravatar.cc/100"
                            alt="Profile"
                        />

                        <h3>

                            {dashboard.user.name}

                        </h3>

                        <p>

                            {dashboard.user.email}

                        </p>

                        <span>

                            Level 4 Learner 🚀

                        </span>

                    </div>

                    <div className="streak-card">

                        <h2>🔥 Daily Streak</h2>

                        <h1>

                            {dashboard.streak} Day
                            {dashboard.streak !== 1 ? "s" : ""}

                        </h1>

                        <p>Keep learning every day!</p>

                    </div>

                    <div className="goal-card">

                        <h2>🎯 Today's Goal</h2>

                        <ul>

                            <li>
                                ✅ Create one AI Note
                            </li>

                            <li>
                                ✅ Complete one Quiz
                            </li>

                            <li>
                                ✅ Ask AI one doubt
                            </li>

                        </ul>

                        <p className="goal-text">

                            Small daily progress builds great skills 🚀

                        </p>

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

                <section className="bottom-grid">

                    <div className="calendar-card">

                        <h2>📅 Calendar</h2>

                        <div className="calendar">

                            <span>Sun</span>
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>

                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                            <span className="today">6</span>
                            <span>7</span>

                            <span>8</span>
                            <span>9</span>
                            <span>10</span>
                            <span>11</span>
                            <span>12</span>
                            <span>13</span>
                            <span>14</span>

                        </div>

                    </div>

                    <div className="chart-card">

                        <h2>📈 Weekly Study Progress</h2>

                        <div className="bars">

                            <div className="bar">
                                <div style={{ height: "60%" }}></div>
                                <p>Mon</p>
                            </div>

                            <div className="bar">
                                <div style={{ height: "80%" }}></div>
                                <p>Tue</p>
                            </div>

                            <div className="bar">
                                <div style={{ height: "50%" }}></div>
                                <p>Wed</p>
                            </div>

                            <div className="bar">
                                <div style={{ height: "95%" }}></div>
                                <p>Thu</p>
                            </div>

                            <div className="bar">
                                <div style={{ height: "70%" }}></div>
                                <p>Fri</p>
                            </div>

                            <div className="bar">
                                <div style={{ height: "90%" }}></div>
                                <p>Sat</p>
                            </div>

                            <div className="bar">
                                <div style={{ height: "40%" }}></div>
                                <p>Sun</p>
                            </div>

                        </div>

                    </div>

                </section>

                <section className="activity">

                    <h2>📈 Recent Activity</h2>

                    <div className="activity-card">

                        {dashboard.activities?.length ? (

                            dashboard.activities.map((item, index) => (

                                <p key={index}>
                                    {item.text}
                                </p>

                            ))

                        ) : (

                            <p>No recent activity.</p>

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Dashboard;