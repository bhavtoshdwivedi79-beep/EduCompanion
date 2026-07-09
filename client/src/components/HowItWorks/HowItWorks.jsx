import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      icon: "📄",
      title: "Upload Topic",
      desc: "Enter any subject or upload your study material to get started.",
    },
    {
      icon: "🤖",
      title: "AI Creates Content",
      desc: "EduCompanion instantly generates notes, quizzes and study plans.",
    },
    {
      icon: "🚀",
      title: "Learn Faster",
      desc: "Practice, revise and track your progress with AI assistance.",
    },
  ];

  return (
    <section className="how-it-works">

      <h2>How EduCompanion Works</h2>

      <p className="section-subtitle">
        Learn smarter in just three simple steps.
      </p>

      <div className="steps">

        {steps.map((step, index) => (

          <div className="step-card" key={index}>

            <div className="step-number">
              {index + 1}
            </div>

            <div className="step-icon">
              {step.icon}
            </div>

            <h3>{step.title}</h3>

            <p>{step.desc}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default HowItWorks;