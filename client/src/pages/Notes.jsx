import "./Notes.css";

import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

import toast from "react-hot-toast";
import { saveNote } from "../services/savedNoteService";
import { generateNotes } from "../services/chatService";
import { useNotifications } from "../context/NotificationContext";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

function Notes() {
    pdfMake.vfs = pdfFonts.vfs;

    const [topic, setTopic] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();
    const recommendedTopics = [
        "Operating System",
        "DBMS",
        "Computer Networks",
        "Data Structures",
        "OOP",
        "Java",
        "Python",
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "AI",
        "Machine Learning",
        "Cyber Security",
    ];
    const notesRef = useRef();
    const location = useLocation();

    const handleGenerate = async (selectedTopic = topic) => {

        if (typeof selectedTopic !== "string") {
            selectedTopic = topic;
        }

        if (!selectedTopic.trim()) return;

        setLoading(true);

        const toastId = toast.loading("Generating AI Notes...");

        try {

            const res = await generateNotes(selectedTopic);

            setNotes(res.data.notes);

            setTopic(selectedTopic);

            toast.success("📚 Notes generated successfully!", {
                id: toastId,
            });

            addNotification(`📝 Notes generated on "${selectedTopic}"`);

        } catch (err) {

            console.log(err);

            toast.error("Failed to generate notes.", {
                id: toastId,
            });

        }

        setLoading(false);

    };

    const handleCopy = async () => {

        try {

            await navigator.clipboard.writeText(notes);
            toast.success("📋 Notes copied successfully!");
            addNotification(`📋 Notes copied on "${topic}"`);

        } catch (error) {

            toast.error("Failed to copy notes.");

        }

    };

    const handleDownload = () => {

        if (!notes || !topic) {

            toast.error("No notes available to download.");

            return;

        }

        try {

            const lines = notes.split("\n");

            const content = [];

            let i = 0;

            // ==================================================
            // HELPER: CLEAN MARKDOWN
            // ==================================================

            const cleanMarkdown = (text = "") => {

                return text
                    .replace(/\*\*(.*?)\*\*/g, "$1")
                    .replace(/__(.*?)__/g, "$1")
                    .replace(/\*(.*?)\*/g, "$1")
                    .replace(/_(.*?)_/g, "$1")
                    .replace(/`(.*?)`/g, "$1")
                    .trim();

            };


            // ==================================================
            // HELPER: CONVERT MARKDOWN TABLE ROW
            // ==================================================

            const parseTableRow = (line) => {

                return line
                    .trim()
                    .replace(/^\|/, "")
                    .replace(/\|$/, "")
                    .split("|")
                    .map(cell => cleanMarkdown(cell));

            };


            // ==================================================
            // PROCESS MARKDOWN
            // ==================================================

            while (i < lines.length) {

                const rawLine = lines[i];

                const trimmed = rawLine.trim();


                // ==================================================
                // EMPTY LINE
                // ==================================================

                if (!trimmed) {

                    content.push({

                        text: " ",

                        margin: [0, 3],

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // TABLE DETECTION
                // ==================================================

                if (
                    trimmed.startsWith("|") &&
                    i + 1 < lines.length &&
                    /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/
                        .test(lines[i + 1])
                ) {

                    const header =
                        parseTableRow(lines[i]);

                    const separator =
                        parseTableRow(lines[i + 1]);


                    const body = [];

                    i += 2;


                    // ------------------------------------------
                    // READ TABLE BODY
                    // ------------------------------------------

                    while (i < lines.length) {

                        const tableLine =
                            lines[i].trim();


                        if (
                            !tableLine ||
                            !tableLine.includes("|")
                        ) {

                            break;

                        }


                        body.push(
                            parseTableRow(tableLine)
                        );

                        i++;

                    }


                    // ------------------------------------------
                    // NORMALIZE COLUMN COUNT
                    // ------------------------------------------

                    const columnCount =
                        header.length;


                    const normalizedBody =
                        body.map(row => {

                            const newRow = [...row];

                            while (
                                newRow.length <
                                columnCount
                            ) {

                                newRow.push("");

                            }

                            return newRow.slice(
                                0,
                                columnCount
                            );

                        });


                    const tableBody = [

                        header.map(cell => ({

                            text: cell,

                            bold: true,

                            fontSize: 9,

                            alignment: "left",

                        })),

                        ...normalizedBody.map(row =>
                            row.map(cell => ({

                                text: cell,

                                fontSize: 8.5,

                                alignment: "left",

                            }))
                        ),

                    ];


                    // ------------------------------------------
                    // ADD ACTUAL PDF TABLE
                    // ------------------------------------------

                    content.push({

                        table: {

                            headerRows: 1,

                            widths:
                                new Array(
                                    columnCount
                                ).fill("*"),

                            body: tableBody,

                        },

                        layout: {

                            fillColor: (
                                rowIndex
                            ) => {

                                return rowIndex === 0
                                    ? "#e8eef7"
                                    : null;

                            },

                            hLineWidth: () => 0.5,

                            vLineWidth: () => 0.5,

                            hLineColor: () => "#999999",

                            vLineColor: () => "#999999",

                            paddingLeft: () => 5,

                            paddingRight: () => 5,

                            paddingTop: () => 5,

                            paddingBottom: () => 5,

                        },

                        margin: [0, 8, 0, 12],

                    });


                    continue;

                }


                // ==================================================
                // H1
                // ==================================================

                if (trimmed.startsWith("# ")) {

                    content.push({

                        text: cleanMarkdown(
                            trimmed.replace(
                                /^# /,
                                ""
                            )
                        ),

                        style: "title",

                        margin: [0, 0, 0, 15],

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // H2
                // ==================================================

                if (trimmed.startsWith("## ")) {

                    content.push({

                        text: cleanMarkdown(
                            trimmed.replace(
                                /^## /,
                                ""
                            )
                        ),

                        style: "heading2",

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // H3
                // ==================================================

                if (trimmed.startsWith("### ")) {

                    content.push({

                        text: cleanMarkdown(
                            trimmed.replace(
                                /^### /,
                                ""
                            )
                        ),

                        style: "heading3",

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // BULLET LIST
                // ==================================================

                if (
                    trimmed.startsWith("- ") ||
                    trimmed.startsWith("* ")
                ) {

                    content.push({

                        text:
                            "• " +
                            cleanMarkdown(
                                trimmed.substring(2)
                            ),

                        style: "bullet",

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // NUMBERED LIST
                // ==================================================

                if (/^\d+\.\s/.test(trimmed)) {

                    content.push({

                        text: cleanMarkdown(
                            trimmed
                        ),

                        style: "bullet",

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // HORIZONTAL LINE
                // ==================================================

                if (trimmed === "---") {

                    content.push({

                        canvas: [

                            {

                                type: "line",

                                x1: 0,

                                y1: 0,

                                x2: 515,

                                y2: 0,

                                lineWidth: 1,

                            },

                        ],

                        margin: [0, 10],

                    });

                    i++;

                    continue;

                }


                // ==================================================
                // NORMAL PARAGRAPH
                // ==================================================

                content.push({

                    text: cleanMarkdown(
                        trimmed
                    ),

                    style: "body",

                });

                i++;

            }


            // ==================================================
            // PDF DOCUMENT
            // ==================================================

            const documentDefinition = {

                pageSize: "A4",

                pageMargins: [
                    40,
                    50,
                    40,
                    50,
                ],

                content,


                // ==================================================
                // STYLES
                // ==================================================

                styles: {

                    title: {

                        fontSize: 22,

                        bold: true,

                        alignment: "center",

                        margin: [
                            0,
                            0,
                            0,
                            20
                        ],

                    },

                    heading2: {

                        fontSize: 16,

                        bold: true,

                        margin: [
                            0,
                            15,
                            0,
                            8
                        ],

                    },

                    heading3: {

                        fontSize: 13,

                        bold: true,

                        margin: [
                            0,
                            10,
                            0,
                            5
                        ],

                    },

                    body: {

                        fontSize: 10.5,

                        lineHeight: 1.5,

                        margin: [
                            0,
                            3,
                            0,
                            6
                        ],

                    },

                    bullet: {

                        fontSize: 10.5,

                        lineHeight: 1.5,

                        margin: [
                            10,
                            2,
                            0,
                            4
                        ],

                    },

                },


                defaultStyle: {

                    font: "Roboto",

                },

            };


            // ==================================================
            // DOWNLOAD
            // ==================================================

            pdfMake
                .createPdf(
                    documentDefinition
                )
                .download(
                    `${topic}-Notes.pdf`
                );


            toast.success("📄 Notes PDF downloaded successfully!");
            addNotification(`📄 Notes PDF downloaded for "${topic}"`);


        } catch (error) {

            console.error(
                "PDF generation error:",
                error
            );

            toast.error(
                "Failed to download PDF."
            );

        }

    };

    useEffect(() => {

        if (location.state?.topic) {

            setTopic(location.state.topic);

            handleGenerate(location.state.topic);

            window.history.replaceState({}, document.title);

        }

    }, []);

    const handleSave = async () => {

        if (!topic || !notes) return;

        const toastId = toast.loading("Saving notes...");

        try {

            await saveNote(topic, notes);

            toast.success("❤️ Notes saved successfully!", {
                id: toastId,
            });

            addNotification(`📝 Notes saved on "${topic}"`);

        } catch (error) {

            console.error(error);

            toast.error("Failed to save notes.", {
                id: toastId,
            });

        }

    };

    return (

        <div className="notes-page">

            <h1>📚 AI Smart Notes</h1>

            <p>
                Generate exam-ready notes on any topic.
            </p>

            <input
                className="notes-input"
                type="text"
                placeholder="Enter Topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />

            <button
                className="notes-btn"
                onClick={handleGenerate}
            >
                {loading ? "Generating..." : "Generate Notes"}
            </button>

            <div className="recommended-section">

                <h3>🔥 Recommended Topics</h3>

                <div className="topic-list">

                    {recommendedTopics.map((item) => (

                        <button
                            key={item}
                            className="topic-chip"
                            onClick={() => handleGenerate(item)}
                        >
                            {item}
                        </button>

                    ))}

                </div>

            </div>

            {notes && (
                <>
                    <div className="action-buttons">

                        <button
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            📄 Download PDF
                        </button>

                        <button
                            className="copy-btn"
                            onClick={handleCopy}
                        >
                            📋 Copy Notes
                        </button>

                        <button
                            className="save-btn"
                            onClick={handleSave}
                        >
                            ❤️ Save Notes
                        </button>

                    </div>

                    <div
                        className="notes-output"
                        ref={notesRef}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {notes}
                        </ReactMarkdown>
                    </div>
                </>
            )}

        </div>

    );

}

export default Notes;