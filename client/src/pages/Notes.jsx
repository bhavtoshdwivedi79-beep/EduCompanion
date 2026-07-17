import "./Notes.css";
import html2canvas from "html2canvas";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";

import { generateNotes } from "../services/chatService";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Notes() {

    const [topic, setTopic] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
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

    const handleGenerate = async (selectedTopic = topic) => {

        if (typeof selectedTopic !== "string") {
            selectedTopic = topic;
        }

        if (!selectedTopic.trim()) return;

        setLoading(true);

        try {

            const res = await generateNotes(selectedTopic);

            setNotes(res.data.notes);

            setTopic(selectedTopic);

        } catch (err) {

            console.log(err);

        }

        setLoading(false);

    };

    const handleCopy = async () => {

        try {

            await navigator.clipboard.writeText(notes);

            alert("✅ Notes copied successfully!");

        } catch (error) {

            alert("Failed to copy notes.");

        }

    };

    const handleDownload = async () => {

        const input = notesRef.current;

        const canvas = await html2canvas(input, {
            scale: 3,
            useCORS: true,
            backgroundColor: "#0f172a",
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();

        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;

        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight,
            undefined,
            "MEDIUM"
        );

        heightLeft -= pdfHeight;

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

            heightLeft -= pdfHeight;

        }

        pdf.save(`${topic}-Notes.pdf`);

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