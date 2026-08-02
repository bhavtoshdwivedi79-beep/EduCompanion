import { useState } from "react";
import "./Flashcards.css";

import FlashcardCard from "../components/Flashcard/FlashcardCard";
import { generateFlashcards } from "../services/flashcardService";

function Flashcards() {

    const [topic, setTopic] = useState("");

    const [flashcards, setFlashcards] = useState([]);

    const [currentCard, setCurrentCard] = useState(0);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleGenerate = async () => {

        if (!topic.trim()) {

            return alert("Please enter a topic.");

        }

        try {

            setLoading(true);

            setError("");

            const data = await generateFlashcards(topic);

            setFlashcards(data.flashcard.flashcards);

            setCurrentCard(0);

        }

        catch (err) {

            console.error(err);

            setError("Failed to generate flashcards.");

        }

        finally {

            setLoading(false);

        }

    };

    const nextCard = () => {

        if (currentCard < flashcards.length - 1) {

            setCurrentCard(currentCard + 1);

        }

    };

    const previousCard = () => {

        if (currentCard > 0) {

            setCurrentCard(currentCard - 1);

        }

    };

    return (

        <div className="flashcards-page">

            <div className="flashcards-container">

                <h1 className="flashcards-title">
                    AI Flashcards
                </h1>

                <p className="flashcards-subtitle">
                    Generate smart flashcards using AI and revise quickly.
                </p>

                <div className="flashcard-input">

                    <input
                        type="text"
                        placeholder="Enter topic..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                    <button
                        onClick={handleGenerate}
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