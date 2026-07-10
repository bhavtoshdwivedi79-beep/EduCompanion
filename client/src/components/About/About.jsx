import "./About.css";

function About() {
  return (
    <section className="about" id="about" data-aos="fade-right">
      <div className="about-left">
        <h2>About EduCompanion</h2>

        <p>
          EduCompanion is an AI-powered platform designed to make learning
          easier and more productive. Generate notes, solve doubts, practice
          quizzes, and manage your study schedule—all in one place.
        </p>

        <button>Learn More</button>
      </div>

      <div className="about-right">
        <div className="about-card">🤖 AI Powered Learning</div>
        <div className="about-card">📚 Personalized Notes</div>
        <div className="about-card">🧠 Smart Quiz Practice</div>
      </div>
    </section>
  );
}

export default About;