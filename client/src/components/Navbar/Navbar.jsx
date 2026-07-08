import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">

            <div className="logo">
                EduCompanion
            </div>

            <div className="nav-right">

                <ul className="nav-links">
                    <li>Home</li>
                    <li>About</li>
                    <li>Features</li>
                    <li>Contact</li>
                </ul>

                <button className="login-btn">
                    Login
                </button>

            </div>

        </nav>
    );
}

export default Navbar;