import "./StudyPlanner.css";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

function StudyPlanner() {

    const [formData, setFormData] = useState({
        subject: "",
        topic: "",
        studyDate: "",
        studyTime: "",
        priority: "Medium",
    });

    const [tasks, setTasks] = useState([]);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    const fetchTasks = async () => {

        try {

            const { data } = await axios.get(
                "http://localhost:5000/api/study-planner",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTasks(data.tasks);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        fetchTasks();

    }, []);

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.post(

                "http://localhost:5000/api/study-planner",

                formData,

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            toast.success("📚 Study task added!");

            addNotification(
                `📅 Study Plan added: "${formData.subject} - ${formData.topic}"`
            );

            setFormData({
                subject: "",
                topic: "",
                studyDate: "",
                studyTime: "",
                priority: "Medium",
            });

            fetchTasks();

        } catch (error) {

            toast.error("Failed to add task.");

        }

    };

    const toggleTask = async (id) => {

        try {

            await axios.put(

                `http://localhost:5000/api/study-planner/${id}`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            addNotification("✅ Study task completed");

            fetchTasks();

        } catch (error) {

            console.log(error);

        }

    };

    const deleteTask = async (id) => {

        try {

            await axios.delete(

                `http://localhost:5000/api/study-planner/${id}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            toast.success("🗑 Task deleted");
            addNotification("🗑 Study task deleted");

            fetchTasks();

        } catch (error) {

            console.log(error);

        }

    };

    const completedTasks = tasks.filter(task => task.completed).length;

    const progress =
        tasks.length === 0
            ? 0
            : Math.round((completedTasks / tasks.length) * 100);

    return (

        <div className="planner-page">

            <h1>📅 Study Planner</h1>

            <div className="planner-progress">

                <div className="progress-info">

                    <h3>Today's Progress</h3>

                    <span>

                        {completedTasks} / {tasks.length} Tasks Completed

                    </span>

                </div>

                <div className="progress-bar">

                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>

                </div>

            </div>

            <form
                className="planner-form"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="topic"
                    placeholder="Topic"
                    value={formData.topic}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="studyDate"
                    value={formData.studyDate}
                    onChange={handleChange}
                />

                <input
                    type="time"
                    name="studyTime"
                    value={formData.studyTime}
                    onChange={handleChange}
                />

                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                >

                    <option value="High">🔴 High Priority</option>

                    <option value="Medium">🟡 Medium Priority</option>

                    <option value="Low">🟢 Low Priority</option>

                </select>

                <button type="submit">

                    ➕ Add Task

                </button>

            </form>

            <div className="task-list">

                {

                    tasks.length === 0 ?

                        (

                            <p className="empty">

                                No study tasks yet.

                            </p>

                        )

                        :

                        (

                            tasks.map((task) => (

                                <div
                                    key={task._id}
                                    className={`task-card ${task.completed ? "completed" : ""}`}
                                >

                                    <div>

                                        <div className="task-header">

                                            <h3>{task.subject}</h3>

                                            <span
                                                className={`priority ${task.priority.toLowerCase()}`}
                                            >
                                                {task.priority}
                                            </span>

                                        </div>

                                        <p>{task.topic}</p>

                                        <small>

                                            📅 {new Date(task.studyDate).toLocaleDateString()}

                                        </small>

                                        <br />

                                        <small>

                                            🕒 {task.studyTime}

                                        </small>

                                    </div>

                                    <div className="task-actions">

                                        <button
                                            onClick={() => toggleTask(task._id)}
                                        >

                                            {
                                                task.completed
                                                    ? "↩ Mark Pending"
                                                    : "✔ Mark Complete"
                                            }

                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate("/notes", {
                                                    state: {
                                                        topic: task.topic,
                                                    },
                                                })
                                            }
                                        >
                                            📝 Generate Notes
                                        </button>

                                        <button
                                            onClick={() => deleteTask(task._id)}
                                        >

                                            🗑 Delete

                                        </button>

                                    </div>

                                </div>

                            ))

                        )

                }

            </div>

        </div>

    );

}

export default StudyPlanner;