import "./QuizHistory.css";

import { useEffect, useState } from "react";
import { getQuizHistory } from "../services/quizService";

function QuizHistory() {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (

        <div className="history-page">

            <h1 className="history-title">

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

                            <p>

                                🎯 Score:
                                <strong>
                                    {" "}
                                    {quiz.score}/{quiz.totalQuestions}
                                </strong>

                            </p>

                            <p>

                                📊 Accuracy:
                                <strong>
                                    {" "}
                                    {quiz.accuracy}%
                                </strong>

                            </p>

                            <p>

                                📅 {new Date(quiz.createdAt).toLocaleString()}

                            </p>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default QuizHistory;