import { useState } from "react";
import "./FlashcardCard.css";

function FlashcardCard({ flashcard }) {

    const [flipped, setFlipped] = useState(false);

    const handleFlip = () => {
        setFlipped(!flipped);
    };

    return (

        <div className="flashcard-container">

            <div
                className={`flashcard ${flipped ? "flipped" : ""}`}
                onClick={handleFlip}
            >

                {/* Front */}

                <div className="flashcard-face flashcard-front">

                    <h3>Question</h3>

                    <p>{flashcard.question}</p>

                    <span>Click to Reveal Answer</span>

                </div>

                {/* Back */}

                <div className="flashcard-face flashcard-back">

                    <h3>Answer</h3>

                    <p>{flashcard.answer}</p>

                    <span>Click to Go Back</span>

                </div>

            </div>

        </div>

    );

}

export default FlashcardCard;