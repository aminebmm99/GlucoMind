import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: saveToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      saveToken(response.token);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand brand">
          <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 4.5v23M4.5 16h23" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="2" /></svg></span>
          <span>Gluco<span className="brand-accent">Mind</span></span>
        </div>
        <div className="login-intro"><p className="eyebrow">WELCOME BACK</p><h1>A calmer view of your health.</h1><p>Sign in to review your glucose readings and the patterns you’ve recorded.</p></div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="field-group"><div className="label-row"><label htmlFor="password">Password</label></div><div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></div>
          {error && <div className="notice notice-error login-error" role="alert"><span aria-hidden="true">!</span>{error}</div>}
          <button className="button button-primary login-submit" type="submit" disabled={loading}>{loading && <span className="button-spinner" aria-hidden="true" />}{loading ? "Signing in…" : "Sign in"}<span aria-hidden="true">→</span></button>
        </form>
        <p className="login-footnote"><span className="footnote-mark" aria-hidden="true">i</span>Use the account details you registered with.</p>
      </section>
      <aside className="login-aside" aria-label="About GlucoMind">
        <div className="aside-orbit orbit-one" /><div className="aside-orbit orbit-two" />
        <div className="aside-content"><span className="aside-kicker">YOUR DAILY HEALTH COMPANION</span><div className="aside-graphic" aria-hidden="true"><svg viewBox="0 0 420 250" fill="none"><path d="M15 166h81l26-61 37 104 39-136 37 93 26-46 22 46h122" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 208h390" stroke="currentColor" strokeOpacity=".24" strokeWidth="2" strokeDasharray="5 8"/><circle cx="159" cy="109" r="10" fill="#D6F1E6" stroke="currentColor" strokeWidth="4"/><circle cx="272" cy="166" r="9" fill="#D6F1E6" stroke="currentColor" strokeWidth="4"/></svg></div><h2>Small moments.<br />Clearer patterns.</h2><p>Keep your readings together and make it easier to reflect on your glucose journey.</p></div>
        <span className="aside-footer">A thoughtful space for your health routine.</span>
      </aside>
    </main>
  );
}