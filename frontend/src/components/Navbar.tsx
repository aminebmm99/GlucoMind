import { Link, NavLink, useNavigate } from "react-router-dom";
import { Activity, LayoutDashboard, LockKeyhole, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BrandMark from "./BrandMark";

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
          <BrandMark />
        </Link>

        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <LayoutDashboard aria-hidden="true" /> Overview
          </NavLink>
          <NavLink to="/readings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Activity aria-hidden="true" /> Readings
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <UserRound aria-hidden="true" /> Health profile
          </NavLink>
        </nav>

        <button className="logout-button" type="button" onClick={handleLogout}>
          <LogOut aria-hidden="true" />
          <span>Sign out</span>
        </button>
        <span className="nav-health-status"><LockKeyhole aria-hidden="true" /> Private workspace</span>
      </div>
    </header>
  );
}