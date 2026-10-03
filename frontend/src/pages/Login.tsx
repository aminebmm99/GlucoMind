import { type FormEvent, lazy, Suspense, useState } from "react";
import { Activity, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/BrandMark";

const ImmersiveScene = lazy(() => import("../components/ImmersiveScene"));

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: saveToken } = useAuth();

  const [email, setEmail] = useState(() => {
    const state = location.state as { email?: string } | null;
    return state?.email ?? "";
  });
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
    <main className="auth-environment">
      <div className="auth-scene-wrap"><Suspense fallback={<div className="scene-fallback" />}><ImmersiveScene /></Suspense></div>
      <header className="auth-topbar"><Link to="/login" aria-label="GlucoMind sign in"><BrandMark size="large" light /></Link><span className="auth-secure"><ShieldCheck aria-hidden="true" /> PRIVATE BY DESIGN</span></header>
      <div className="auth-content">
        <section className="auth-form-panel" aria-labelledby="login-title">
          <p className="auth-kicker"><Sparkles aria-hidden="true" /> YOUR HEALTH, IN YOUR HANDS</p>
          <h1 id="login-title">A clearer picture<br />starts here.</h1>
          <p className="auth-description">Sign in to see your readings, your context, and the patterns you’ve recorded.</p>
          <form className="login-form auth-form" onSubmit={handleSubmit}>
            <div className="field-group"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="field-group"><label htmlFor="password">Password</label><div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></div>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Entering your space…" : "Continue securely"}<ArrowRight aria-hidden="true" /></button>
          </form>
          <p className="auth-switch">New to GlucoMind? <Link to="/register">Create an account <ArrowRight aria-hidden="true" /></Link></p>
          <p className="auth-privacy"><ShieldCheck aria-hidden="true" /> Your health information belongs to you.</p>
        </section>
        <aside className="auth-story" aria-label="GlucoMind approach">
          <div className="story-orbit" aria-hidden="true" />
          <p className="story-index">A GLUCOMIND PRINCIPLE <span>PERSONAL, BY DESIGN</span></p>
          <div className="story-copy"><span className="story-rule" /><p>Glucose is a signal, not the whole story.</p><h2>Make room for the<br /><em>whole picture.</em></h2><span className="story-caption">A personal space for the measurements, context and patterns that matter to you.</span></div>
          <div className="story-foot"><span><Activity aria-hidden="true" /> A CALMER WAY TO CONNECT THE DOTS</span><span>EST. FOR EVERYDAY LIFE</span></div>
        </aside>
      </div>
      <footer className="auth-footer"><span>GLUCOMIND <i>·</i> PERSONAL HEALTH INTELLIGENCE</span><span>INFORMATIONAL, NOT A SUBSTITUTE FOR CLINICAL CARE</span></footer>
    </main>
  );
}