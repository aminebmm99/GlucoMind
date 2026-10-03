import { lazy, Suspense, type FormEvent, useEffect, useState } from "react";
import { Activity, CalendarDays, Ruler, ShieldCheck, Target, Weight } from "lucide-react";
import {
  createHealthProfile,
  getHealthProfile,
  updateHealthProfile,
} from "../services/health-profile.service";

const ImmersiveScene = lazy(() => import("../components/ImmersiveScene"));

export default function HealthProfile() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [diabetesType, setDiabetesType] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [targetGlucoseMin, setTargetGlucoseMin] =
    useState("");
  const [targetGlucoseMax, setTargetGlucoseMax] =
    useState("");

  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const profile = await getHealthProfile();
        setLoadError("");

        setDateOfBirth(
          profile.dateOfBirth
            ? profile.dateOfBirth.slice(0, 10)
            : "",
        );

        setGender(profile.gender ?? "");
        setHeight(
          profile.height !== null &&
          profile.height !== undefined
            ? String(profile.height)
            : "",
        );

        setWeight(
          profile.weight !== null &&
          profile.weight !== undefined
            ? String(profile.weight)
            : "",
        );

        setDiabetesType(profile.diabetesType ?? "");

        setDiagnosisDate(
          profile.diagnosisDate
            ? profile.diagnosisDate.slice(0, 10)
            : "",
        );

        setTargetGlucoseMin(
          profile.targetGlucoseMin !== null &&
          profile.targetGlucoseMin !== undefined
            ? String(profile.targetGlucoseMin)
            : "",
        );

        setTargetGlucoseMax(
          profile.targetGlucoseMax !== null &&
          profile.targetGlucoseMax !== undefined
            ? String(profile.targetGlucoseMax)
            : "",
        );

        setExists(true);
      } catch (error) {
        const status = typeof error === "object" && error !== null && "response" in error
          ? (error.response as { status?: number }).status
          : undefined;
        if (status === 404) {
          setExists(false);
          setLoadError("");
        } else {
          console.error(error);
          setLoadError("We couldn’t load your health profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [retryCount]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const today = new Date().toISOString().slice(0, 10);

    if (dateOfBirth && dateOfBirth > today) {
      setMessage("");
      setError("Date of birth cannot be in the future.");
      return;
    }

    if (diagnosisDate && diagnosisDate > today) {
      setMessage("");
      setError("Diagnosis date cannot be in the future.");
      return;
    }

    if (dateOfBirth && diagnosisDate && diagnosisDate < dateOfBirth) {
      setMessage("");
      setError("Diagnosis date cannot be before date of birth.");
      return;
    }

    if (
      targetGlucoseMin &&
      targetGlucoseMax &&
      Number(targetGlucoseMin) > Number(targetGlucoseMax)
    ) {
      setMessage("");
      setError("Lower glucose target cannot exceed the upper target.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = {
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        diabetesType: diabetesType || null,
        diagnosisDate: diagnosisDate || null,
        targetGlucoseMin: targetGlucoseMin ? Number(targetGlucoseMin) : null,
        targetGlucoseMax: targetGlucoseMax ? Number(targetGlucoseMax) : null,
      };

      if (exists) {
        await updateHealthProfile(data);
      } else {
        await createHealthProfile(data);
        setExists(true);
      }

      setMessage("Health profile saved successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to save health profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-content" aria-busy="true">
        <div className="page-heading"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-copy" /></div>
        <div className="panel form-panel"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-chart" /></div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page-content">
        <div className="page-heading"><p className="eyebrow">YOUR DETAILS</p><h1>Health profile</h1></div>
        <section className="state-card state-error" role="alert"><span className="state-icon" aria-hidden="true">!</span><h2>We couldn’t load your profile</h2><p>{loadError}</p><button className="button button-primary" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button></section>
      </main>
    );
  }

  return (
    <main className="page-content profile-page">
      <header className="page-heading"><div><p className="eyebrow"><span className="eyebrow-pulse" /> GLUCOMIND / YOUR BASELINE</p><h1>Your profile, <em>your context.</em></h1><p className="page-subtitle">Personal details that help put your glucose history in perspective.</p></div></header>

      <section className="profile-identity-stage" aria-label="Personal profile overview">
        <div className="profile-stage-scene"><Suspense fallback={<div className="command-scene-fallback" />}><ImmersiveScene variant="profile" /></Suspense></div>
        <div className="profile-stage-heading"><span className="stage-overline">PERSONAL HEALTH PROFILE</span><span className="profile-privacy"><ShieldCheck aria-hidden="true" /> YOUR INFORMATION</span></div>
        <div className="profile-overview-copy"><div className="profile-monogram" aria-hidden="true">G<span>·</span></div><div><h2>Your health context</h2><p>Details below are saved to your private profile and can be updated at any time.</p></div></div>
        <div className="profile-facts">
          <div><CalendarDays aria-hidden="true" /><span>DIAGNOSIS</span><strong>{diagnosisDate ? new Date(`${diagnosisDate}T12:00:00`).toLocaleDateString([], { month: "short", year: "numeric" }) : "Not added"}</strong></div>
          <div><Ruler aria-hidden="true" /><span>HEIGHT</span><strong>{height ? `${height} cm` : "Not added"}</strong></div>
          <div><Weight aria-hidden="true" /><span>WEIGHT</span><strong>{weight ? `${weight} kg` : "Not added"}</strong></div>
          <div><Target aria-hidden="true" /><span>PERSONAL TARGET</span><strong>{targetGlucoseMin && targetGlucoseMax ? `${targetGlucoseMin}–${targetGlucoseMax} mg/dL` : "Not configured"}</strong></div>
        </div>
        <div className="profile-stage-foot"><Activity aria-hidden="true" /> A PERSONAL BASELINE <span>·</span> NOT A DIAGNOSIS</div>
      </section>

      {message && <div className="notice notice-success" role="status"><span aria-hidden="true">✓</span>{message}</div>}
      {error && <div className="notice notice-error" role="alert"><span aria-hidden="true">!</span>{error}</div>}

      <form className="profile-form panel" onSubmit={handleSubmit}>
        <section className="profile-section">
          <div className="profile-section-heading"><span className="profile-section-icon" aria-hidden="true">01</span><div><h2>About you</h2><p>Basic details to personalize your health profile.</p></div></div>
          <div className="profile-fields">
            <div className="field-group"><label htmlFor="dateOfBirth">Date of birth</label><input id="dateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} /></div>
            <div className="field-group"><label htmlFor="gender">Gender</label><select id="gender" value={gender} onChange={(event) => setGender(event.target.value)}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option></select></div>
            <div className="field-group"><label htmlFor="height">Height <span className="field-unit">cm</span></label><input id="height" type="number" min="1" step="0.1" placeholder="e.g. 170" value={height} onChange={(event) => setHeight(event.target.value)} /></div>
            <div className="field-group"><label htmlFor="weight">Weight <span className="field-unit">kg</span></label><input id="weight" type="number" min="1" step="0.1" placeholder="e.g. 68" value={weight} onChange={(event) => setWeight(event.target.value)} /></div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><span className="profile-section-icon" aria-hidden="true">02</span><div><h2>Diabetes details</h2><p>These fields are optional and can be changed at any time.</p></div></div>
          <div className="profile-fields">
            <div className="field-group"><label htmlFor="diabetesType">Diabetes type</label><select id="diabetesType" value={diabetesType} onChange={(event) => setDiabetesType(event.target.value)}><option value="">Select type</option><option value="TYPE_1">Type 1</option><option value="TYPE_2">Type 2</option><option value="GESTATIONAL">Gestational</option><option value="OTHER">Other</option></select></div>
            <div className="field-group"><label htmlFor="diagnosisDate">Diagnosis date</label><input id="diagnosisDate" type="date" max={new Date().toISOString().slice(0, 10)} value={diagnosisDate} onChange={(event) => setDiagnosisDate(event.target.value)} /></div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><span className="profile-section-icon" aria-hidden="true">03</span><div><h2>Glucose target range</h2><p>Enter the range recommended for you by your care team.</p></div></div>
          <div className="profile-fields profile-targets">
            <div className="field-group"><label htmlFor="targetGlucoseMin">Lower target <span className="field-unit">mg/dL</span></label><input id="targetGlucoseMin" type="number" min="1" step="0.1" placeholder="e.g. 70" value={targetGlucoseMin} onChange={(event) => setTargetGlucoseMin(event.target.value)} /></div>
            <span className="target-separator" aria-hidden="true">to</span>
            <div className="field-group"><label htmlFor="targetGlucoseMax">Upper target <span className="field-unit">mg/dL</span></label><input id="targetGlucoseMax" type="number" min="1" step="0.1" placeholder="e.g. 180" value={targetGlucoseMax} onChange={(event) => setTargetGlucoseMax(event.target.value)} /></div>
          </div>
        </section>

        <div className="profile-form-footer"><p>Your profile is optional and helps keep your health information organized.</p><button className="button button-primary" type="submit" disabled={saving}>{saving && <span className="button-spinner" aria-hidden="true" />}{saving ? "Saving…" : "Save profile"}</button></div>
      </form>
    </main>
  );
}