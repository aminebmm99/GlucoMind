import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDashboardSummary,
  getDashboardPeriod,
} from "../services/dashboard.service";

import type {
  DashboardSummary,
  GlucoseReading,
} from "../types/api";

export default function Dashboard() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [readings, setReadings] =
    useState<GlucoseReading[]>([]);

  const [period, setPeriod] =
    useState<"today" | "7d" | "30d">("7d");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [summaryData, periodData] =
          await Promise.all([
            getDashboardSummary(),
            getDashboardPeriod(period),
          ]);

        setSummary(summaryData);
        setReadings(periodData.readings);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [period, retryCount]);

  if (loading) {
    return (
      <main className="page-content" aria-busy="true">
        <div className="page-heading">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-copy" />
        </div>
        <div className="metric-grid">
          {[1, 2, 3, 4].map((item) => <div className="panel metric-card" key={item}><div className="skeleton skeleton-copy" /><div className="skeleton skeleton-value" /></div>)}
        </div>
        <div className="panel chart-panel"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-chart" /></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-content">
        <div className="page-heading">
          <p className="eyebrow">YOUR HEALTH, IN VIEW</p>
          <h1>Good to see you</h1>
        </div>
        <section className="state-card state-error" role="alert">
          <span className="state-icon" aria-hidden="true">!</span>
          <h2>We couldn’t load your overview</h2>
          <p>{error}. Please check your connection and try again.</p>
          <button className="button button-primary" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
        </section>
      </main>
    );
  }

  const chartData = readings.map((reading) => ({
    date: new Date(reading.measuredAt).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
    time: new Date(reading.measuredAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    glucose: reading.glucoseValue,
    unit: reading.unit,
  }));

  return (
    <main className="page-content">
      <header className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">YOUR HEALTH, IN VIEW</p>
          <h1>Your glucose overview</h1>
          <p className="page-subtitle">A clear look at the readings you’ve recorded.</p>
        </div>
        <Link className="button button-primary" to="/readings">
          <span className="button-plus" aria-hidden="true">＋</span> Add a reading
        </Link>
      </header>

      <section className="metric-grid" aria-label="Glucose summary">
        <article className="panel metric-card metric-total">
          <div className="metric-topline"><span className="metric-icon" aria-hidden="true">↗</span><span className="metric-label">Total readings</span></div>
          <p className="metric-value">{summary?.totalReadings ?? 0}</p>
          <p className="metric-caption">All recorded measurements</p>
        </article>
        <article className="panel metric-card metric-average">
          <div className="metric-topline"><span className="metric-icon" aria-hidden="true">∿</span><span className="metric-label">Average glucose</span></div>
          <p className="metric-value">{summary?.averageGlucose !== null && summary?.averageGlucose !== undefined ? summary.averageGlucose.toFixed(1) : "—"}<span className="metric-unit"> mg/dL</span></p>
          <p className="metric-caption">Across your recorded readings</p>
        </article>
        <article className="panel metric-card metric-low">
          <div className="metric-topline"><span className="metric-icon" aria-hidden="true">↓</span><span className="metric-label">Lowest</span></div>
          <p className="metric-value">{summary?.minimumGlucose ?? "—"}<span className="metric-unit"> mg/dL</span></p>
          <p className="metric-caption">Lowest recorded measurement</p>
        </article>
        <article className="panel metric-card metric-high">
          <div className="metric-topline"><span className="metric-icon" aria-hidden="true">↑</span><span className="metric-label">Highest</span></div>
          <p className="metric-value">{summary?.maximumGlucose ?? "—"}<span className="metric-unit"> mg/dL</span></p>
          <p className="metric-caption">Highest recorded measurement</p>
        </article>
      </section>

      <section className="panel chart-panel">
        <div className="section-heading chart-heading">
          <div>
            <p className="eyebrow">YOUR HISTORY</p>
            <h2>Glucose trends</h2>
            <p className="section-description">Explore how your readings have changed over time.</p>
          </div>
          <label className="visually-hidden" htmlFor="period">Choose a time period</label>
          <select id="period" className="period-select" value={period} onChange={(event) => setPeriod(event.target.value as "today" | "7d" | "30d")}>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {chartData.length === 0 ? (
          <div className="chart-empty">
            <span className="empty-illustration" aria-hidden="true">⌁</span>
            <h3>No readings in this period</h3>
            <p>Choose another time period or add a reading to start seeing your trends.</p>
            <Link className="text-link" to="/readings">Go to readings <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <div className="chart-wrap" role="img" aria-label={`Glucose readings for ${period === "today" ? "today" : period === "7d" ? "the last 7 days" : "the last 30 days"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 14, bottom: 4, left: -10 }}>
                <CartesianGrid stroke="#e8eeeb" strokeDasharray="4 5" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#82918b", fontSize: 12 }} tickMargin={14} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#82918b", fontSize: 12 }} tickMargin={10} width={48} />
                <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload ? `${payload[0].payload.date} · ${payload[0].payload.time}` : ""} formatter={(value, _name, item) => [`${value} ${item.payload.unit}`, "Glucose"]} contentStyle={{ border: "1px solid #e3ebe7", borderRadius: "12px", boxShadow: "0 8px 24px rgba(29, 59, 45, .1)" }} />
                <Line type="monotone" dataKey="glucose" name="Glucose" stroke="#16866c" strokeWidth={3} dot={{ r: 4, fill: "#fff", stroke: "#16866c", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#16866c", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="panel latest-panel">
        <div className="section-heading latest-heading">
          <div><p className="eyebrow">MOST RECENT</p><h2>Latest reading</h2></div>
          <Link className="text-link" to="/readings">View all readings <span aria-hidden="true">→</span></Link>
        </div>
        {summary?.latestReading ? (
          <div className="latest-reading">
            <span className="latest-dot" aria-hidden="true" />
            <div className="latest-number">{summary.latestReading.glucoseValue}<span> {summary.latestReading.unit}</span></div>
            <div className="latest-details">
              <strong>{summary.latestReading.context ? summary.latestReading.context.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "No context specified"}</strong>
              <span>{new Date(summary.latestReading.measuredAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
              {summary.latestReading.notes && <p>{summary.latestReading.notes}</p>}
            </div>
          </div>
        ) : (
          <div className="latest-empty"><p>No readings have been recorded yet.</p><Link className="text-link" to="/readings">Add your first reading <span aria-hidden="true">→</span></Link></div>
        )}
      </section>
    </main>
  );
}