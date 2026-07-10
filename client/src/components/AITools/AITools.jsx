import "./AITools.css";

function AITools() {

  const tools = [

    {
      icon: "📝",
      title: "AI Notes",
      desc: "Generate clean, well-structured notes in seconds.",
      button: "Try Now →"
    },

    {
      icon: "🧠",
      title: "AI Quiz",
      desc: "Practice unlimited AI-generated quizzes.",
      button: "Try Now →"
    },

    {
      icon: "💬",
      title: "Doubt Solver",
      desc: "Ask questions and receive instant AI explanations.",
      button: "Try Now →"
    },

    {
      icon: "📅",
      title: "Study Planner",
      desc: "Create personalized daily study schedules.",
      button: "Try Now →"
    },

    {
      icon: "📚",
      title: "Flashcards",
      desc: "Revise concepts quickly using AI flashcards.",
      button: "Try Now →"
    },

    {
      icon: "📈",
      title: "Progress Tracker",
      desc: "Track your learning journey and stay motivated.",
      button: "Try Now →"
    }

  ];

  return (

    <section className="ai-tools" data-aos="fade-up">

      <h2>Powerful AI Tools</h2>

      <p className="ai-subtitle">
        Everything you need to learn faster with Artificial Intelligence.
      </p>

      <div className="tools-grid">

        {tools.map((tool, index) => (

          <div className="tool-card" key={index}>

            <div className="tool-icon">
              {tool.icon}
            </div>

            <h3>{tool.title}</h3>

            <p>{tool.desc}</p>

            <button className="tool-btn">
              {tool.button}
            </button>

          </div>

        ))}

      </div>

    </section>

  );
}

export default AITools;