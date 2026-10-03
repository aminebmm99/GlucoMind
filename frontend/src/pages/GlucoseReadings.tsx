import { useEffect, useState, type FormEvent } from "react";
import {
  createGlucoseReading,
  deleteGlucoseReading,
  getGlucoseReadings,
  updateGlucoseReading,
} from "../services/glucose-reading.service";
import type { GlucoseReading } from "../types/api";

function getLocalDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function formatContext(value?: string | null) {
  return value
    ? value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Unspecified";
}

export default function GlucoseReadings() {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);

  const [glucoseValue, setGlucoseValue] = useState("");
  const [unit, setUnit] = useState("mg/dL");
  const [measuredAt, setMeasuredAt] = useState(getLocalDateTime);
  const [context, setContext] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  async function loadReadings() {
    try {
      const data = await getGlucoseReadings();

      setReadings(data);
      setLoadFailed(false);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load glucose readings");
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getGlucoseReadings()
      .then((data) => {
        if (active) {
          setReadings(data);
          setLoadFailed(false);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error(error);
          setError("Failed to load glucose readings");
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setGlucoseValue("");
    setUnit("mg/dL");
    setMeasuredAt(getLocalDateTime());
    setContext("");
    setNotes("");
    setEditingId(null);
    setError("");
  }

  function startEditing(reading: GlucoseReading) {
    setEditingId(reading.id);
    setGlucoseValue(String(reading.glucoseValue));
    setUnit(reading.unit);

    const date = new Date(reading.measuredAt);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setMeasuredAt(localDate);
    setContext(reading.context ?? "");
    setNotes(reading.notes ?? "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = {
        glucoseValue: Number(glucoseValue),
        unit,
        measuredAt: new Date(measuredAt).toISOString(),
        context: context || undefined,
        notes: notes || undefined,
      };

      if (editingId !== null) {
        await updateGlucoseReading(editingId, {
          ...data,
          context: context || null,
          notes: notes || null,
        });
        setSuccess("Reading updated successfully.");
      } else {
        await createGlucoseReading(data);
        setSuccess("Reading added successfully.");
      }

      resetForm();

      await loadReadings();
    } catch (error) {
      console.error(error);
      setError(
        editingId !== null
          ? "Failed to update glucose reading"
          : "Failed to create glucose reading",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (pendingDeleteId === null) return;
    try {
      setError("");
      await deleteGlucoseReading(pendingDeleteId);
      setPendingDeleteId(null);
      setSuccess("Reading deleted.");
      await loadReadings();
    } catch (error) {
      console.error(error);
      setError("Failed to delete glucose reading");
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

  return (
    <main className="page-content">
      <header className="page-heading">
        <div><p className="eyebrow">YOUR PERSONAL LOG</p><h1>Glucose readings</h1><p className="page-subtitle">Record a measurement and keep your history in one place.</p></div>
      </header>

      {error && <div className="notice notice-error" role="alert"><span aria-hidden="true">!</span>{error}</div>}
      {success && <div className="notice notice-success" role="status"><span aria-hidden="true">✓</span>{success}<button className="notice-dismiss" type="button" onClick={() => setSuccess("")} aria-label="Dismiss message">×</button></div>}

      <section className="panel form-panel">
        <div className="section-heading form-heading">
          <div><p className="eyebrow">{editingId !== null ? "UPDATE YOUR LOG" : "QUICK ENTRY"}</p><h2>{editingId !== null ? "Edit reading" : "Add a reading"}</h2><p className="section-description">Fields marked with <span aria-hidden="true">*</span> are required.</p></div>
          {editingId !== null && <span className="editing-pill">Editing</span>}
        </div>

        <form className="reading-form" onSubmit={handleSubmit}>
          <div className="field-group field-value">
            <label htmlFor="glucoseValue">Glucose value <span className="required-mark">*</span></label>
            <div className="input-with-unit"><input id="glucoseValue" type="number" min="1" step="0.1" placeholder="e.g. 105" value={glucoseValue} onChange={(event) => setGlucoseValue(event.target.value)} required /><select aria-label="Glucose unit" value={unit} onChange={(event) => setUnit(event.target.value)}><option value="mg/dL">mg/dL</option><option value="mmol/L">mmol/L</option></select></div>
          </div>
          <div className="field-group"><label htmlFor="measuredAt">Date and time <span className="required-mark">*</span></label><input id="measuredAt" type="datetime-local" value={measuredAt} onChange={(event) => setMeasuredAt(event.target.value)} required /></div>
          <div className="field-group"><label htmlFor="context">When was it taken?</label><select id="context" value={context} onChange={(event) => setContext(event.target.value)}><option value="">Choose a context</option><option value="BEFORE_MEAL">Before a meal</option><option value="AFTER_MEAL">After a meal</option><option value="FASTING">Fasting</option><option value="BEDTIME">Bedtime</option><option value="RANDOM">Other time</option></select></div>
          <div className="field-group field-notes"><label htmlFor="notes">Notes <span className="optional-label">Optional</span></label><textarea id="notes" rows={3} placeholder="Anything you’d like to remember about this reading?" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
          <div className="form-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving && <span className="button-spinner" aria-hidden="true" />}{saving ? "Saving…" : editingId !== null ? "Save changes" : "Save reading"}</button>{editingId !== null && <button className="button button-secondary" type="button" onClick={resetForm} disabled={saving}>Cancel</button>}</div>
        </form>
      </section>

      <section className="panel history-panel">
        <div className="section-heading history-heading"><div><p className="eyebrow">YOUR RECORDS</p><h2>Reading history</h2></div><span className="count-pill">{readings.length} {readings.length === 1 ? "reading" : "readings"}</span></div>
        {loadFailed ? (
          <div className="history-empty"><span className="state-icon" aria-hidden="true">!</span><h3>We couldn’t load your history</h3><p>Your readings haven’t been changed. Check your connection and try again.</p><button className="button button-secondary" type="button" onClick={() => { setLoading(true); void loadReadings(); }}>Try again</button></div>
        ) : readings.length === 0 ? (
          <div className="history-empty"><span className="empty-illustration" aria-hidden="true">⌁</span><h3>Your history starts here</h3><p>When you add a glucose reading, it’ll appear here so you can review it later.</p></div>
        ) : (
          <ul className="reading-list">
            {readings.map((reading) => (
              <li className="reading-item" key={reading.id}>
                <span className="reading-marker" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5v17M3.5 12h17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span>
                <div className="reading-main"><div className="reading-value">{reading.glucoseValue}<span> {reading.unit}</span></div><div className="reading-meta"><span className="context-pill">{formatContext(reading.context)}</span><time dateTime={reading.measuredAt}>{new Date(reading.measuredAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time></div>{reading.notes && <p className="reading-notes">{reading.notes}</p>}</div>
                <div className="reading-actions"><button className="icon-button" type="button" onClick={() => startEditing(reading)} aria-label={`Edit reading ${reading.glucoseValue} ${reading.unit}`}><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12.8 4.2 3 3M4 16l3.2-.7L16.4 6a1.4 1.4 0 0 0-2-2L5.2 13.2 4 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button><button className="icon-button icon-button-danger" type="button" onClick={() => setPendingDeleteId(reading.id)} aria-label={`Delete reading ${reading.glucoseValue} ${reading.unit}`}><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 6h11M8 6V4h4v2m2.5 0-.6 9.5H6.1L5.5 6m3 3v4m3-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pendingDeleteId !== null && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDeleteId(null); }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><span className="dialog-icon" aria-hidden="true">!</span><h2 id="delete-title">Delete this reading?</h2><p id="delete-description">This will permanently remove the selected measurement from your history.</p><div className="dialog-actions"><button className="button button-secondary" type="button" onClick={() => setPendingDeleteId(null)}>Keep reading</button><button className="button button-danger" type="button" onClick={handleDelete}>Delete reading</button></div></section></div>}
    </main>
  );
}