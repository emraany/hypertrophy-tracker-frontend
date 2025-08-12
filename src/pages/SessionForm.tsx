import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { getToken, authHeaders } from "../authHeaders";

function getLocalISODate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

type Session = {
  _id?: string;
  date: string;
  exercises: {
    muscleGroup: string;
    exercise: string;
    customExercise?: string;
    sets: { reps: number; weight: number }[];
    exercisesList?: string[];
    loadingExercises?: boolean;
  }[];
};

type Props = {
  sessionToRepeat: Session | null;
};

const muscleOptions = [
  "Abdominals","Abductors","Adductors","Biceps","Calves","Chest","Forearms",
  "Glutes","Hamstrings","Lats","Lower back","Middle back","Neck",
  "Quadriceps","Shoulders","Traps","Triceps","Other"
];

const controlClass =
  "w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring focus:ring-blue-200";

export default function SessionForm({ sessionToRepeat }: Props) {
  const [date, setDate] = useState(getLocalISODate());
  const [exercises, setExercises] = useState<Session["exercises"]>([{
    muscleGroup: "",
    exercise: "",
    sets: [{ reps: 0, weight: 0 }],
    exercisesList: [],
    loadingExercises: false,
  }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  const BACKEND = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${BACKEND}/api/health`)
      .then(res => res.ok ? setApiStatus("online") : Promise.reject())
      .catch(() => setApiStatus("offline"));
  }, [BACKEND]);

  useEffect(() => {
    if (!sessionToRepeat) return;
    setDate(getLocalISODate());

    (async () => {
      const newExercises = await Promise.all(
        sessionToRepeat.exercises.map(async (ex) => {
          const copy = {
            muscleGroup:      ex.muscleGroup,
            customExercise:   ex.customExercise,
            sets:             ex.sets.map(s => ({ reps: s.reps, weight: s.weight })),
            exercisesList:    [] as string[],
            loadingExercises: false,
            exercise:         "",
          };

          if (ex.muscleGroup.toLowerCase() !== "other") {
            try {
              const [apiRes, customRes] = await Promise.all([
                axios.get(
                  `https://api.api-ninjas.com/v1/exercises?muscle=${ex.muscleGroup}`,
                  { headers: { "X-Api-Key": import.meta.env.VITE_REACT_APP_API_NINJA_KEY } }
                ),
                axios.get(`${BACKEND}/api/custom-exercises`, { headers: authHeaders() })
              ]);

              const apiNames    = apiRes.data.map((e: any) => e.name);
              const customNames = (customRes.data[ex.muscleGroup] || []) as string[];

              copy.exercisesList = Array.from(
                new Set([ex.exercise, ...apiNames, ...customNames].filter(Boolean))
              );
            } catch {
              copy.exercisesList = ex.exercise ? [ex.exercise] : [];
            }
            copy.exercise = ex.exercise;
          } else {
            copy.exercise = "other";
            copy.exercisesList = [];
          }

          return copy;
        })
      );
      setExercises(newExercises);
    })();
  }, [sessionToRepeat, BACKEND]);

  const handleMuscleChange = async (
    index: number,
    value: string,
    preselectedExercise?: string
  ) => {
    const updated = [...exercises];
    updated[index].muscleGroup = value;
    updated[index].exercise = "";
    updated[index].customExercise = "";
    updated[index].exercisesList = [];
    updated[index].loadingExercises = true;

    if (value && value !== "Other") {
      try {
        const [apiRes, customRes] = await Promise.all([
          axios.get(
            `https://api.api-ninjas.com/v1/exercises?muscle=${value}`,
            { headers: { "X-Api-Key": import.meta.env.VITE_REACT_APP_API_NINJA_KEY } }
          ),
          axios.get(`${BACKEND}/api/custom-exercises`, { headers: authHeaders() })
        ]);

        const apiNames    = apiRes.data.map((e: any) => e.name);
        const customNames = (customRes.data[value] || []) as string[];
        updated[index].exercisesList = Array.from(new Set([...apiNames, ...customNames]));

        if (preselectedExercise) {
          updated[index].exercise = preselectedExercise;
        }
      } catch {
        updated[index].exercisesList = [];
      }
    }

    updated[index].loadingExercises = false;
    setExercises(updated);
  };

  const handleExerciseChange = (index: number, value: string) => {
    const updated = [...exercises];
    updated[index].exercise = value;
    if (value !== "other") updated[index].customExercise = "";
    setExercises(updated);
  };

  const handleSetChange = (
    exIdx: number,
    setIdx: number,
    field: "reps" | "weight",
    value: number
  ) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        muscleGroup: "",
        exercise: "",
        sets: [{ reps: 0, weight: 0 }],
        exercisesList: [],
        loadingExercises: false,
      },
    ]);
  };

  const addSet = (exIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets.push({ reps: 0, weight: 0 });
    setExercises(updated);
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets.splice(setIdx, 1);
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const t = getToken();
    if (!t) {
      setFormError("You must be logged in to save a session.");
      return;
    }

    const isValid = exercises.length > 0 && exercises.every(ex => {
      if (!ex.muscleGroup) return false;
      if (!ex.exercise) return false;
      if (ex.exercise === "other" && !ex.customExercise) return false;
      if (ex.sets.length === 0) return false;
      if (ex.sets.some(set => isNaN(set.reps) || isNaN(set.weight))) return false;
      return true;
    });

    if (!isValid) {
      setFormError("Session information incomplete, please fill it out and try again.");
      return;
    }

    for (const ex of exercises) {
      if (ex.exercise === "other" && ex.customExercise && ex.muscleGroup) {
        try {
          await axios.post(
            `${BACKEND}/api/custom-exercises`,
            { muscleGroup: ex.muscleGroup, exerciseName: ex.customExercise },
            { headers: authHeaders() }
          );
        } catch {
        }
      }
    }

    const payload = {
      date,
      exercises: exercises.map((ex) => ({
        muscleGroup: ex.muscleGroup,
        exercise: ex.exercise === "other" ? ex.customExercise || "Other" : ex.exercise,
        sets: ex.sets,
      })),
    };

    await axios.post(`${BACKEND}/api/sessions`, payload, { headers: authHeaders() });

    setSuccessMessage("Session saved!");
    setExercises([{
      muscleGroup: "",
      exercise: "",
      sets: [{ reps: 0, weight: 0 }],
      exercisesList: [],
      loadingExercises: false,
    }]);
  };

  return (
    <Layout>
      {/* API status */}
      <div aria-live="polite" className="max-w-3xl mx-auto mb-4">
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded px-4 py-2 space-x-2">
          <span className="font-medium text-sm text-gray-700">API Status:</span>
          <span
            className={`h-3 w-3 rounded-full ${
              apiStatus === "online"
                ? "bg-green-500"
                : apiStatus === "offline"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {apiStatus === "online"
              ? "Working"
              : apiStatus === "offline"
              ? "Backend unreachable – exercises may not load"
              : "Checking..."}
          </span>
        </div>
      </div>

      {/* Warning */}
      <div className="max-w-3xl mx-auto mb-4">
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded px-4 py-2">
          <span className="text-sm text-gray-600">
            Not all exercises can be found in the dropdown—select “Other” to add your own.
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        aria-labelledby="session-form-heading"
        className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto space-y-6"
      >
        <h2 id="session-form-heading" className="text-3xl font-bold text-center text-gray-800">
          Log Training Session
        </h2>

        {formError && (
          <p role="alert" className="text-red-600 text-sm text-center">
            {formError}
          </p>
        )}
        {!formError && successMessage && (
          <p role="alert" className="text-green-600 text-sm text-center">
            {successMessage}
          </p>
        )}

        {/* Date */}
        <div>
          <label htmlFor="date-input" className="block mb-1 font-medium text-sm text-gray-700">
            Date
          </label>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={controlClass}
            required
          />
        </div>

        {/* Exercises */}
        {exercises.map((ex, exIdx) => (
          <div key={exIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Exercise {exIdx + 1}</h3>

            <div className="space-y-2">
              <label htmlFor={`muscle-group-${exIdx}`} className="block text-sm font-medium text-gray-700">
                Muscle Group
              </label>
              <select
                id={`muscle-group-${exIdx}`}
                value={ex.muscleGroup}
                onChange={(e) => handleMuscleChange(exIdx, e.target.value)}
                className={controlClass}
              >
                <option value="">Select Muscle Group</option>
                {muscleOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {ex.loadingExercises && <p className="text-sm text-gray-500">Loading exercises...</p>}

              {ex.muscleGroup && (
                <>
                  <label htmlFor={`exercise-select-${exIdx}`} className="block text-sm font-medium text-gray-700">
                    Exercise
                  </label>
                  <select
                    id={`exercise-select-${exIdx}`}
                    value={ex.exercise}
                    onChange={(e) => handleExerciseChange(exIdx, e.target.value)}
                    className={controlClass}
                  >
                    <option value="">Select Exercise</option>
                    {ex.muscleGroup !== "Other" &&
                      ex.exercisesList?.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    <option value="other">Other</option>
                  </select>
                </>
              )}

              {ex.exercise === "other" && (
                <>
                  <label htmlFor={`custom-exercise-${exIdx}`} className="block text-sm font-medium text-gray-700">
                    Custom Exercise
                  </label>
                  <input
                    id={`custom-exercise-${exIdx}`}
                    type="text"
                    placeholder="Enter custom exercise"
                    value={ex.customExercise || ""}
                    onChange={(e) => {
                      const updated = [...exercises];
                      updated[exIdx].customExercise = e.target.value;
                      setExercises(updated);
                    }}
                    className={controlClass}
                  />
                </>
              )}
            </div>

            {/* Sets */}
            <fieldset className="space-y-2" aria-labelledby={`sets-${exIdx}-legend`}>
              <legend id={`sets-${exIdx}-legend`} className="font-medium text-gray-700">Sets</legend>
              {ex.sets.map((s, setIdx) => (
                <div key={setIdx} className="flex items-center gap-2">
                  <label htmlFor={`reps-${exIdx}-${setIdx}`} className="sr-only">Reps</label>
                  <input
                    id={`reps-${exIdx}-${setIdx}`}
                    type="number"
                    placeholder="Reps"
                    value={s.reps || ""}
                    onChange={(e) => handleSetChange(exIdx, setIdx, "reps", parseInt(e.target.value, 10) || 0)}
                    className={`${controlClass.split(" focus")[0]} w-1/2`}
                  />
                  <label htmlFor={`weight-${exIdx}-${setIdx}`} className="sr-only">Weight</label>
                  <input
                    id={`weight-${exIdx}-${setIdx}`}
                    type="number"
                    placeholder="Weight"
                    value={s.weight || ""}
                    onChange={(e) => handleSetChange(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)}
                    className={`${controlClass.split(" focus")[0]} w-1/2`}
                  />
                  {ex.sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(exIdx, setIdx)}
                      className="text-red-500 text-sm"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addSet(exIdx)} className="text-blue-600 text-sm font-medium">
                + Add Set
              </button>
            </fieldset>
          </div>
        ))}

        {/* Add another exercise */}
        <button
          type="button"
          onClick={addExercise}
          className="w-full bg-gray-100 border border-gray-300 py-2 rounded text-sm hover:bg-gray-200 transition"
        >
          + Add Another Exercise
        </button>

        <div className="flex flex-col sm:flex-row gap-4">
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition">
            Save Session
          </button>
          <button
            type="button"
            onClick={() =>
              setExercises([{
                muscleGroup: "",
                exercise: "",
                sets: [{ reps: 0, weight: 0 }],
                exercisesList: [],
                loadingExercises: false,
              }])
            }
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-medium transition"
          >
            Clear Form
          </button>
        </div>
      </form>
    </Layout>
  );
}
