import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Topic",
      desc: "Enter your subject or upload notes to get started.",
    },
    {
      number: "02",
      title: "AI Processes",
      desc: "EduCompanion generates notes, quizzes and study plans instantly.",
    },
    {
      number: "03",
      title: "Learn & Improve",
      desc: "Study smarter, practice quizzes and track your progress.",
    },
  ];

  return (
    <section className="how">

      <h2>How It Works</h2>

      <p>
        Learn in just three simple steps.
      </p>

      <div className="how-grid">

        {steps.map((step, index) => (

          <div className="step-card" key={index}>

            <div className="step-number">
              {step.number}
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