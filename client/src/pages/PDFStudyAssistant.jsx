import "./PDFStudyAssistant.css";

import { useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

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

    /* ================= PDF CONTENT FORMATTER ================= */

    const cleanPDFText = (text = "") => {
        return text
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .trim();
    };

    /* ================= INLINE MARKDOWN ================= */

    const parseInlineMarkdown = (text = "") => {

        text = cleanPDFText(text);

        if (!text) {
            return "";
        }

        const parts = [];

        /*
         * Handles:
         * **bold**
         * __bold__
         * *italic*
         * _italic_
         * `code`
         */

        const regex =
            /(\*\*[\s\S]*?\*\*|__[\s\S]*?__|\*[\s\S]*?\*|_[\s\S]*?_|`[\s\S]*?`)/g;

        let lastIndex = 0;

        const matches = [...text.matchAll(regex)];

        matches.forEach((match) => {

            const index = match.index;

            /* Normal text before Markdown */

            if (index > lastIndex) {

                const normalText =
                    text.substring(
                        lastIndex,
                        index
                    );

                if (normalText) {
                    parts.push(normalText);
                }

            }

            const value = match[0];


            /* ================= BOLD ================= */

            if (
                value.startsWith("**") &&
                value.endsWith("**")
            ) {

                parts.push({

                    text: value.slice(2, -2),

                    bold: true,

                });

            }

            else if (
                value.startsWith("__") &&
                value.endsWith("__")
            ) {

                parts.push({

                    text: value.slice(2, -2),

                    bold: true,

                });

            }


            /* ================= ITALIC ================= */

            else if (
                value.startsWith("*") &&
                value.endsWith("*")
            ) {

                parts.push({

                    text: value.slice(1, -1),

                    italics: true,

                });

            }

            else if (
                value.startsWith("_") &&
                value.endsWith("_")
            ) {

                parts.push({

                    text: value.slice(1, -1),

                    italics: true,

                });

            }


            /* ================= INLINE CODE ================= */

            else if (
                value.startsWith("`") &&
                value.endsWith("`")
            ) {

                parts.push({

                    text: value.slice(1, -1),

                });

            }


            lastIndex =
                index + value.length;

        });


        /* Remaining normal text */

        if (lastIndex < text.length) {

            const remaining =
                text.substring(lastIndex);

            if (remaining) {
                parts.push(remaining);
            }

        }


        /*
         * Safety cleanup:
         * If any Markdown markers somehow remain,
         * remove them from the final PDF text.
         */

        return parts.map((part) => {

            if (typeof part === "string") {

                return part
                    .replace(/\*\*(.*?)\*\*/g, "$1")
                    .replace(/__(.*?)__/g, "$1")
                    .replace(/\*(.*?)\*/g, "$1")
                    .replace(/_(.*?)_/g, "$1")
                    .replace(/`(.*?)`/g, "$1");

            }

            if (part?.text) {

                return {
                    ...part,
                    text: String(part.text)
                        .replace(/\*\*(.*?)\*\*/g, "$1")
                        .replace(/__(.*?)__/g, "$1")
                        .replace(/\*(.*?)\*/g, "$1")
                        .replace(/_(.*?)_/g, "$1")
                        .replace(/`(.*?)`/g, "$1"),
                };

            }

            return part;

        });

    };


    /* ================= TABLE HELPERS ================= */

    const isMarkdownTableSeparator = (line = "") => {

        const cells = line
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim());

        if (cells.length < 2) {
            return false;
        }

        return cells.every((cell) =>
            /^:?-{3,}:?$/.test(cell)
        );

    };


    const splitMarkdownTableRow = (line = "") => {

        let cleaned = line.trim();

        if (cleaned.startsWith("|")) {
            cleaned = cleaned.substring(1);
        }

        if (cleaned.endsWith("|")) {
            cleaned = cleaned.substring(
                0,
                cleaned.length - 1
            );
        }

        return cleaned
            .split("|")
            .map((cell) => cleanPDFText(cell));
    };


    /* ================= CREATE PDF TABLE ================= */

    const createPDFTable = (
        headerLine,
        separatorLine,
        bodyLines
    ) => {

        const headerCells =
            splitMarkdownTableRow(headerLine);

        const rows = bodyLines
            .map(splitMarkdownTableRow)
            .filter((row) => row.length > 0);


        const columnCount =
            Math.max(
                headerCells.length,
                ...rows.map((row) => row.length)
            );


        if (!columnCount || columnCount < 2) {
            return null;
        }


        const normalizeRow = (row) => {

            const normalized = [...row];

            while (normalized.length < columnCount) {
                normalized.push("");
            }

            return normalized.slice(0, columnCount);

        };


        const tableBody = [

            normalizeRow(headerCells).map((cell) => ({
                text: parseInlineMarkdown(cell),
                bold: true,
                fillColor: "#e8eef7",
                margin: [5, 5, 5, 5],
            })),

            ...rows.map((row) =>
                normalizeRow(row).map((cell) => ({
                    text: parseInlineMarkdown(cell),
                    margin: [5, 5, 5, 5],
                }))
            ),

        ];


        return {

            table: {

                headerRows: 1,

                widths: Array(columnCount).fill("*"),

                body: tableBody,

            },

            layout: {

                hLineWidth: () => 0.7,

                vLineWidth: () => 0.7,

                hLineColor: () => "#b8c2cc",

                vLineColor: () => "#b8c2cc",

                paddingLeft: () => 5,

                paddingRight: () => 5,

                paddingTop: () => 5,

                paddingBottom: () => 5,

            },

            margin: [0, 5, 0, 10],

        };

    };


    /* ================= MARKDOWN → PDF ================= */

    const convertMarkdownToPDF = (markdown = "") => {

        const lines = markdown
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");

        const content = [];

        let i = 0;


        while (i < lines.length) {

            const originalLine = lines[i];

            const line = originalLine.trim();


            /* Empty line */

            if (!line) {

                content.push({
                    text: " ",
                    margin: [0, 2, 0, 2],
                });

                i++;
                continue;

            }


            /* ================= CODE BLOCK ================= */

            if (line.startsWith("```")) {

                const codeLines = [];

                i++;

                while (
                    i < lines.length &&
                    !lines[i].trim().startsWith("```")
                ) {

                    codeLines.push(
                        lines[i]
                    );

                    i++;

                }

                if (
                    i < lines.length &&
                    lines[i].trim().startsWith("```")
                ) {
                    i++;
                }


                content.push({

                    text: codeLines.join("\n"),

                    fontSize: 8.5,

                    lineHeight: 1.2,

                    background: "#f3f4f6",

                    margin: [5, 5, 5, 10],

                    preserveLeadingSpaces: true,

                });

                continue;

            }


            /* ================= TABLE ================= */

            if (
                line.includes("|") &&
                i + 1 < lines.length &&
                isMarkdownTableSeparator(
                    lines[i + 1]
                )
            ) {

                const headerLine = line;

                const separatorLine =
                    lines[i + 1];

                const bodyLines = [];

                i += 2;


                while (
                    i < lines.length &&
                    lines[i].trim() &&
                    lines[i].includes("|") &&
                    !lines[i].trim().startsWith("# ")
                ) {

                    bodyLines.push(
                        lines[i]
                    );

                    i++;

                }


                const table =
                    createPDFTable(
                        headerLine,
                        separatorLine,
                        bodyLines
                    );


                if (table) {

                    content.push(table);

                    continue;

                }

            }


            /* ================= H1 ================= */

            if (line.startsWith("# ")) {

                content.push({

                    text: parseInlineMarkdown(
                        line.replace(/^#\s+/, "")
                    ),

                    style: "heading1",

                    margin: [0, 10, 0, 5],

                });

                i++;

                continue;

            }


            /* ================= H2 ================= */

            if (line.startsWith("## ")) {

                content.push({

                    text: parseInlineMarkdown(
                        line.replace(/^##\s+/, "")
                    ),

                    style: "heading2",

                    margin: [0, 8, 0, 5],

                });

                i++;

                continue;

            }


            /* ================= H3 ================= */

            if (line.startsWith("### ")) {

                content.push({

                    text: parseInlineMarkdown(
                        line.replace(/^###\s+/, "")
                    ),

                    style: "heading3",

                    margin: [0, 7, 0, 4],

                });

                i++;

                continue;

            }


            /* ================= HORIZONTAL LINE ================= */

            if (
                line === "---" ||
                line === "***" ||
                line === "___"
            ) {

                content.push({

                    canvas: [
                        {
                            type: "line",

                            x1: 0,
                            y1: 0,

                            x2: 515,
                            y2: 0,

                            lineWidth: 0.8,

                        },
                    ],

                    margin: [0, 7, 0, 7],

                });

                i++;

                continue;

            }


            /* ================= BULLET ================= */

            if (
                /^[-*+]\s+/.test(line)
            ) {

                const bulletText =
                    line.replace(
                        /^[-*+]\s+/,
                        ""
                    );

                content.push({

                    text: [
                        {
                            text: "• ",
                            bold: true,
                        },

                        ...parseInlineMarkdown(
                            bulletText
                        ),

                    ],

                    style: "bullet",

                    margin: [10, 2, 0, 3],

                });

                i++;

                continue;

            }


            /* ================= NUMBERED LIST ================= */

            if (
                /^\d+\.\s+/.test(line)
            ) {

                const match =
                    line.match(
                        /^(\d+)\.\s+(.*)$/
                    );

                const number =
                    match?.[1] || "";

                const text =
                    match?.[2] || "";


                content.push({

                    text: [

                        {
                            text: `${number}. `,
                            bold: true,
                        },

                        ...parseInlineMarkdown(
                            text
                        ),

                    ],

                    style: "numbered",

                    margin: [10, 2, 0, 3],

                });

                i++;

                continue;

            }


            /* ================= BLOCKQUOTE ================= */

            if (line.startsWith(">")) {

                const quote =
                    line
                        .replace(/^>\s?/, "")
                        .trim();


                content.push({

                    text: parseInlineMarkdown(
                        quote
                    ),

                    italics: true,

                    color: "#64748b",

                    margin: [10, 4, 0, 6],

                });

                i++;

                continue;

            }


            /* ================= NORMAL PARAGRAPH ================= */

            content.push({

                text: parseInlineMarkdown(line),

                style: "paragraph",

                margin: [0, 2, 0, 5],

            });

            i++;

        }


        return content;

    };

    /* ================= DOWNLOAD NOTES PDF ================= */

    const handleDownloadNotes = () => {

        if (!notes) {
            toast.error("No notes available to download.");
            return;
        }

        try {

            /* ONLY CONTENT FORMATTING IS CHANGED */

            const content =
                convertMarkdownToPDF(notes);


            /* ================= DOCUMENT ================= */

            const documentDefinition = {

                pageSize: "A4",

                pageMargins: [45, 50, 45, 50],

                content: [

                    {
                        text: "PDF Study Assistant",
                        style: "title",
                        alignment: "center",
                        margin: [0, 0, 0, 5],
                    },

                    {
                        text: "Study Notes",
                        style: "subtitle",
                        alignment: "center",
                        margin: [0, 0, 0, 15],
                    },

                    {
                        text: pdfFile
                            ? `Source: ${pdfFile.name}`
                            : "",

                        style: "source",

                        alignment: "center",

                        margin: [0, 0, 0, 18],
                    },

                    ...content,

                ],

                styles: {

                    title: {
                        fontSize: 20,
                        bold: true,
                    },

                    subtitle: {
                        fontSize: 14,
                        bold: true,
                    },

                    source: {
                        fontSize: 9,
                        italics: true,
                    },

                    heading1: {
                        fontSize: 16,
                        bold: true,
                    },

                    heading2: {
                        fontSize: 14,
                        bold: true,
                    },

                    heading3: {
                        fontSize: 12,
                        bold: true,
                    },

                    paragraph: {
                        fontSize: 10,
                        lineHeight: 1.35,
                    },

                    bullet: {
                        fontSize: 10,
                        lineHeight: 1.3,
                    },

                    numbered: {
                        fontSize: 10,
                        lineHeight: 1.3,
                    },

                },

                defaultStyle: {
                    fontSize: 10,
                },

            };


            /* ================= FILE NAME ================= */

            const fileName = pdfFile
                ? pdfFile.name
                    .replace(/\.pdf$/i, "")
                    .replace(/\s+/g, "_")
                    .substring(0, 80)
                : "PDF_Study_Notes";


            /* ================= DOWNLOAD ================= */

            pdfMake
                .createPdf(documentDefinition)
                .download(
                    `${fileName}_Study_Notes.pdf`
                );


            /* ================= NOTIFICATIONS ================= */

            toast.success(
                "📥 Notes PDF downloaded!"
            );

            addNotification(
                `📥 PDF notes downloaded from "${pdfFile?.name || "PDF"}"`
            );

        } catch (err) {

            console.error(
                "PDF Download Error:",
                err
            );

            toast.error(
                "Failed to download notes PDF."
            );

        }

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

                        <div className="notes-header-actions">

                            <button
                                className="download-notes-btn"
                                onClick={handleDownloadNotes}
                            >
                                📥 Download PDF
                            </button>

                            <button
                                className="clear-result-btn"
                                onClick={() =>
                                    setNotes("")
                                }
                            >
                                ✕
                            </button>

                        </div>

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
                                                    ${answers[index] ===
                                                        option
                                                        ? "selected"
                                                        : ""
                                                    }
                                                    ${submitted &&
                                                        option ===
                                                        q.answer
                                                        ? "correct"
                                                        : ""
                                                    }
                                                    ${submitted &&
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