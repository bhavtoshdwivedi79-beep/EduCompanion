import { useEffect, useState } from "react";

import "./FlashcardHistory.css";
import FlashcardHistoryModal from "../components/FlashcardHistoryModal/FlashcardHistoryModal";

import {
    getFlashcards,
    deleteFlashcard,
} from "../services/flashcardService";

function FlashcardHistory() {

    const [history, setHistory] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const [loading, setLoading] = useState(true);

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

        if (!window.confirm("Delete this Flashcard Set?")) return;

        await deleteFlashcard(id);

        fetchHistory();

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
                                    onClick={() => handleDelete(item._id)}
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

        </div>

    );

}

export default FlashcardHistory;