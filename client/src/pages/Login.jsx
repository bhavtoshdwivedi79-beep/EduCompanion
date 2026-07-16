import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../services/authService";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
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

            const res = await loginUser(formData);

            localStorage.setItem("token", res.data.token);

            alert("🎉 Login Successful");

            navigate("/chat");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Login Failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <section className="login-page">

            <div className="login-card">

                <h1>Welcome Back 👋</h1>

                <p>Login to continue your learning journey.</p>

                <form onSubmit={handleSubmit}>

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
                                ? "Logging in..."
                                : "Login"
                        }
                    </button>

                </form>

                <div className="login-extra">

                    <a href="#">
                        Forgot Password?
                    </a>

                    <p>

                        Don't have an account?

                        <Link to="/signup">
                            {" "}Sign Up
                        </Link>

                    </p>

                </div>

            </div>

        </section>

    );

}

export default Login;