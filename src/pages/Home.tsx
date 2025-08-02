import { useEffect, useState } from "react";

type View = "form" | "progress" | "history";
type Props = { setView: (view: View) => void };

interface ExerciseSet {
  reps: number;
  weight: number;
}
interface Exercise {
  exercise: string;
  muscleGroup: string;
  sets: ExerciseSet[];
}
interface Session {
  date: string;
  exercises: Exercise[];
}

const interactiveCard = [
  "rounded-lg",
  "bg-white",
  "border",
  "border-gray-200",
  "hover:shadow-md",
  "transition",
  "p-6",
  "text-center",
].join(" ");

const staticCard = [
  "rounded-lg",
  "bg-white",
  "border",
  "border-gray-200",
  "p-6",
  "text-center",
].join(" ");

const dateFormatter = (iso: string) => {
  const [year, month, day] = iso.split("T")[0].split("-");
  const dt = new Date(+year, +month - 1, +day);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function Home({ setView }: Props) {
  const [name, setName] = useState("Athlete");
  const [sessionCount, setSessionCount] = useState(0);
  const [latestSession, setLatestSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const BACKEND = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const [meRes, sessionsRes] = await Promise.all([
          fetch(`${BACKEND}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND}/api/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (meRes.ok) {
          const { name: fetchedName } = await meRes.json();
          if (fetchedName) setName(fetchedName);
        }

        if (sessionsRes.ok) {
          const sessions: Session[] = await sessionsRes.json();
          setSessionCount(sessions.length);
          if (sessions.length) {
            sessions
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 1)
              .forEach((s) => setLatestSession(s));
          }
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, [BACKEND]);

  if (isLoading) {
    return (
      <main
        role="main"
        className="min-h-screen bg-gray-50 px-4 py-12 flex items-center justify-center"
      >
        <p className="text-gray-600">Loading…</p>
      </main>
    );
  }

  return (
    <main role="main" className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Welcome back, {name}!
          </h1>
          <p className="text-lg text-gray-600">
            Worked out today? Log it now!
          </p>
        </header>

        {/* Top row: interactive cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => setView("form")}
            className={interactiveCard}
            aria-label="Log a new workout session"
          >
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              Log Workout
            </h2>
            <p className="text-sm text-gray-500">
              Start a new training session
            </p>
          </button>

          <button
            onClick={() => setView("progress")}
            className={interactiveCard}
            aria-label="View your progress"
          >
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              View Progress
            </h2>
            <p className="text-sm text-gray-500">Check your stats and trends</p>
          </button>

          <button
            onClick={() => setView("history")}
            className={interactiveCard}
            aria-label="Browse workout history"
          >
            <h2 className="text-lg font-semibold text-purple-700 mb-2">
              Workout History
            </h2>
            <p className="text-sm text-gray-500">Browse past sessions</p>
          </button>
        </div>

        {/* Bottom row: static cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className={staticCard}>
            <h2 className="text-lg font-semibold text-indigo-700 mb-2">
              Total Sessions
            </h2>
            <p className="text-3xl font-bold text-gray-800">
              {sessionCount}
            </p>
          </div>

          <div className={staticCard}>
            <h2 className="text-lg font-semibold text-indigo-700 mb-2">
              Most Recent Session
            </h2>
            {latestSession ? (
              <>
                <p className="text-md text-gray-700 mb-2">
                  {dateFormatter(latestSession.date)}
                </p>
                <div className="text-left">
                  {latestSession.exercises.map((ex, i) => (
                    <div key={i} className="mb-4">
                      <h3 className="font-semibold text-gray-800">
                        {ex.exercise} ({ex.muscleGroup})
                      </h3>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {ex.sets.map((set, j) => (
                          <li key={j}>
                            {set.reps} reps @ {set.weight} lbs
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No sessions logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}