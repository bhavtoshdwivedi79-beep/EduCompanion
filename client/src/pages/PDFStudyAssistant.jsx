import "./PDFStudyAssistant.css";

import { useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import toast from "react-hot-toast";

import {
    generatePDFNotes,
    generatePDFQuiz,
} from "../services/pdfService";

import { useNotifications } from "../context/NotificationContext";

function PDFStudyAssistant() {

    /* ================= STATES ================= */

    const [pdfFile, setPdfFile] = useState(null);

    const [notes, setNotes] = useState("");

    const [quiz, setQuiz] = useState([]);

    const [answers, setAnswers] = useState({});

    const [score, setScore] = useState(0);

    const [submitted, setSubmitted] = useState(false);

    const [loading, setLoading] = useState(false);

    const [mode, setMode] = useState("");

    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    const { addNotification } = useNotifications();


    /* ================= FILE SELECT ================= */

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        if (!file) return;


        if (file.type !== "application/pdf") {

            toast.error("Please select a PDF file.");

            event.target.value = "";

            return;

        }


        const maxSize = 20 * 1024 * 1024;

        if (file.size > maxSize) {

            toast.error("PDF size must be less than 20 MB.");

            event.target.value = "";

            return;

        }


        setPdfFile(file);

        setNotes("");

        setQuiz([]);

        setAnswers({});

        setSubmitted(false);

        setScore(0);

        setError("");

    };


    /* ================= REMOVE PDF ================= */

    const removePDF = () => {

        setPdfFile(null);

        setNotes("");

        setQuiz([]);

        setAnswers({});

        setSubmitted(false);

        setScore(0);

        setError("");

        setMode("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

    };


    /* ================= FORMAT FILE SIZE ================= */

    const formatFileSize = (bytes) => {

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    };


    /* ================= GENERATE NOTES ================= */

    const handleGenerateNotes = async () => {

        if (!pdfFile) {

            toast.error("Please upload a PDF first.");

            return;

        }


        try {

            setLoading(true);

            setMode("notes");

            setError("");

            setNotes("");

            setQuiz([]);

            setAnswers({});

            setSubmitted(false);

            setScore(0);


            const toastId = toast.loading(
                "📚 Generating notes from PDF..."
            );


            const data = await generatePDFNotes(pdfFile);


            setNotes(data.notes || "");


            toast.success(
                "📚 PDF notes generated successfully!",
                {
                    id: toastId,
                }
            );


            addNotification(
                `📝 Notes generated from "${pdfFile.name}"`
            );


        } catch (err) {

            console.error(
                "PDF Notes Error:",
                err
            );


            const message =
                err?.response?.data?.message ||
                "Failed to generate PDF notes.";


            setError(message);


            toast.error(message);

        } finally {

            setLoading(false);

        }

    };


    /* ================= GENERATE QUIZ ================= */

    const handleGenerateQuiz = async (
        retry = false
    ) => {

        if (!pdfFile) {

            toast.error("Please upload a PDF first.");

            return;

        }


        try {

            setLoading(true);

            setMode("quiz");

            setError("");

            setNotes("");

            setSubmitted(false);

            setScore(0);

            setAnswers({});


            const previousQuestions = retry
                ? quiz.map((q) => q.question)
                : [];


            const toastId = toast.loading(
                retry
                    ? "🔄 Generating fresh questions..."
                    : "🧠 Generating quiz from PDF..."
            );


            const data = await generatePDFQuiz(
                pdfFile,
                previousQuestions
            );


            const newQuiz = data.quiz || [];


            if (!newQuiz.length) {

                throw new Error(
                    "No quiz questions were generated."
                );

            }


            setQuiz(newQuiz);


            toast.success(
                retry
                    ? "🔄 Fresh quiz generated!"
                    : "🧠 PDF quiz generated successfully!",
                {
                    id: toastId,
                }
            );


            addNotification(
                retry
                    ? `🔄 New quiz generated from "${pdfFile.name}"`
                    : `🧠 Quiz generated from "${pdfFile.name}"`
            );


        } catch (err) {

            console.error(
                "PDF Quiz Error:",
                err
            );


            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to generate PDF quiz.";


            setError(message);


            toast.error(message);

        } finally {

            setLoading(false);

        }

    };


    /* ================= SELECT ANSWER ================= */

    const handleOption = (
        questionIndex,
        option
    ) => {

        if (submitted) return;


        setAnswers((prev) => ({

            ...prev,

            [questionIndex]: option,

        }));

    };


    /* ================= SUBMIT QUIZ ================= */

    const handleSubmit = () => {

        if (!quiz.length) return;


        if (
            Object.keys(answers).length !==
            quiz.length
        ) {

            toast.error(
                "Please answer all questions before submitting."
            );

            return;

        }


        let marks = 0;


        quiz.forEach((question, index) => {

            if (
                answers[index] ===
                question.answer
            ) {

                marks++;

            }

        });


        setScore(marks);

        setSubmitted(true);


        const accuracy = Math.round(
            (marks / quiz.length) * 100
        );


        toast.success(
            `🏆 Quiz completed! Score: ${marks}/${quiz.length}`
        );


        addNotification(
            `🧠 PDF Quiz completed (${marks}/${quiz.length})`
        );

    };


    /* ================= NEW QUIZ ================= */

    const handleNewQuiz = () => {

        setQuiz([]);

        setAnswers({});

        setSubmitted(false);

        setScore(0);

        setError("");

    };


    /* ================= RENDER ================= */

    return (

        <div className="pdf-study-page">

            {/* ================= HEADER ================= */}

            <div className="pdf-study-header">

                <div className="pdf-icon">
                    📄
                </div>

                <div>

                    <h1>
                        PDF Study Assistant
                    </h1>

                    <p>
                        Upload your PDF and turn it into
                        concise notes or an interactive quiz.
                    </p>

                </div>

            </div>


            {/* ================= UPLOAD CARD ================= */}

            <div className="pdf-upload-card">

                {!pdfFile ? (

                    <>

                        <div className="upload-icon">
                            📄
                        </div>

                        <h2>
                            Upload your PDF
                        </h2>

                        <p>
                            Choose a PDF file up to 20 MB
                        </p>

                        <button
                            className="choose-pdf-btn"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                        >
                            📎 Choose PDF
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            hidden
                        />

                    </>

                ) : (

                    <div className="selected-pdf">

                        <div className="pdf-file-icon">
                            📕
                        </div>

                        <div className="pdf-file-info">

                            <h3>
                                {pdfFile.name}
                            </h3>

                            <p>
                                {formatFileSize(pdfFile.size)}
                            </p>

                        </div>

                        <button
                            className="remove-pdf-btn"
                            onClick={removePDF}
                            title="Remove PDF"
                        >
                            ✕
                        </button>

                    </div>

                )}

            </div>


            {/* ================= ACTION BUTTONS ================= */}

            {pdfFile && (

                <div className="pdf-action-section">

                    <button
                        className="pdf-action-btn notes-action"
                        onClick={handleGenerateNotes}
                        disabled={loading}
                    >

                        <span>
                            📝
                        </span>

                        <div>

                            <strong>
                                Generate Notes
                            </strong>

                            <small>
                                Get concise study notes
                            </small>

                        </div>

                    </button>


                    <button
                        className="pdf-action-btn quiz-action"
                        onClick={() =>
                            handleGenerateQuiz(false)
                        }
                        disabled={loading}
                    >

                        <span>
                            🧠
                        </span>

                        <div>

                            <strong>
                                Generate Quiz
                            </strong>

                            <small>
                                Test yourself with MCQs
                            </small>

                        </div>

                    </button>

                </div>

            )}


            {/* ================= LOADING ================= */}

            {loading && (

                <div className="pdf-loading">

                    <div className="loader"></div>

                    <p>
                        {mode === "notes"
                            ? "AI is reading your PDF and preparing concise notes..."
                            : "AI is creating questions from your PDF..."
                        }
                    </p>

                </div>

            )}


            {/* ================= ERROR ================= */}

            {error && !loading && (

                <div className="pdf-error">
                    ⚠️ {error}
                </div>

            )}


            {/* ================= NOTES ================= */}

            {notes && !loading && (

                <div className="pdf-result-card">

                    <div className="result-card-header">

                        <div>

                            <h2>
                                📝 PDF Notes
                            </h2>

                            <p>
                                Concise notes generated from your PDF
                            </p>

                        </div>

                        <button
                            className="clear-result-btn"
                            onClick={() =>
                                setNotes("")
                            }
                        >
                            ✕
                        </button>

                    </div>


                    <div className="pdf-notes-content">

                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                        >
                            {notes}
                        </ReactMarkdown>

                    </div>

                </div>

            )}


            {/* ================= QUIZ ================= */}

            {quiz.length > 0 && !loading && (

                <div className="pdf-quiz-section">

                    <div className="pdf-quiz-header">

                        <div>

                            <h2>
                                🧠 PDF Quiz
                            </h2>

                            <p>
                                Answer the questions based on your PDF.
                            </p>

                        </div>

                        <div className="question-count">
                            {quiz.length} Questions
                        </div>

                    </div>


                    {/* PROGRESS */}

                    <div className="pdf-progress-container">

                        <div className="pdf-progress-bar">

                            <div
                                className="pdf-progress-fill"
                                style={{
                                    width: `${(
                                        Object.keys(answers).length /
                                        quiz.length
                                    ) * 100}%`,
                                }}
                            />

                        </div>

                        <span>
                            {Object.keys(answers).length}
                            {" / "}
                            {quiz.length} answered
                        </span>

                    </div>


                    {/* QUESTIONS */}

                    <div className="pdf-question-list">

                        {quiz.map((q, index) => (

                            <div
                                className="pdf-question-card"
                                key={index}
                            >

                                <h3>
                                    Q{index + 1}.{" "}
                                    {q.question}
                                </h3>


                                {submitted && (

                                    <p
                                        className={
                                            answers[index] ===
                                            q.answer
                                                ? "pdf-answer-status correct"
                                                : "pdf-answer-status wrong"
                                        }
                                    >

                                        {answers[index] ===
                                        q.answer

                                            ? "✅ Correct"

                                            : `❌ Correct Answer: ${q.answer}`}

                                    </p>

                                )}


                                <div className="pdf-options">

                                    {q.options.map(
                                        (option, optionIndex) => (

                                            <button
                                                key={optionIndex}
                                                className={`
                                                    pdf-option-btn
                                                    ${
                                                        answers[index] ===
                                                        option
                                                            ? "selected"
                                                            : ""
                                                    }
                                                    ${
                                                        submitted &&
                                                        option ===
                                                        q.answer
                                                            ? "correct"
                                                            : ""
                                                    }
                                                    ${
                                                        submitted &&
                                                        answers[index] ===
                                                        option &&
                                                        option !==
                                                        q.answer
                                                            ? "wrong"
                                                            : ""
                                                    }
                                                `}
                                                onClick={() =>
                                                    handleOption(
                                                        index,
                                                        option
                                                    )
                                                }
                                                disabled={submitted}
                                            >
                                                {option}
                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        ))}

                    </div>


                    {/* QUIZ RESULT */}

                    {submitted ? (

                        <div className="pdf-result-box">

                            <div className="pdf-result-icon">
                                🏆
                            </div>

                            <h2>
                                Quiz Completed
                            </h2>

                            <div className="pdf-score">
                                {Math.round(
                                    (score / quiz.length) * 100
                                )}%
                            </div>

                            <p>
                                You scored{" "}
                                <strong>
                                    {score}
                                </strong>
                                {" / "}
                                {quiz.length}
                            </p>


                            <div className="pdf-score-stats">

                                <div>
                                    <span>✅</span>
                                    <strong>
                                        {score}
                                    </strong>
                                    <small>
                                        Correct
                                    </small>
                                </div>

                                <div>
                                    <span>❌</span>
                                    <strong>
                                        {quiz.length - score}
                                    </strong>
                                    <small>
                                        Wrong
                                    </small>
                                </div>

                            </div>


                            <div className="pdf-result-buttons">

                                <button
                                    className="pdf-retry-btn"
                                    onClick={() =>
                                        handleGenerateQuiz(true)
                                    }
                                >
                                    🔄 Retry Quiz
                                </button>

                                <button
                                    className="pdf-new-quiz-btn"
                                    onClick={handleNewQuiz}
                                >
                                    ✨ New Quiz
                                </button>

                            </div>

                        </div>

                    ) : (

                        <button
                            className="pdf-submit-btn"
                            onClick={handleSubmit}
                        >
                            Submit Quiz
                        </button>

                    )}

                </div>

            )}

        </div>

    );

}

export default PDFStudyAssistant;