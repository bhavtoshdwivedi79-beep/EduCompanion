import "./Quiz.css";

import { useState } from "react";
import Confetti from "react-confetti";
import { generateQuiz } from "../services/quizService";

function Quiz() {

    const [topic, setTopic] = useState("");
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleGenerate = async () => {

        if (!topic.trim()) {
            setError("Please enter a topic.");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const data = await generateQuiz(topic);

            setQuiz(data);
            setAnswers({});
            setSubmitted(false);
            setScore(0);

        } catch (err) {

            setError("Failed to generate quiz.");

        } finally {

            setLoading(false);

        }

    };

    const handleOption = (index, option) => {

        setAnswers((prev) => ({
            ...prev,
            [index]: option,
        }));

    };

    const handleSubmit = () => {

        let marks = 0;

        quiz.forEach((q, index) => {

            if (answers[index] === q.answer) {
                marks++;
            }

        });

        setScore(marks);
        setSubmitted(true);

    };

    return (

        <div className="quiz-page">

            <h1 className="quiz-title">
                🧠 AI Quiz Generator
            </h1>

            <p className="quiz-subtitle">
                Generate AI-powered MCQ quizzes instantly.
            </p>

            <div className="quiz-top">

                <div className="quiz-form">

                    <input
                        type="text"
                        placeholder="Enter topic..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                </div>

                <button
                    className="quiz-btn"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Generate Quiz"}
                </button>

                {error && <p className="quiz-error">{error}</p>}

            </div>

            {quiz.length > 0 && (

                <>

                    <div className="progress-box">

                        <div
                            className="progress-fill"
                            style={{
                                width: `${(Object.keys(answers).length / quiz.length) * 100}%`,
                            }}
                        />

                    </div>

                    <p className="progress-text">
                        Answered {Object.keys(answers).length} / {quiz.length}
                    </p>

                    {quiz.length > 0 && (

                        <div className="quiz-list">

                            {quiz.map((q, index) => (

                                <div
                                    key={index}
                                    className="quiz-card"
                                >

                                    <h3>
                                        Q{index + 1}. {q.question}
                                    </h3>

                                    {submitted && (
                                        <p
                                            className={
                                                answers[index] === q.answer
                                                    ? "status correct-status"
                                                    : "status wrong-status"
                                            }
                                        >
                                            {answers[index] === q.answer
                                                ? "✅ Correct"
                                                : `❌ Correct Answer: ${q.answer}`}
                                        </p>
                                    )}

                                    <div className="options">

                                        {q.options.map((option, i) => (

                                            <button
                                                key={i}
                                                className={`option-btn
                                                    ${answers[index] === option ? "selected" : ""}
                                                    ${submitted &&
                                                        option === q.answer
                                                        ? "correct"
                                                        : ""
                                                    }
                                                    ${submitted &&
                                                        answers[index] === option &&
                                                        option !== q.answer
                                                        ? "wrong"
                                                        : ""
                                                    }`}
                                                onClick={() => handleOption(index, option)}
                                                disabled={submitted}
                                            >
                                                {option}
                                            </button>

                                        ))}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                    {submitted && score >= 8 && <Confetti recycle={false} />}

                    {!submitted ? (

                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                        >

                            Submit Quiz

                        </button>

                    ) : (

                        <div className="result-box">

                            <div className="result-header">

                                🏆 Quiz Completed

                            </div>

                            <div className="score-circle">

                                <h1>

                                    {Math.round((score / quiz.length) * 100)}%

                                </h1>

                                <span>

                                    Score

                                </span>

                            </div>

                            <div className="score-detail">

                                <div>

                                    ✅ Correct

                                    <strong>{score}</strong>

                                </div>

                                <div>

                                    ❌ Wrong

                                    <strong>{quiz.length - score}</strong>

                                </div>

                            </div>

                            <div className="performance">

                                {score >= 9
                                    ? "🌟 Outstanding!"
                                    : score >= 7
                                        ? "🎉 Excellent!"
                                        : score >= 5
                                            ? "👍 Good Job!"
                                            : "📚 Keep Practicing!"}

                            </div>

                            <p className="performance-msg">

                                {score >= 9
                                    ? "You mastered this topic."
                                    : score >= 7
                                        ? "Very impressive performance!"
                                        : score >= 5
                                            ? "A little more practice and you'll master it."
                                            : "Review the incorrect answers and try again."}

                            </p>

                            <div className="result-buttons">

                                <button
                                    className="restart-btn"
                                    onClick={() => {

                                        setAnswers({});
                                        setSubmitted(false);
                                        setScore(0);

                                    }}
                                >

                                    🔄 Retry Quiz

                                </button>

                                <button
                                    className="new-btn"
                                    onClick={() => {

                                        setQuiz([]);
                                        setTopic("");
                                        setAnswers({});
                                        setSubmitted(false);
                                        setScore(0);

                                    }}
                                >

                                    ✨ New Quiz

                                </button>

                            </div>

                        </div>

                    )}


                </>

            )}

        </div>

    );

}

export default Quiz;