import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">EduCompanion</h2>

      <ul className="nav-links">
        <li>Home</li>
        <li>Features</li>
        <li>About</li>
        <li>Contact</li>
      </ul>

      <button className="login-btn">
        Login
      </button>
    </nav>
  );
}

export default Navbar;