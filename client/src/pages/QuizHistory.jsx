import "./QuizHistory.css";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import {
    getQuizHistory,
    deleteQuiz
} from "../services/quizService";

function QuizHistory() {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteQuizId, setDeleteQuizId] = useState(null);

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const data = await getQuizHistory();

                setQuizzes(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        fetchHistory();

    }, []);

    if (loading) {

        return (

            <div className="history-loading">

                Loading Quiz History...

            </div>

        );

    }

    const handleDelete = async () => {

        try {

            await deleteQuiz(deleteQuizId);

            toast.success("Quiz deleted successfully!");

            setDeleteQuizId(null);

            const data = await getQuizHistory();

            setQuizzes(data);

        } catch (error) {

            toast.error("Failed to delete quiz.");

            console.log(error);

        }

    };

    return (

        <div className="quiz-history-page">
            <Toaster position="top-right" />

            <h1 className="quiz-history-title">

                📜 Quiz History

            </h1>

            {quizzes.length === 0 ? (

                <h2 className="history-empty">

                    No quizzes attempted yet.

                </h2>

            ) : (

                <div className="history-grid">

                    {quizzes.map((quiz) => (

                        <div
                            key={quiz._id}
                            className="history-card"
                        >

                            <h2>

                                🧠 {quiz.topic}

                            </h2>

                            <div className="history-info">

                                <div className="info-row">
                                    <span className="info-icon">🎯</span>
                                    <span className="info-label">Score</span>

                                    <strong className="info-value">
                                        {quiz.score}/{quiz.totalQuestions}
                                    </strong>
                                </div>

                                <div className="info-row">
                                    <span className="info-icon">📊</span>
                                    <span className="info-label">Accuracy</span>

                                    <strong className="info-value">
                                        {quiz.accuracy}%
                                    </strong>
                                </div>

                                <div className="info-row">
                                    <span className="info-icon">🗓️</span>

                                    <span className="info-label">
                                        Date
                                    </span>

                                    <strong className="info-value date-value">
                                        {new Date(quiz.createdAt).toLocaleString()}
                                    </strong>
                                </div>

                            </div>

                            <div className="history-buttons">

                                <button
                                    className="delete-btn"
                                    onClick={() => setDeleteQuizId(quiz._id)}
                                >
                                    🗑 Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {
                deleteQuizId && (

                    <div
                        className="delete-overlay"
                        onClick={() => setDeleteQuizId(null)}
                    >

                        <div
                            className="delete-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <h2>🗑 Delete Quiz?</h2>

                            <p>

                                Are you sure you want to delete this quiz history?

                                <br />

                                This action cannot be undone.

                            </p>

                            <div className="delete-actions">

                                <button
                                    className="cancel-btn"
                                    onClick={() => setDeleteQuizId(null)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="confirm-btn"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

export default QuizHistory;