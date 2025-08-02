import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LandingHeader from "../components/LandingHeader";

type Props = {
  onLogin: () => void;
  onGoRegister: () => void;
};

export default function Login({ onLogin, onGoRegister }: Props) {
  const [username, setUsername] = useState(
    () => localStorage.getItem("rememberedUsername") || ""
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    () => Boolean(localStorage.getItem("rememberedUsername"))
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/login`,
        { username, password }
      );

      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("rememberedUsername", username);
      } else {
        sessionStorage.setItem("token", res.data.token);
        localStorage.removeItem("rememberedUsername");
      }

      setMessage("");
      onLogin();
    } catch (err) {
      setMessage(
        "Username or password is incorrect. Please try again or reset your password."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LandingHeader
        onLoginClick={handleLogin}
        onRegisterClick={onGoRegister}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="max-w-md mx-auto mt-20 sm:mt-10 bg-white p-8 rounded-lg shadow space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {message && (
          <p role="alert" className="text-red-600 text-sm text-center">
            {message}
          </p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          aria-label="Submit login form"
          disabled={!username || !password}
          className={`w-full bg-blue-600 text-white py-2 rounded font-medium transition ${
            !username || !password
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-700"
          }`}
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600">
          Forgot your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/reset")}
            className="text-blue-600 hover:underline font-medium"
          >
            Reset here
          </button>
        </p>
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={onGoRegister}
            className="text-blue-600 hover:underline font-medium"
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}