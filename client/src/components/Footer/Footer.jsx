import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer" id="contact" data-aos="fade-up">

      <h2>EduCompanion</h2>

      <p>
        Your Personal AI Study Partner
      </p>

      <div className="footer-links">

        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>

      </div>

      <div className="social-icons">

        <a
          href="https://github.com/bhavtoshdwivedi79-beep"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin />
        </a>

        <a href="mailto:example@gmail.com">
          <FaEnvelope />
        </a>

      </div>

      <p className="copyright">
        © 2026 EduCompanion. All Rights Reserved.
      </p>

    </footer>
  );
}

export default Footer;