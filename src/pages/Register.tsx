import { useState } from "react";
import axios from "axios";
import LandingHeader from "../components/LandingHeader";

type Props = {
  onRegistered: () => void;
  onGoLogin: () => void;
};

export default function Register({ onRegistered, onGoLogin }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [question1, setQuestion1] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [message, setMessage] = useState("");

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const isValid =
    username.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword &&
    question1.trim().length > 0 &&
    answer1.trim().length > 0 &&
    question2.trim().length > 0 &&
    answer2.trim().length > 0;

  const handleRegister = async () => {
    if (!username.trim()) {
      setMessage("Username is required");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (!question1 || !answer1 || !question2 || !answer2) {
      setMessage("Please complete both security questions");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/register`,
        {
          name,
          username,
          password,
          securityQuestions: [
            { question: question1, answer: answer1 },
            { question: question2, answer: answer2 },
          ],
        }
      );
      setMessage("Registered! You can now log in.");
      onRegistered();
    } catch (err: any) {
  if (err.response?.status === 400 && err.response?.data?.message === "Username already taken") {
    setMessage("Username is already in use. Please choose another.");
  } else {
    setMessage("Error registering. Please try again.");
  }
}
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LandingHeader
        onLoginClick={onGoLogin}
        onRegisterClick={() => {}}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
        className="max-w-md mx-auto mt-20 sm:mt-10 bg-white p-8 rounded-lg shadow space-y-6"
      >
        <h2
          id="register-heading"
          className="text-2xl font-bold text-center text-gray-800"
        >
          Register
        </h2>

        {message && (
          <p role="alert" className="text-center text-sm text-red-600">
            {message}
          </p>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="question1" className="block text-sm font-medium text-gray-700 mb-1">
              Security Question 1
            </label>
            <input
              id="question1"
              type="text"
              placeholder="Enter your own question"
              value={question1}
              onChange={(e) => setQuestion1(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            <label htmlFor="answer1" className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <input
              id="answer1"
              type="text"
              placeholder="Your answer"
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="question2" className="block text-sm font-medium text-gray-700 mb-1">
              Security Question 2
            </label>
            <input
              id="question2"
              type="text"
              placeholder="Enter your own question"
              value={question2}
              onChange={(e) => setQuestion2(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            <label htmlFor="answer2" className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <input
              id="answer2"
              type="text"
              placeholder="Your answer"
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          aria-label="Submit registration form"
          disabled={!isValid}
          className={`w-full bg-green-600 text-white py-2 rounded font-medium transition ${
            !isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          Register
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onGoLogin}
            className="text-blue-600 hover:underline font-medium"
          >
            Login here
          </button>
        </p>
      </form>
    </div>
  );
}