import "./Topbar.css";

function Topbar() {
  return (
    <header className="topbar">

      <input
        type="text"
        placeholder="Search..."
      />

      <div className="topbar-right">

        <span>🔔</span>

        <img
          src="https://i.pravatar.cc/40"
          alt="User"
        />

      </div>

    </header>
  );
}

export default Topbar;