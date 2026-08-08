import "./Flashcards.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import FlashcardCard from "../components/Flashcard/FlashcardCard";
import FlashcardHistoryModal from "../components/FlashcardHistoryModal/FlashcardHistoryModal";
import {
    generateFlashcards,
    saveFlashcards,
    getFlashcards,
    deleteFlashcard,
} from "../services/flashcardService";
import { useNotifications } from "../context/NotificationContext";

function Flashcards() {

    const [topic, setTopic] = useState("");

    const [saved, setSaved] = useState(false);

    const [selectedHistory, setSelectedHistory] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);

    const [flashcards, setFlashcards] = useState([]);

    const [currentCard, setCurrentCard] = useState(0);

    const [loading, setLoading] = useState(false);

    const [history, setHistory] = useState([]);

    const [error, setError] = useState("");

    const [flipped, setFlipped] = useState(false);

    const location = useLocation();
    const { addNotification } = useNotifications();

    const quickTopics = [
        "Java",
        "DBMS",
        "DSA",
        "Operating System",
        "Computer Networks",
        "Python",
        "React",
        "JavaScript"
    ];

    const handleGenerate = async (selectedTopic) => {
        const currentTopic = selectedTopic || topic;

        if (!currentTopic.trim()) return;

        try {
            setLoading(true);

            setError("");

            const data = await generateFlashcards(currentTopic);

            setFlashcards(data.flashcards);

            addNotification(`🃏 Flashcards generated on "${currentTopic}"`);

            setCurrentCard(0);

            setSaved(false);

            await fetchHistory();

        } catch (err) {

            console.log(err);

            setError("Failed to generate flashcards.");

        } finally {

            setLoading(false);

        }

    };

    const handleSave = async () => {

        try {

            await saveFlashcards(topic, flashcards);

            toast.success("📚 Flashcards saved successfully!");

            addNotification(`🃏 Flashcards saved on "${topic}"`);

            setSaved(true);

            fetchHistory();

        }

        catch (err) {

            console.log(err);

            toast.error("Failed to save flashcards");

        }

    };

    const nextCard = () => {

        if (currentCard < flashcards.length - 1) {

            setCurrentCard((prev) => prev + 1);

            setFlipped(false);

        }

    };

    const previousCard = () => {

        if (currentCard > 0) {

            setCurrentCard((prev) => prev - 1);

            setFlipped(false);

        }

    };

    const fetchHistory = async () => {

        try {

            const data = await getFlashcards();

            setHistory(data.flashcards);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchHistory();

    }, []);

    useEffect(() => {
        if (location.state) {

            setTopic(location.state.topic);

            setFlashcards(location.state.flashcards);

            setCurrentCard(0);

        }

    }, [location]);

    return (

        <div className="flashcards-page">

            <div className="flashcards-container">

                <h1 className="flashcards-title">
                    AI Flashcards
                </h1>

                <p className="flashcards-subtitle">
                    Generate smart flashcards using AI and revise quickly.
                </p>

                <div className="quick-actions">
                    <h3>⚡ Quick Generate</h3>

                    <div className="quick-grid">
                        {quickTopics.map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setTopic(item);
                                    handleGenerate(item);
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flashcard-input">

                    <input
                        type="text"
                        placeholder="Enter topic..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />



                    <button
                        onClick={() => handleGenerate(topic)}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate"}
                    </button>

                </div>

                {loading && (

                    <p className="loading-text">
                        Generating Flashcards...
                    </p>

                )}

                {error && (

                    <p className="error-text">
                        {error}
                    </p>

                )}

                {!loading &&
                    flashcards.length > 0 && (

                        <>

                            <FlashcardCard
                                flashcard={flashcards[currentCard]}
                                flipped={flipped}
                                setFlipped={setFlipped}
                            />

                            <div className="flashcard-progress">

                                Card {currentCard + 1} of {flashcards.length}

                            </div>

                            <div className="flashcard-navigation">

                                <button
                                    onClick={previousCard}
                                    disabled={currentCard === 0}
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={nextCard}
                                    disabled={currentCard === flashcards.length - 1}
                                >
                                    Next
                                </button>

                            </div>

                            <div className="save-flashcards">

                                <button
                                    onClick={handleSave}
                                    disabled={saved}
                                >
                                    {saved ? "✅ Saved" : "💾 Save Flashcards"}
                                </button>

                            </div>

                        </>

                    )}

                {!loading &&
                    flashcards.length === 0 && (

                        <div className="empty-state">

                            Enter a topic and generate AI Flashcards.

                        </div>

                    )}

            </div>

        </div>

    );

}

export default Flashcards;