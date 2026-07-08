import "./Features.css";

function Features() {
  const features = [
    {
      icon: "📄",
      title: "Smart Notes",
      desc: "Generate clean and organized notes instantly using AI.",
    },
    {
      icon: "🧠",
      title: "AI Quiz",
      desc: "Practice unlimited quizzes generated from your topics.",
    },
    {
      icon: "📅",
      title: "Study Planner",
      desc: "Plan your daily study routine and stay consistent.",
    },
  ];

  return (
    <section className="features">

      <h2>Why Choose EduCompanion?</h2>

      <p>
        Everything you need to become a smarter student,
        all powered by Artificial Intelligence.
      </p>

      <div className="feature-grid">

        {features.map((feature, index) => (

          <div className="feature-card" key={index}>

            <div className="icon">
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>

            <p>{feature.desc}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Features;