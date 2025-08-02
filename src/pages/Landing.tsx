import LandingHeader from "../components/LandingHeader";
import { Link } from "react-router-dom";

type LandingProps = {
  onLoginClick: () => void;
  onRegisterClick: () => void;
};

export default function Landing({ onLoginClick, onRegisterClick }: LandingProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <LandingHeader onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-screen-xl flex flex-col md:flex-row items-center justify-between gap-20">
          <div className="md:w-2/5">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Track your training. Measure your growth</h1>
            <p className="mb-6">
              Whether you're bulking or cutting, keep your gains organized and build with intention using Hypertrophy Tracker.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/Register" className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700">Get Started →</Link>
              <Link to="/Login" className="text-sm text-blue-600 underline">Already a user? Sign in</Link>
            </div>
          </div>
          <div className="md:w-3/5">
            <img
              src="/images/curling-dumbells.jpg"
              alt="Dumbbell Curl"
              className="w-full rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
}