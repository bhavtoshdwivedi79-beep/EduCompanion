import "./SavedNotes.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { useEffect, useState } from "react";
import { useRef } from "react";
import {
    getSavedNotes,
    deleteSavedNote,
} from "../services/savedNoteService";

function SavedNotes() {

    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const pdfRef = useRef();

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

    const handleDelete = async (id) => {

        const ok = window.confirm("Delete this note?");

        if (!ok) return;

        try {

            await deleteSavedNote(id);

            fetchNotes();

        } catch (error) {

            console.error(error);

        }

    };

    const handleDownload = async (note) => {

        const element = document.getElementById(`note-${note._id}`);

        const canvas = await html2canvas(element, {
            scale: 3,
            backgroundColor: "#0f172a",
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();

        const imgWidth = pdfWidth;

        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            imgHeight
        );

        pdf.save(`${note.topic}-Notes.pdf`);

    };

    return (

        <div className="saved-notes-page">

            <h1 className="saved-title">📚 Saved Notes</h1>

            <br />

            {notes.length === 0 ? (

                <h3 className="empty-text">
                    No saved notes yet.
                </h3>

            ) : (

                notes.map((note) => (

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
                            {note.notes.substring(0, 180)}...
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

    );

}

export default SavedNotes;