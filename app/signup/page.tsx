import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="form-container">
      <div className="form-box">
        <h1>Create Account</h1>
        <p>Start your fitness journey today</p>

        <input
          className="input"
          type="text"
          placeholder="Full Name"
        />

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
          Sign Up
        </button>

        <div className="link-text">
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}