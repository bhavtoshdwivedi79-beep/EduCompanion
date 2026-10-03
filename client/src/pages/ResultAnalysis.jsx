import { useRef, useState } from "react";
import axios from "axios";
import "./ResultAnalysis.css";

function ResultAnalysis() {

    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    const [selectedWeakSubject, setSelectedWeakSubject] = useState(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [assistance, setAssistance] = useState(null);
    const [assistanceLoading, setAssistanceLoading] = useState(false);
    const [loadingAssistanceType, setLoadingAssistanceType] = useState(null);
    const [assistanceError, setAssistanceError] = useState("");
    const [selectedAssistanceType, setSelectedAssistanceType] = useState(null);
    const [previousTheoryQuestions, setPreviousTheoryQuestions] = useState([]);

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    const handleChooseFile = () => {

        setError("");

        fileInputRef.current?.click();

    };

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!allowedTypes.includes(file.type)) {

            setError(
                "Please upload a PDF, JPG, or PNG file."
            );

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
        setError("");

    };

    const handleRemoveFile = () => {

        setSelectedFile(null);
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

    };

    const handleAnalyze = async () => {

        if (!selectedFile) {
            setError("Please select a result file first.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new FormData();

            formData.append("result", selectedFile);

            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/result-analysis/analyze",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("✅ Result Analysis Response:", response.data);

            setAnalysis(response.data.data);

        } catch (error) {

            console.error(
                "❌ Result Analysis Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to analyze result."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleTheoryQuestions = async () => {
        if (!selectedWeakSubject) {
            return;
        }

        try {
            setAssistanceLoading(true);
            setLoadingAssistanceType("theory");
            setAssistanceError("");
            setAssistance(null);
            setSelectedAssistanceType("theory");

            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/weak-subject/assist",
                {
                    subject: selectedWeakSubject,
                    previousQuestions: previousTheoryQuestions,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "✅ Theory Questions Response:",
                response.data
            );

            const newTheoryQuestions =
                response.data.data?.theoryQuestions || [];

            setPreviousTheoryQuestions((previous) => [
                ...previous,
                ...newTheoryQuestions.map((item) => item.question)
            ]);

            setAssistance(response.data.data);

        } catch (error) {
            console.error(
                "❌ Theory Questions Error:",
                error
            );

            setAssistanceError(
                error.response?.data?.message ||
                "Failed to generate theory questions."
            );
        } finally {
            setAssistanceLoading(false);
            setLoadingAssistanceType(null);
        }
    };

    const handleNumericalQuestions = async () => {
        if (!selectedWeakSubject) {
            return;
        }

        try {
            setAssistanceLoading(true);
            setLoadingAssistanceType("numerical");
            setAssistanceError("");
            setAssistance(null);
            setSelectedAssistanceType("numerical");

            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/weak-subject/assist",
                {
                    subject: selectedWeakSubject,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "✅ Numerical Questions Response:",
                response.data
            );

            setAssistance(response.data.data);

        } catch (error) {
            console.error(
                "❌ Numerical Questions Error:",
                error
            );

            setAssistanceError(
                error.response?.data?.message ||
                "Failed to generate numerical questions."
            );
        } finally {
            setAssistanceLoading(false);
            setLoadingAssistanceType(null);
        }
    };

    return (
        <div className="result-analysis-page">

            <div className="result-analysis-header">

                <h1>📊 Result Analysis</h1>

                <p>
                    Analyze your academic performance with AI
                </p>

            </div>


            <div className="result-upload-card">

                {!selectedFile ? (

                    <>
                        <div className="upload-icon">
                            📄
                        </div>

                        <h2>
                            Upload Your Result
                        </h2>

                        <p>
                            Upload your result PDF or image and let AI
                            analyze your academic performance.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            hidden
                        />

                        <button
                            className="upload-result-btn"
                            onClick={handleChooseFile}
                        >
                            Choose File
                        </button>

                        <span className="supported-files">
                            Supported formats: PDF, JPG, PNG
                        </span>
                    </>

                ) : (

                    <div className="selected-file-section">

                        <div className="selected-file-icon">
                            {selectedFile.type === "application/pdf"
                                ? "📄"
                                : "🖼️"}
                        </div>

                        <h2>
                            File Selected
                        </h2>

                        <p className="selected-file-name">
                            {selectedFile.name}
                        </p>

                        <p className="selected-file-size">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>

                        <div className="file-actions">

                            <button
                                className="analyze-result-btn"
                                onClick={handleAnalyze}
                                disabled={loading}
                            >
                                {loading
                                    ? "Analyzing..."
                                    : "🔍 Analyze Result"}
                            </button>

                            <button
                                className="remove-file-btn"
                                onClick={handleRemoveFile}
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                )}


                {error && (

                    <p className="result-upload-error">
                        ⚠️ {error}
                    </p>

                )}

            </div>


            {/* =========================================
            RESULT ANALYSIS
        ========================================= */}

            {analysis && (

                <div className="result-analysis-content">

                    {/* =========================================
                    PERFORMANCE OVERVIEW
                ========================================= */}

                    <div className="analysis-overview-card">

                        <h2>
                            📊 Performance Overview
                        </h2>

                        <div className="overview-grid">

                            <div className="overview-item">

                                <span className="overview-label">
                                    Student
                                </span>

                                <strong>
                                    {analysis.studentName ||
                                        "Not available"}
                                </strong>

                            </div>


                            <div className="overview-item">

                                <span className="overview-label">
                                    Overall Percentage
                                </span>

                                <strong>
                                    {analysis.overallPercentage !== null &&
                                        analysis.overallPercentage !== undefined
                                        ? `${analysis.overallPercentage}%`
                                        : "Not available"}
                                </strong>

                            </div>


                            <div className="overview-item">

                                <span className="overview-label">
                                    Semester
                                </span>

                                <strong>
                                    {analysis.semester !== null &&
                                        analysis.semester !== undefined
                                        ? analysis.semester
                                        : "Not available"}
                                </strong>

                            </div>


                            <div className="overview-item">

                                <span className="overview-label">
                                    SGPA
                                </span>

                                <strong>
                                    {analysis.sgpa !== null &&
                                        analysis.sgpa !== undefined
                                        ? analysis.sgpa
                                        : "Not available"}
                                </strong>

                            </div>


                            <div className="overview-item">

                                <span className="overview-label">
                                    Total Subjects
                                </span>

                                <strong>
                                    {analysis.subjects?.length || 0}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =========================================
                    PERFORMANCE CATEGORIES
                ========================================= */}

                    <div className="performance-categories">


                        {/* STRONG SUBJECTS */}

                        <div className="performance-card strong-card">

                            <h3>
                                🟢 Strong Subjects
                            </h3>

                            <p className="performance-count">
                                {analysis.strongSubjects?.length || 0}
                            </p>

                            {analysis.strongSubjects?.length > 0 ? (

                                <ul>

                                    {analysis.strongSubjects.map(
                                        (subject, index) => (

                                            <li key={index}>
                                                {subject}
                                            </li>

                                        )
                                    )}

                                </ul>

                            ) : (

                                <p>
                                    No strong subjects identified.
                                </p>

                            )}

                        </div>


                        {/* IMPROVEMENT SUBJECTS */}

                        <div className="performance-card improvement-card">

                            <h3>
                                🟡 Improvement Subjects
                            </h3>

                            <p className="performance-count">
                                {analysis.improvementSubjects?.length || 0}
                            </p>

                            {analysis.improvementSubjects?.length > 0 ? (

                                <ul>

                                    {analysis.improvementSubjects.map(
                                        (subject, index) => (

                                            <li key={index}>
                                                {subject}
                                            </li>

                                        )
                                    )}

                                </ul>

                            ) : (

                                <p>
                                    No improvement subjects identified.
                                </p>

                            )}

                        </div>


                        {/* WEAK SUBJECTS */}

                        <div className="performance-card weak-card">

                            <h3>
                                🔴 Weak Subjects
                            </h3>

                            <p className="performance-count">
                                {analysis.weakSubjects?.length || 0}
                            </p>

                            {analysis.weakSubjects?.length > 0 ? (

                                <ul>

                                    {analysis.weakSubjects.map(
                                        (subject, index) => (

                                            <li
                                                key={index}
                                                className="weak-subject-item"
                                            >

                                                <span className="weak-subject-name">
                                                    {subject}
                                                </span>

                                                <button
                                                    className="weak-assistance-btn"
                                                    onClick={() =>
                                                        setSelectedWeakSubject(subject)
                                                    }
                                                >
                                                    Get Assistance
                                                </button>

                                            </li>

                                        )
                                    )}

                                </ul>

                            ) : (

                                <p>
                                    No weak subjects identified.
                                </p>

                            )}

                        </div>

                    </div>

                    {/* =========================================
    SUBJECT-WISE RESULT
========================================= */}

                    <div className="subject-result-card">

                        <div className="subject-result-header">

                            <div>
                                <h2>📚 Subject-wise Result</h2>

                                <p>
                                    Detailed performance for each subject
                                </p>
                            </div>

                            <span className="subject-result-count">
                                {analysis.subjects?.length || 0} Subjects
                            </span>

                        </div>


                        <div className="subject-table-wrapper">

                            <table className="subject-result-table">

                                <thead>
                                    <tr>

                                        <th>Subject</th>

                                        <th>Semester</th>

                                        <th>Marks</th>

                                        <th>Max Marks</th>

                                        <th>Percentage</th>

                                    </tr>
                                </thead>


                                <tbody>

                                    {analysis.subjects?.length > 0 ? (

                                        analysis.subjects.map((item, index) => (

                                            <tr key={index}>

                                                <td className="subject-name-cell">
                                                    {item.subject || "N/A"}
                                                </td>

                                                <td>
                                                    {item.semester !== null &&
                                                        item.semester !== undefined
                                                        ? item.semester
                                                        : "N/A"}
                                                </td>

                                                <td>
                                                    {item.marks !== null &&
                                                        item.marks !== undefined
                                                        ? item.marks
                                                        : "N/A"}
                                                </td>

                                                <td>
                                                    {item.maxMarks !== null &&
                                                        item.maxMarks !== undefined
                                                        ? item.maxMarks
                                                        : "N/A"}
                                                </td>

                                                <td>

                                                    {item.percentage !== null &&
                                                        item.percentage !== undefined ? (

                                                        <span
                                                            className={
                                                                item.percentage >= 75
                                                                    ? "percentage-badge strong"
                                                                    : item.percentage >= 50
                                                                        ? "percentage-badge improvement"
                                                                        : "percentage-badge weak"
                                                            }
                                                        >
                                                            {item.percentage}%
                                                        </span>

                                                    ) : (

                                                        <span className="percentage-na">
                                                            N/A
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="no-subjects"
                                            >
                                                No subject data available.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* =========================================
    WEAK SUBJECT ASSISTANCE
========================================= */}

                    {selectedWeakSubject && (

                        <div className="weak-assistance-card">

                            <div className="weak-assistance-header">

                                <div>

                                    <span className="assistance-label">
                                        Selected Weak Subject
                                    </span>

                                    <h2>
                                        📚 {selectedWeakSubject}
                                    </h2>

                                </div>

                                <button
                                    className="close-assistance-btn"
                                    onClick={() => {
                                        setSelectedWeakSubject(null);
                                        setSelectedAssistanceType(null);
                                        setAssistance(null);
                                        setAssistanceError("");
                                        setLoadingAssistanceType(null);
                                        setPreviousTheoryQuestions([]);
                                    }}
                                >
                                    ✕
                                </button>

                            </div>


                            <div className="assistance-options">

                                <button
                                    className="assistance-option-btn"
                                    onClick={handleTheoryQuestions}
                                    disabled={assistanceLoading}
                                >
                                    {loadingAssistanceType === "theory"
                                        ? "Generating..."
                                        : "Theory Questions"}
                                </button>

                                <button
                                    className="assistance-option-btn"
                                    onClick={handleNumericalQuestions}
                                    disabled={assistanceLoading}
                                >
                                    {loadingAssistanceType === "numerical"
                                        ? "Generating..."
                                        : "Numerical Questions"}
                                </button>

                                <button className="assistance-option-btn">
                                    🤖 AI Explanation
                                </button>

                            </div>

                            {assistanceError && (
                                <p className="result-upload-error">
                                    ⚠️ {assistanceError}
                                </p>
                            )}


                        </div>

                    )}

                    {/* =========================================
THEORY QUESTIONS
========================================= */}

                    {selectedAssistanceType === "theory" &&
                        assistance &&
                        assistance.theoryQuestions?.length > 0 && (

                            <div className="theory-questions-card">

                                <div className="theory-questions-header">

                                    <div>
                                        <span className="assistance-label">
                                            Theory Practice
                                        </span>

                                        <h2>
                                            📖 {assistance.subject} - Theory Questions
                                        </h2>
                                    </div>

                                    <span className="question-count-badge">
                                        {assistance.theoryQuestions.length} Questions
                                    </span>

                                </div>


                                <div className="theory-questions-list">

                                    {assistance.theoryQuestions.map(
                                        (item, index) => (

                                            <div
                                                className="theory-question-item"
                                                key={index}
                                            >

                                                <div className="question-number">
                                                    Q{index + 1}
                                                </div>

                                                <div className="question-content">

                                                    <p className="question-text">
                                                        {item.question}
                                                    </p>

                                                    <span
                                                        className={`question-difficulty ${item.difficulty?.toLowerCase()}`}
                                                    >
                                                        {item.difficulty}
                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    {/* =========================================
NUMERICAL QUESTIONS
========================================= */}

                    {selectedAssistanceType === "numerical" &&
                        assistance &&
                        assistance.numericalQuestions?.length > 0 && (

                            <div className="numerical-questions-card">

                                <div className="numerical-questions-header">

                                    <div>
                                        <span className="assistance-label">
                                            Numerical Practice
                                        </span>

                                        <h2>
                                            🔢 {assistance.subject} - Numerical Questions
                                        </h2>
                                    </div>

                                    <span className="question-count-badge">
                                        {assistance.numericalQuestions.length} Questions
                                    </span>

                                </div>

                                <div className="numerical-questions-list">

                                    {assistance.numericalQuestions.map(
                                        (item, index) => (

                                            <div
                                                className="numerical-question-item"
                                                key={index}
                                            >
                                                <div className="question-number">
                                                    Q{index + 1}
                                                </div>

                                                <div className="question-content">

                                                    <p className="question-text">
                                                        {item.question}
                                                    </p>

                                                    <span
                                                        className={`question-difficulty ${item.difficulty?.toLowerCase()}`}
                                                    >
                                                        {item.difficulty}
                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                    {/* =========================================
                    AI SUMMARY
                ========================================= */}

                    <div className="analysis-summary-card">

                        <h2>
                            📝 AI Summary
                        </h2>

                        <p>
                            {analysis.summary ||
                                "No summary available."}
                        </p>

                    </div>

                </div>

            )}

        </div>
    );

}

export default ResultAnalysis;