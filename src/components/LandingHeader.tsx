import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LandingHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingHeader({
  onLoginClick,
  onRegisterClick,
}: LandingHeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gray-50 px-8 py-4 flex items-center justify-between">
      {/* Brand */}
      <button
        onClick={() => {
          navigate("/");
          setMenuOpen(false);
        }}
        className="text-2xl font-extrabold text-gray-800 hover:text-blue-300 transition transform hover:scale-105"
        aria-label="Go to home"
      >
        Hypertrophy Tracker
      </button>

      {/* Desktop actions */}
      <div className="hidden sm:flex space-x-4">
        <button
          onClick={onRegisterClick}
          className="px-4 py-1 font-medium text-gray-700 hover:text-blue-600 transition"
        >
          Sign Up
        </button>
        <button
          onClick={onLoginClick}
          className="px-4 py-1 font-medium text-gray-700 hover:text-blue-600 transition"
        >
          Login
        </button>
      </div>

      <button
        className="sm:hidden flex flex-col justify-between w-6 h-5 focus:outline-none"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <span className="block w-full h-0.5 bg-gray-800" />
        <span className="block w-full h-0.5 bg-gray-800" />
        <span className="block w-full h-0.5 bg-gray-800" />
      </button>

      {menuOpen && (
        <div className="sm:hidden absolute top-full inset-x-0 bg-white">
          <ul className="flex flex-col p-4 space-y-2">
            <li>
              <button
                onClick={() => {
                  onRegisterClick();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1 font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Sign Up
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onLoginClick();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1 font-medium text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}