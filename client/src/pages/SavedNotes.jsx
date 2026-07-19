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
    const [pdfNote, setPdfNote] = useState(null);
    const pdfRef = useRef(null);

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

    const handleDownload = (note) => {

        setPdfNote(note);

    }

    useEffect(() => {

        if (!pdfNote) return;

        setTimeout(() => {

            generatePDF();

        }, 300);

    }, [pdfNote]);
    
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

        </>

    );

}

export default SavedNotes;