import { useEffect, useState } from "react";

import "./FlashcardHistory.css";
import FlashcardHistoryModal from "../components/FlashcardHistoryModal/FlashcardHistoryModal";

import {
    getFlashcards,
    deleteFlashcard,
} from "../services/flashcardService";
import toast from "react-hot-toast";

function FlashcardHistory() {

    const [history, setHistory] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchHistory = async () => {

        try {

            const data = await getFlashcards();

            setHistory(data.flashcards);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchHistory();

    }, []);

    const handleDelete = async (id) => {

        try {

            await deleteFlashcard(id);

            toast.success("🗑️ Flashcard moved to Recycle Bin");

            setConfirmDelete(null);

            await fetchHistory();

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Failed to move flashcard to Recycle Bin"
            );

        }

    };

    const handleOpen = (item) => {

        setSelectedHistory(item);

        setModalOpen(true);

    };

    return (

        <div className="flash-history-page">

            <h1>

                📚 Flashcard History

            </h1>

            <p>

                Access all your saved AI Flashcards.

            </p>

            {loading ? (

                <div className="history-loading">

                    Loading...

                </div>

            ) : history.length === 0 ? (

                <div className="history-empty">

                    No Saved Flashcards Yet.

                </div>

            ) : (

                <div className="history-list">

                    {history.map((item) => (

                        <div
                            className="history-item"
                            key={item._id}
                        >

                            <div>

                                <h3>

                                    {item.topic}

                                </h3>

                                <p>

                                    {item.flashcards.length} Flashcards

                                </p>

                                <small>

                                    {new Date(item.createdAt).toLocaleDateString()}

                                </small>

                            </div>

                            <div className="history-actions">

                                <button
                                    className="open-btn"
                                    onClick={() => handleOpen(item)}
                                >

                                    Open

                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={() => setConfirmDelete(item)}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            <FlashcardHistoryModal
                isOpen={modalOpen}
                onClose={() => {

                    setModalOpen(false);

                    setSelectedHistory(null);

                }}
                flashcardSet={selectedHistory}
            />

            {confirmDelete && (

                <div className="delete-confirm-overlay">

                    <div className="delete-confirm-modal">

                        <div className="delete-confirm-icon">
                            🗑️
                        </div>

                        <h2>
                            Move to Recycle Bin?
                        </h2>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                "{confirmDelete.topic}"
                            </strong>
                            ?
                        </p>

                        <span className="delete-confirm-info">
                            This flashcard set will be kept in the Recycle Bin
                            for 30 days before being permanently deleted.
                        </span>

                        <div className="delete-confirm-actions">

                            <button
                                className="cancel-delete-btn"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-delete-btn"
                                onClick={() =>
                                    handleDelete(confirmDelete._id)
                                }
                            >
                                🗑️ Move to Recycle Bin
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default FlashcardHistory;