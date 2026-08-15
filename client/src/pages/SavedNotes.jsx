import "./SavedNotes.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";


import { useEffect, useState } from "react";
import { useRef } from "react";
import {
    getSavedNotes,
    deleteSavedNote,
} from "../services/savedNoteService";

function SavedNotes() {

    pdfMake.vfs = pdfFonts.vfs;
    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState([]);

    const [selectedNote, setSelectedNote] = useState(null);
    const [pdfNote, setPdfNote] = useState(null);
    const pdfRef = useRef(null);

    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchNotes = async () => {

        try {

            const res = await getSavedNotes();

            setNotes(res.data.notes);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        fetchNotes();

    }, []);

    const handleDelete = (id) => {

        setDeleteId(id);
        setShowDeleteModal(true);

    };

    const handleDownload = (note) => {

        if (!note?.notes) {

            toast.error("No notes available to download.");

            return;

        }

        try {

            const lines = note.notes.split("\n");

            const content = [];

            lines.forEach((line) => {

                const trimmed = line.trim();


                // ==========================================
                // EMPTY LINE
                // ==========================================

                if (!trimmed) {

                    content.push({
                        text: " ",
                        margin: [0, 3],
                    });

                    return;

                }


                // ==========================================
                // H1
                // ==========================================

                if (trimmed.startsWith("# ")) {

                    content.push({

                        text: trimmed
                            .replace(/^# /, "")
                            .replace(/\*\*/g, ""),

                        style: "title",

                        margin: [0, 0, 0, 15],

                    });

                    return;

                }


                // ==========================================
                // H2
                // ==========================================

                if (trimmed.startsWith("## ")) {

                    content.push({

                        text: trimmed
                            .replace(/^## /, "")
                            .replace(/\*\*/g, ""),

                        style: "heading2",

                    });

                    return;

                }


                // ==========================================
                // H3
                // ==========================================

                if (trimmed.startsWith("### ")) {

                    content.push({

                        text: trimmed
                            .replace(/^### /, "")
                            .replace(/\*\*/g, ""),

                        style: "heading3",

                    });

                    return;

                }


                // ==========================================
                // BULLET LIST
                // ==========================================

                if (
                    trimmed.startsWith("- ") ||
                    trimmed.startsWith("* ")
                ) {

                    content.push({

                        text:
                            "• " +
                            trimmed.substring(2),

                        style: "bullet",

                    });

                    return;

                }


                // ==========================================
                // NUMBERED LIST
                // ==========================================

                if (/^\d+\.\s/.test(trimmed)) {

                    content.push({

                        text: trimmed,

                        style: "bullet",

                    });

                    return;

                }


                // ==========================================
                // HORIZONTAL LINE
                // ==========================================

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

                    return;

                }


                // ==========================================
                // NORMAL TEXT
                // ==========================================

                content.push({

                    text: trimmed
                        .replace(
                            /\*\*(.*?)\*\*/g,
                            "$1"
                        )
                        .replace(
                            /\*(.*?)\*/g,
                            "$1"
                        )
                        .replace(
                            /`(.*?)`/g,
                            "$1"
                        ),

                    style: "body",

                });

            });


            // ==========================================
            // PDF DOCUMENT
            // ==========================================

            const documentDefinition = {

                pageSize: "A4",

                pageMargins: [
                    45,
                    50,
                    45,
                    50,
                ],

                content,

                styles: {

                    title: {

                        fontSize: 22,

                        bold: true,

                        alignment: "center",

                        margin: [0, 0, 0, 20],

                    },

                    heading2: {

                        fontSize: 16,

                        bold: true,

                        margin: [0, 15, 0, 8],

                    },

                    heading3: {

                        fontSize: 13,

                        bold: true,

                        margin: [0, 10, 0, 5],

                    },

                    body: {

                        fontSize: 10.5,

                        lineHeight: 1.5,

                        margin: [0, 3, 0, 6],

                    },

                    bullet: {

                        fontSize: 10.5,

                        lineHeight: 1.5,

                        margin: [10, 2, 0, 4],

                    },

                },

                defaultStyle: {

                    font: "Roboto",

                },

            };


            // ==========================================
            // DOWNLOAD
            // ==========================================

            pdfMake
                .createPdf(documentDefinition)
                .download(
                    `${note.topic || "Saved-Notes"}-Notes.pdf`
                );


            toast.success(
                "📄 Text-based PDF downloaded!"
            );


        } catch (error) {

            console.error(
                "Saved Notes PDF error:",
                error
            );

            toast.error(
                "Failed to download PDF."
            );

        }

    };

    useEffect(() => {

        if (!pdfNote) return;

        setTimeout(() => {

            generatePDF();

        }, 300);

    }, [pdfNote]);

    const confirmDelete = async () => {

        try {

            await deleteSavedNote(deleteId);

            fetchNotes();

        } catch (error) {

            console.error(error);

        }

        setDeleteId(null);
        setShowDeleteModal(false);

    };

    const generatePDF = async () => {

        if (!pdfRef.current) return;

        const canvas = await html2canvas(pdfRef.current, {

            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",

            windowWidth: pdfRef.current.scrollWidth,
            windowHeight: pdfRef.current.scrollHeight,

        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        );

        heightLeft -= pageHeight;

        while (heightLeft > 0) {

            position = heightLeft - imgHeight;

            pdf.addPage();

            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            heightLeft -= pageHeight;

        }

        pdf.save(`${pdfNote.topic}-Notes.pdf`);

        setPdfNote(null);

    };

    return (
        <>
            <div className="search-box">

                <input
                    type="text"
                    placeholder="🔍 Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </div>

            <p className="notes-count">
                {notes.length} Saved Notes
            </p>

            <div className="saved-notes-page">

                <h1 className="saved-title">📚 Saved Notes</h1>

                <br />

                {notes.length === 0 ? (

                    <h3 className="empty-text">
                        No saved notes yet.
                    </h3>

                ) : (

                    notes
                        .filter((note) =>
                            note.topic.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((note) => (

                            <div
                                key={note._id}
                                id={`note-${note._id}`}
                                className="saved-card"
                            >

                                <h2 className="saved-topic">
                                    📘 {note.topic}
                                </h2>

                                <p className="saved-date">
                                    🗓 {new Date(note.createdAt).toLocaleString()}
                                </p>

                                <p className="saved-preview">
                                    {
                                        note.notes.length > 180
                                            ? note.notes.substring(0, 180) + "..."
                                            : note.notes
                                    }
                                </p>

                                <br />

                                <div className="saved-buttons">

                                    <button
                                        className="view-btn"
                                        onClick={() => setSelectedNote(note)}
                                    >
                                        👁 View
                                    </button>

                                    <button
                                        className="download-btn"
                                        onClick={() => handleDownload(note)}
                                    >
                                        📄 Download
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(note._id)}
                                    >
                                        🗑 Delete
                                    </button>

                                </div>

                            </div>

                        ))

                )}


                {selectedNote && (

                    <div
                        className="modal-overlay"
                        onClick={() => setSelectedNote(null)}
                    >

                        <div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="modal-header">

                                <h2>📘 {selectedNote.topic}</h2>

                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedNote(null)}
                                >
                                    ✖
                                </button>

                            </div>

                            <p className="modal-date">
                                🗓 {new Date(selectedNote.createdAt).toLocaleString()}
                            </p>

                            <div className="modal-notes">

                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedNote.notes}
                                </ReactMarkdown>

                            </div>

                        </div>

                    </div>

                )}

            </div>

            <div
                ref={pdfRef}
                className="pdf-container"
            >

                {pdfNote && (
                    <>
                        <h1>{pdfNote.topic}</h1>

                        <p>Generated by EduCompanion</p>

                        <hr />

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {pdfNote.notes}
                        </ReactMarkdown>
                    </>
                )}

            </div>

            {showDeleteModal && (

                <div
                    className="delete-overlay"
                    onClick={() => setShowDeleteModal(false)}
                >

                    <div
                        className="delete-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>🗑 Delete Note?</h2>

                        <p>
                            Are you sure you want to delete this note?
                        </p>

                        <div className="delete-actions">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-btn"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}

export default SavedNotes;