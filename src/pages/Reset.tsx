import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";

export default function Reset() {
  useEffect(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }, []);

  const [step, setStep] = useState<"username" | "security" | "reset" | "done">(
    "username"
  );
  const [username, setUsername] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState(["", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const isUsernameStepValid = username.trim().length > 0;
  const isSecurityStepValid = answers.every((ans) => ans.trim().length > 0);
  const isResetStepValid =
    newPassword.trim().length > 0 && newPassword === confirmPassword;
  const isValid =
    (step === "username" && isUsernameStepValid) ||
    (step === "security" && isSecurityStepValid) ||
    (step === "reset" && isResetStepValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "username") {
      if (!isUsernameStepValid) {
        setMessage("Please enter your username.");
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/security-questions?username=${encodeURIComponent(
            username
          )}`
        );
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setSecurityQuestions(data.questions);
        setStep("security");
        setMessage("");
      } catch {
        setMessage("Unable to find user or fetch questions.");
      }

    } else if (step === "security") {
      try {
        const payload = {
          username,
          securityAnswers: securityQuestions.map((q, i) => ({
            question: q,
            answer: answers[i],
          })),
        };
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/verify-security-answers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error();
        setStep("reset");
        setMessage("");
      } catch {
        setMessage("Answers incorrect. Try again.");
      }

    } else if (step === "reset") {
      if (!newPassword) {
        setMessage("Enter a new password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, newPassword }),
          }
        );
        if (!res.ok) throw new Error();
        setMessage("");
        setStep("done");
      } catch {
        setMessage("Failed to reset password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader
        onLoginClick={() => (window.location.href = "/login")}
        onRegisterClick={() => (window.location.href = "/register")}
      />

      {/* Multi-step form */}
      {step !== "done" && (
        <form
          onSubmit={handleSubmit}
          aria-labelledby="reset-heading"
          className="max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg space-y-6"
        >
          <h2
            id="reset-heading"
            className="text-2xl font-bold text-center text-gray-800"
          >
            {step === "username"
              ? "Reset Password"
              : step === "security"
              ? "Answer Security Questions"
              : "Set New Password"}
          </h2>

          {message && (
            <p role="alert" className="text-red-600 text-sm text-center">
              {message}
            </p>
          )}

          {step === "username" && (
            <div>
              <label
                htmlFor="username-input"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {step === "security" &&
            securityQuestions.map((q, i) => (
              <div key={i} className="space-y-1">
                <label
                  htmlFor={`answer-${i}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {q}
                </label>
                <input
                  id={`answer-${i}`}
                  type="text"
                  value={answers[i]}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                  className={inputClass}
                />
              </div>
            ))}

          {step === "reset" && (
            <>
              <div>
                <label
                  htmlFor="new-password-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="new-password-input"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password-input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full bg-blue-600 text-white py-2 rounded font-medium transition ${
              !isValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {step === "reset" ? "Save New Password" : "Next"}
          </button>
        </form>
      )}

      {/* Completion state */}
      {step === "done" && (
        <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg space-y-6 text-center">
          <p className="text-green-600 font-medium">
            Password saved. You can now log in.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              sessionStorage.removeItem("token");
              navigate("/login");
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
          >
            Log in
          </button>
        </div>
      )}
    </div>
  );
}
