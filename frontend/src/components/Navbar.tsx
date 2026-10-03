import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to="/dashboard" aria-label="GlucoMind home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 4.5v23M4.5 16h23" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span>Gluco<span className="brand-accent">Mind</span></span>
        </Link>

        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Overview
          </NavLink>
          <NavLink to="/readings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Readings
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Health profile
          </NavLink>
        </nav>

        <button className="logout-button" type="button" onClick={handleLogout}>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8m3-3 4-4-4-4m4 4H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}