import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SessionForm from "./pages/SessionForm";
import SessionList from "./pages/SessionList";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Reset from "./pages/Reset";
import ReportIssue from "./pages/ReportIssue";

type Session = {
  _id: string;
  date: string;
  exercises: {
    muscleGroup: string;
    exercise: string;
    sets: { reps: number; weight: number }[];
  }[];
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionToRepeat, setSessionToRepeat] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  const noNavPaths = ['/', '/login', '/register', '/reset'];
  const view =
    path === "/home"
      ? "home"
      : path === "/form"
      ? "form"
      : path === "/history"
      ? "history"
      : path === "/progress"
      ? "progress"
      : path === "/profile"
      ? "profile"
      : "";

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setSessionToRepeat(null);
    navigate("/home");
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  setIsLoggedIn(false);
  setSessionToRepeat(null);
  navigate("/");
};


  const handleRepeatSession = (session: Session) => {
    setSessionToRepeat(session);
    navigate("/form");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && !noNavPaths.includes(path) && (
        <Navbar
          view={view}
          setView={(v) => navigate(v === "home" ? "/home" : `/${v}`)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}
      <div className="pt-20 p-4">
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                onLoginClick={() => navigate("/login")}
                onRegisterClick={() => navigate("/register")}
              />
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn
                ? <Navigate to="/home" replace />
                : <Login onLogin={handleLogin} onGoRegister={() => navigate("/register")} />
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn
                ? <Navigate to="/home" replace />
                : <Register onRegistered={() => navigate("/login")} onGoLogin={() => navigate("/login")} />
            }
          />
          <Route
            path="/home"
            element={
              isLoggedIn ? (
                <Home setView={(v) => navigate(`/${v}`)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/form"
            element={
              isLoggedIn ? (
                <SessionForm key={sessionToRepeat?._id ?? "fresh"} sessionToRepeat={sessionToRepeat} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/history"
            element={isLoggedIn ? <SessionList onRepeat={handleRepeatSession} /> : <Navigate to="/login" replace />}
          />
          <Route path="/progress" element={isLoggedIn ? <Progress /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
