import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { lazy, Suspense } from "react";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const GlucoseReadings = lazy(() => import("./pages/GlucoseReadings"));
const HealthProfile = lazy(() => import("./pages/HealthProfile"));
import Navbar from "./components/Navbar";

import { useAuth } from "./context/AuthContext";
import { Helmet, HelmetProvider } from "react-helmet-async";

function RouteContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();

  return (
    <Suspense fallback={<main className="page-content route-loading" aria-label="Loading page"><div className="loading-ripple" /><p>Opening your health space</p></main>}>
      <div className="route-frame" key={location.pathname}>
        <Routes location={location}>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <><Helmet><title>Sign in · GlucoMind</title></Helmet><Login /></>} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <><Helmet><title>Create account · GlucoMind</title></Helmet><Register /></>} />
          <Route path="/dashboard" element={isAuthenticated ? <><Helmet><title>Overview · GlucoMind</title></Helmet><Dashboard /></> : <Navigate to="/login" replace />} />
          <Route path="/readings" element={isAuthenticated ? <><Helmet><title>Glucose readings · GlucoMind</title></Helmet><GlucoseReadings /></> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isAuthenticated ? <><Helmet><title>Health profile · GlucoMind</title></Helmet><HealthProfile /></> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Suspense>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="app-shell">
          {isAuthenticated && <Navbar />}
          <RouteContent isAuthenticated={isAuthenticated} />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;