import "./Signup.css";
import { Link } from "react-router-dom";

function Signup() {
  return (
    <section className="signup-page">

      <div className="signup-card">

        <h1>Create Account 🚀</h1>

        <p>Join EduCompanion and start learning smarter.</p>

        <form>

          <input
            type="text"
            placeholder="Full Name"
          />

          <input
            type="email"
            placeholder="Email Address"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <button type="submit">
            Create Account
          </button>

        </form>

        <div className="signup-extra">

          <p>
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

        </div>

      </div>

    </section>
  );
}

export default Signup;