import { type FormEvent, lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth.service";
import BrandMark from "../components/BrandMark";

const ImmersiveScene = lazy(() => import("../components/ImmersiveScene"));

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const redirectTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (redirectTimer.current !== null) window.clearTimeout(redirectTimer.current);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({ email, name: name.trim() || undefined, password });
      setSuccess(true);
      redirectTimer.current = window.setTimeout(() => navigate("/login", { replace: true, state: { email } }), 700);
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn’t create your account. Check your details or try signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-environment">
      <div className="auth-scene-wrap"><Suspense fallback={<div className="scene-fallback" />}><ImmersiveScene /></Suspense></div>
      <header className="auth-topbar"><Link to="/login" aria-label="GlucoMind sign in"><BrandMark size="large" light /></Link><span className="auth-secure"><ShieldCheck aria-hidden="true" /> PRIVATE BY DESIGN</span></header>
      <div className="auth-content">
        <section className="auth-form-panel" aria-labelledby="register-title">
          <p className="auth-kicker"><Sparkles aria-hidden="true" /> YOUR HEALTH, IN YOUR HANDS</p>
          <h1 id="register-title">Begin with a clearer picture.</h1>
          <p className="auth-description">Create your secure account to bring your glucose readings and health details together.</p>
          <form className="login-form auth-form" onSubmit={handleSubmit}>
            <div className="field-group"><label htmlFor="register-name">Name <span className="auth-optional">OPTIONAL</span></label><input id="register-name" autoComplete="name" placeholder="How should we address you?" value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div className="field-group"><label htmlFor="register-email">Email address</label><input id="register-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="field-group"><label htmlFor="register-password">Password</label><div className="password-field"><input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></div>
            {error && <div className="auth-error" role="alert">{error}</div>}
            {success && <div className="auth-success" role="status">Account created. Taking you to sign in…</div>}
            <button className="auth-submit" type="submit" disabled={loading || success}>{loading ? "Creating your account…" : "Create account"}<ArrowRight aria-hidden="true" /></button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in <ArrowRight aria-hidden="true" /></Link></p>
          <p className="auth-privacy"><ShieldCheck aria-hidden="true" /> Your health information is personal. Your account is, too.</p>
        </section>
        <aside className="auth-story" aria-label="GlucoMind approach">
          <div className="story-orbit" aria-hidden="true" />
          <p className="story-index">A GLUCOMIND PRINCIPLE <span>PERSONAL, BY DESIGN</span></p>
          <div className="story-copy"><span className="story-rule" /><p>Good care starts with noticing.</p><h2>Make room for the<br /><em>whole picture.</em></h2><span className="story-caption">A personal space for the measurements, context and patterns that matter to you.</span></div>
          <div className="story-foot"><span>GLUCOSE, WITH CONTEXT</span><span>EST. FOR EVERYDAY LIFE</span></div>
        </aside>
      </div>
      <footer className="auth-footer"><span>GLUCOMIND <i>·</i> PERSONAL HEALTH INTELLIGENCE</span><span>INFORMATIONAL, NOT A SUBSTITUTE FOR CLINICAL CARE</span></footer>
    </main>
  );
}