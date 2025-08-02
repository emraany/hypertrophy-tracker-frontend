import { useState } from 'react';

type NavbarProps = {
  view: string;
  setView: (view: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
};

const navItems = [
  { name: 'Home', key: 'home' },
  { name: 'New Session', key: 'form' },
  { name: 'Session Log', key: 'history' },
  { name: 'Progress', key: 'progress' },
  { name: 'Profile', key: 'profile' },
  { name: 'Report Issue', key: 'report' },
];

export default function Navbar({
  view,
  setView,
  isLoggedIn,
  onLogout,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg z-50">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <button
          onClick={() => {
            setView('home');
            setMenuOpen(false);
          }}
          className="text-2xl font-extrabold hover:text-blue-300 transition"
          aria-label="Go to home"
        >
          Hypertrophy Tracker
        </button>

        {isLoggedIn && (
          <>
            {/* Desktop links */}
            <ul className="hidden sm:flex space-x-6">
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => setView(item.key)}
                    className={`px-3 py-1 rounded-md font-medium transition ${
                      view === item.key
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onLogout}
                  className="text-red-400 hover:text-red-500 font-semibold px-3 py-1"
                >
                  Logout
                </button>
              </li>
            </ul>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="sm:hidden focus:outline-none"
            >
              <div className="space-y-1">
                <span className="block w-6 h-0.5 bg-white" />
                <span className="block w-6 h-0.5 bg-white" />
                <span className="block w-6 h-0.5 bg-white" />
              </div>
            </button>
          </>
        )}
      </div>

      {/* Mobile dropdown */}
      {menuOpen && isLoggedIn && (
        <div className="sm:hidden bg-gray-900">
          <ul className="px-4 pb-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    setView(item.key);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-2 py-2 rounded-md hover:bg-gray-700"
                >
                  {item.name}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-2 py-2 text-red-400 hover:text-red-500 font-semibold"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}2