import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "features", "about", "contact"];

            for (const section of sections) {
                const element = document.getElementById(section);

                if (element) {
                    const rect = element.getBoundingClientRect();

                    if (rect.top <= 150 && rect.bottom >= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);

        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="navbar">

            <div className="logo">
                EduCompanion
            </div>

            <div className="nav-right">

                <div
                    className="hamburger"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? "✕" : "☰"}
                </div>

                <ul className={menuOpen ? "nav-links active" : "nav-links"}>

                    <li><a href="#home" className={activeSection === "home" ? "active" : ""} onClick={() => setMenuOpen(false)}>Home</a></li>

                    <li><a href="#about" className={activeSection === "about" ? "active" : ""} onClick={() => setMenuOpen(false)}>About</a></li>

                    <li><a href="#features" className={activeSection === "features" ? "active" : ""} onClick={() => setMenuOpen(false)}>Features</a></li>

                    <li><a href="#contact" className={activeSection === "contact" ? "active" : ""} onClick={() => setMenuOpen(false)}>Contact</a></li>

                    <li>
                        {token ? (
                            <button
                                className="login-btn"
                                onClick={() => {
                                    navigate("/dashboard");
                                    setMenuOpen(false);
                                }}
                            >
                                Dashboard
                            </button>
                        ) : (
                            <Link to="/login">
                                <button
                                    className="login-btn"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </button>
                            </Link>
                        )}
                    </li>
                </ul>

            </div>

        </nav>
    );
}

export default Navbar;