import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="form-container">
      <div className="form-box">
        <h1>Welcome Back!</h1>
        <p>Login to continue your fitness journey</p>

        <input
          className="input"
          type="email"
          placeholder="Email Address"
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
        />

        <button className="submit-btn">
          Login
        </button>

        <div className="link-text">
          Don’t have an account? <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}