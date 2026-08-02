import "./FlashcardCard.css";

function FlashcardCard({ flashcard, flipped, setFlipped }) {

    return (

        <div className="flashcard-container">

            <div
                className={`flashcard ${flipped ? "flipped" : ""}`}
                onClick={() => setFlipped(!flipped)}
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