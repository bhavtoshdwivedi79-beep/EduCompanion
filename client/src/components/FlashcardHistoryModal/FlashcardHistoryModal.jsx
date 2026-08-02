import { useState, useEffect } from "react";
import "./FlashcardHistoryModal.css";

function FlashcardHistoryModal({ isOpen, onClose, flashcardSet }) {

    const [currentCard, setCurrentCard] = useState(0);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {

        setCurrentCard(0);
        setFlipped(false);

    }, [flashcardSet]);

    if (!isOpen || !flashcardSet) return null;

    const cards = flashcardSet.flashcards;
    const card = cards[currentCard];

    return (

        <div className="flashcard-modal-overlay">

            <div className="flashcard-modal">

                <button
                    className="close-modal"
                    onClick={onClose}
                >
                    ✖
                </button>

                <h2>{flashcardSet.topic}</h2>

                <p>

                    Card {currentCard + 1} / {cards.length}

                </p>

                <div
                    className={`modal-card ${flipped ? "flipped" : ""}`}
                    onClick={() => setFlipped(!flipped)}
                >

                    <div className="card-inner">

                        <div className="card-front">

                            <h3>Question</h3>

                            <p>{card.question}</p>

                        </div>

                        <div className="card-back">

                            <h3>Answer</h3>

                            <p>{card.answer}</p>

                        </div>

                    </div>

                </div>

                <div className="modal-buttons">

                    <button

                        disabled={currentCard === 0}

                        onClick={() => {

                            setCurrentCard((prev) => prev - 1);
                            setFlipped(false);

                        }}

                    >

                        Previous

                    </button>

                    <button

                        disabled={currentCard === cards.length - 1}

                        onClick={() => {

                            setCurrentCard((prev) => prev + 1);
                            setFlipped(false);

                        }}

                    >

                        Next

                    </button>

                </div>

            </div>

        </div>

    );

}

export default FlashcardHistoryModal;