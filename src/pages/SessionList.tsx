import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

type Session = {
  _id: string;
  date: string;
  exercises: {
    muscleGroup: string;
    exercise: string;
    sets: { reps: number; weight: number }[];
  }[];
};

type SessionListProps = {
  onRepeat: (session: Session) => void;
};

const controlClass =
  "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const linkButtonClass =
  "text-sm underline transition hover:text-blue-800";

export default function SessionList({ onRepeat }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editing, setEditing] = useState<Session | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSessions(res.data))
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/sessions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert("Error deleting session");
    }
  };

  const handleEdit = (session: Session) => {
    setFormError(null);
    setEditing(JSON.parse(JSON.stringify(session)));
  };

  const handleRepeat = (session: Session) => {
    onRepeat(session);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (
      editing.exercises.some((ex) =>
        ex.sets.some((s) => isNaN(s.reps) || isNaN(s.weight))
      )
    ) {
      setFormError("All reps and weights must be numbers.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/sessions/${editing._id}`,
        editing,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(null);
      fetchSessions();
    } catch (err) {
      setFormError("Error updating session.");
    }
  };

  const handleSetChange = (
    exIdx: number,
    setIdx: number,
    field: "reps" | "weight",
    value: number
  ) => {
    if (!editing) return;
    const updated = { ...editing };
    updated.exercises[exIdx].sets[setIdx][field] = value;
    setEditing(updated);
  };
  
  const handleAddSet = (exIdx: number) => {
    if (!editing) return;
    const updated = { ...editing };
    updated.exercises[exIdx].sets.push({ reps: 0, weight: 0 });
    setEditing(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    if (!editing) return;
    const updated = { ...editing };
    updated.exercises[exIdx].sets.splice(setIdx, 1);
    setEditing(updated);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 p-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 pb-2">
          Session History
        </h2>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white shadow-md border border-gray-200 rounded-lg p-4 space-y-3 relative"
            >
              <div className="text-sm text-gray-500">{session.date}</div>

              {session.exercises.map((ex, exIndex) => (
                <div
                  key={exIndex}
                  className="border border-gray-200 p-3 rounded bg-gray-50"
                >
                  <div className="font-semibold text-gray-800 mb-1">
                    {ex.exercise} ({ex.muscleGroup})
                  </div>
                  <ul className="ml-4 list-disc text-sm text-gray-700">
                    {ex.sets.map((set, setIdx) => (
                      <li key={setIdx}>
                        {set.reps} reps @ {set.weight} lbs
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="flex gap-3 justify-end text-sm mt-2">
                <button
                  onClick={() => handleRepeat(session)}
                  className="text-green-600 hover:text-green-800 underline"
                >
                  Repeat
                </button>
                <button
                  onClick={() => handleEdit(session)}
                  className="text-yellow-600 hover:text-yellow-800 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(session._id)}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Delete
                </button>
              </div>

              {editing && editing._id === session._id && (
                <form
                  onSubmit={handleEditSave}
                  aria-labelledby="edit-session-heading"
                  className="mt-4 bg-white border border-gray-200 shadow-md p-6 rounded-lg space-y-6"
                >
                  <h3
                    id="edit-session-heading"
                    className="text-lg font-semibold"
                  >
                    Edit Session
                  </h3>

                  {formError && (
                    <p role="alert" className="text-red-600 text-sm text-center">
                      {formError}
                    </p>
                  )}

                  <div>
                    <label
                      htmlFor="edit-date-input"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date
                    </label>
                    <input
                      id="edit-date-input"
                      type="date"
                      value={editing.date}
                      onChange={(e) =>
                        setEditing({ ...editing, date: e.target.value })
                      }
                      className={controlClass}
                    />
                  </div>

                  {editing.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="bg-gray-50 border border-gray-200 p-4 rounded space-y-4"
                    >
                      <h4 className="font-medium text-gray-800">
                        Exercise {exIdx + 1}
                      </h4>

                      {ex.sets.map((set, setIdx) => (
                        <div
                          key={setIdx}
                          className="flex items-center gap-4"
                        >
                          <label
                            htmlFor={`reps-${exIdx}-${setIdx}`}
                            className="sr-only"
                          >
                            Reps
                          </label>
                          <input
                            id={`reps-${exIdx}-${setIdx}`}
                            type="number"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={(e) =>
                              handleSetChange(
                                exIdx,
                                setIdx,
                                "reps",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className={`${controlClass} w-1/2`}
                          />

                          <label
                            htmlFor={`weight-${exIdx}-${setIdx}`}
                            className="sr-only"
                          >
                            Weight
                          </label>
                          <input
                            id={`weight-${exIdx}-${setIdx}`}
                            type="number"
                            placeholder="Weight"
                            value={set.weight}
                            onChange={(e) =>
                              handleSetChange(
                                exIdx,
                                setIdx,
                                "weight",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={`${controlClass} w-1/2`}
                          />

                          {editing.exercises[exIdx].sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSet(exIdx, setIdx)
                              }
                              className="text-red-500 text-xl leading-none"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddSet(exIdx)}
                        className="text-blue-600 text-xs font-medium"
                      >
                        + Add Set
                      </button>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className={linkButtonClass}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}