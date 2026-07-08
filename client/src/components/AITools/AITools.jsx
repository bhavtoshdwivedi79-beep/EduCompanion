import "./AITools.css";

function AITools() {
  const tools = [
    {
      icon: "📝",
      title: "AI Notes",
      desc: "Generate clean and structured notes within seconds.",
    },
    {
      icon: "🤖",
      title: "AI Chat",
      desc: "Ask doubts anytime and get instant AI assistance.",
    },
    {
      icon: "🧠",
      title: "Quiz Generator",
      desc: "Practice unlimited quizzes from any topic.",
    },
    {
      icon: "📅",
      title: "Study Planner",
      desc: "Organize your daily study routine effectively.",
    },
    {
      icon: "📈",
      title: "Progress Tracker",
      desc: "Track your learning journey with detailed insights.",
    },
    {
      icon: "📂",
      title: "Resource Hub",
      desc: "Store and access notes, PDFs and study material.",
    },
  ];

  return (
    <section className="ai-tools">

      <h2>AI Powered Tools</h2>

      <p>
        Everything you need to learn smarter, faster and better.
      </p>

      <div className="tools-grid">

        {tools.map((tool, index) => (

          <div className="tool-card" key={index}>

            <div className="tool-icon">
              {tool.icon}
            </div>

            <h3>{tool.title}</h3>

            <p>{tool.desc}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default AITools;