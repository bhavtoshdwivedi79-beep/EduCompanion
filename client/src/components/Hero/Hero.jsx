import "./Hero.css";
import heroImage from "../../assets/hero.svg";

function Hero() {
    return (
        <section className="hero" id="home" data-aos="fade-up">
            <div className="hero-left">
                <h1>
                    Learn Smarter with
                    <br />
                    <span>EduCompanion AI</span>
                </h1>

                <p>
                    Your intelligent study partner that helps you generate notes,
                    practice quizzes, organize study plans, and solve doubts instantly —
                    all in one place.
                </p>

                <div className="hero-buttons">
                    <button className="primary-btn">
                        🚀 Get Started
                    </button>

                    <button className="secondary-btn">
                        📺 Watch Demo
                    </button>
                </div>

                <div className="hero-stats">
                    <span>✨ AI Powered</span>
                    <span>📚 Smart Notes</span>
                    <span>🧠 Quiz Generator</span>
                </div>
            </div>

            <div className="hero-right">
                <img src={heroImage} alt="Education" />
            </div>
        </section>
    );
}

export default Hero;