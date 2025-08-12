import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { authHeaders, getToken } from "../authHeaders";

export default function Profile() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [customExercises, setCustomExercises] = useState<{ [key: string]: string[] }>({});
  const [feedback, setFeedback] = useState<{ text: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/me`,
          { headers: authHeaders() }
        );
        setName(res.data.name || "");
        setUsername(res.data.username || "");
      } catch {
        setFeedback({ text: "Error fetching profile", type: "error" });
      }
    };

    fetchProfile();

    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/custom-exercises`,
        { headers: authHeaders() }
      )
      .then((res) => {
        const data = res.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setCustomExercises(data);
        } else {
          setCustomExercises({});
        }
      })
      .catch((err) => {
        console.error("Failed to fetch custom exercises:", err);
        setFeedback({ text: "Error loading custom exercises", type: "error" });
      });
  }, []);

  const handleChangePassword = async () => {
    const token = getToken();
    if (!token) {
      setFeedback({ text: "You must be logged in.", type: "error" });
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/change-password`,
        { oldPassword, newPassword: password },
        { headers: authHeaders() }
      );
      setFeedback({ text: "Password changed successfully", type: "success" });
      setPassword("");
      setOldPassword("");
      setShowChangePassword(false);
    } catch {
      setFeedback({ text: "Error changing password", type: "error" });
    }
  };

  const deleteCustomExercise = async (muscleGroup: string, exerciseName: string) => {
    const token = getToken();
    if (!token) {
      setFeedback({ text: "You must be logged in.", type: "error" });
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/custom-exercises`,
        { headers: authHeaders(), data: { muscleGroup, exerciseName } }
      );
      setCustomExercises((prev) => {
        const updated = { ...prev };
        updated[muscleGroup] = updated[muscleGroup].filter((ex) => ex !== exerciseName);
        if (updated[muscleGroup].length === 0) delete updated[muscleGroup];
        return updated;
      });
      setFeedback({ text: `Deleted "${exerciseName}" from ${muscleGroup}`, type: "success" });
    } catch {
      setFeedback({ text: "Failed to delete exercise", type: "error" });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Profile</h2>

        {feedback && (
          <p
            role="alert"
            className={`text-center ${
              feedback.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <input
          type="text"
          value={name}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-sm"
        />

        <input
          type="text"
          value={username}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-sm"
        />

        {!showChangePassword && (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition"
          >
            Change Password
          </button>
        )}

        {showChangePassword && (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleChangePassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
            >
              Save Password
            </button>
            <button
              onClick={() => setShowChangePassword(false)}
              className="w-full text-sm text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Manage Custom Exercises</h3>
          {Object.keys(customExercises).length === 0 && (
            <p className="text-sm text-gray-500">No custom exercises added yet.</p>
          )}
          {Object.entries(customExercises).map(([muscleGroup, exercises]) => (
            <div key={muscleGroup} className="mb-4">
              <h4 className="font-medium text-gray-700">{muscleGroup.toUpperCase()}</h4>
              <ul className="list-disc ml-5">
                {exercises.map((ex) => (
                  <li key={ex} className="flex justify-between items-center">
                    <span className="text-sm">{ex}</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${ex}" from ${muscleGroup}?`)) {
                          deleteCustomExercise(muscleGroup, ex);
                        }
                      }}
                      className="text-red-500 text-sm ml-4 hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
