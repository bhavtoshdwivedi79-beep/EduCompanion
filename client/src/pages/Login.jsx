import "./Login.css";

function Login() {
  return (
    <section className="login-page">

      <div className="login-card">

        <h1>Welcome Back 👋</h1>

        <p>Login to continue your learning journey.</p>

        <form>

          <input
            type="email"
            placeholder="Email Address"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <button type="submit">
            Login
          </button>

        </form>

        <div className="login-extra">

          <a href="#">Forgot Password?</a>

          <p>
            Don't have an account?
            <a href="/signup"> Sign Up</a>
          </p>

        </div>

      </div>

    </section>
  );
}

export default Login;