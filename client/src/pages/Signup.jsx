import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signupUser } from "../services/authService";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await signupUser(formData);

      localStorage.setItem("token", res.data.token);

      alert("🎉 Registration Successful");

      navigate("/chat");

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Registration Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="signup-page">

      <div className="signup-card">

        <h1>Create Account 🚀</h1>

        <p>Join EduCompanion and start learning smarter.</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {
              loading
                ? "Creating..."
                : "Create Account"
            }
          </button>

        </form>

        <div className="signup-extra">

          <p>

            Already have an account?

            <Link to="/login">
              {" "}Login
            </Link>

          </p>

        </div>

      </div>

    </section>

  );

}

export default Signup;