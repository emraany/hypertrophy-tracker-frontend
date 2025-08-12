import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import Layout from "../components/Layout";
import { getToken, authHeaders } from "../authHeaders";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type Session = {
  date: string;
  exercises: {
    muscleGroup: string;
    exercise: string;
    sets: { reps: number; weight: number }[];
  }[];
};

const controlClass =
  "border border-gray-300 px-3 py-2 rounded text-sm shadow-sm w-full sm:w-auto";

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
  scales: {
    x: { offset: false, ticks: { padding: 4, font: { size: 10 } } },
    y: { ticks: { padding: 4, font: { size: 10 } } },
  },
  plugins: { legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } } },
};

export default function Progress() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chartView, setChartView] = useState<"exercise" | "muscle">("exercise");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<"week" | "month" | "year" | "ytd" | "all">(
    "month"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const BACKEND = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  useEffect(() => {
    const today = new Date();
    const now = today.toISOString().split("T")[0];
    let past = new Date();

    switch (selectedRange) {
      case "week":
        past.setDate(today.getDate() - 7);
        break;
      case "month":
        past.setMonth(today.getMonth() - 1);
        break;
      case "year":
        past.setFullYear(today.getFullYear() - 1);
        break;
      case "ytd":
        past = new Date(today.getFullYear(), 0, 1);
        break;
      case "all":
        past = new Date("1970-01-01");
        break;
    }

    setStartDate(past.toISOString().split("T")[0]);
    setEndDate(now);
  }, [selectedRange]);

  useEffect(() => {
    const t = getToken();
    if (!t) return; 

    axios
      .get(`${BACKEND}/api/sessions`, { headers: authHeaders() })
      .then((res) => setSessions(res.data))
      .catch(() => {

      });
  }, [BACKEND]);

  useEffect(() => {
    const items = new Set<string>();
    sessions.forEach((session) => {
      const d = new Date(session.date);
      if ((startDate && d < new Date(startDate)) || (endDate && d > new Date(endDate))) return;
      session.exercises.forEach((ex) => {
        items.add(chartView === "exercise" ? ex.exercise : ex.muscleGroup);
      });
    });
    const list = Array.from(items).sort();
    setOptions(list);
    if (!items.has(selectedItem)) setSelectedItem("");
  }, [sessions, chartView, startDate, endDate, selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      setChartData(null);
      return;
    }
    const grouped: Record<string, number> = {};
    sessions.forEach((session) => {
      const d = new Date(session.date);
      if ((startDate && d < new Date(startDate)) || (endDate && d > new Date(endDate))) return;
      const dateKey = session.date.split("T")[0];
      session.exercises.forEach((ex) => {
        const match =
          chartView === "exercise" ? ex.exercise === selectedItem : ex.muscleGroup === selectedItem;
        if (match) {
          const vol = ex.sets.reduce((acc, s) => acc + s.reps * s.weight, 0);
          grouped[dateKey] = (grouped[dateKey] || 0) + vol;
        }
      });
    });

    const sortedDates = Object.keys(grouped).sort();
    const labels = sortedDates.map((d) => {
      const dt = new Date(d);
      return `${dt.getMonth() + 1}/${dt.getDate()}`;
    });
    const data = sortedDates.map((d) => grouped[d]);

    setChartData({
      labels,
      datasets: [
        {
          label: `${selectedItem} Total Volume`,
          data,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.3)",
          fill: true,
          tension: 0.3,
        },
      ],
    });
  }, [sessions, selectedItem, chartView, startDate, endDate]);

  return (
    <Layout>
      <div className="space-y-8 px-4 py-6">
        <h1 className="text-3xl font-bold text-center">Progress</h1>

        <div className="flex items-center bg-gray-100 border border-gray-300 rounded px-4 py-2 space-x-2">
          <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm text-gray-600">
            If exercises aren’t showing up, try adjusting your date range below.
          </span>
        </div>

        {/* Toggle View */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => {
              setChartView("exercise");
              setSelectedItem("");
            }}
            className={`px-4 py-2 rounded border transition ${
              chartView === "exercise" ? "bg-blue-600 text-white" : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            By Exercise
          </button>
          <button
            onClick={() => {
              setChartView("muscle");
              setSelectedItem("");
            }}
            className={`px-4 py-2 rounded border transition ${
              chartView === "muscle" ? "bg-blue-600 text-white" : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            By Muscle Group
          </button>
        </div>

        {/* Selector Dropdown */}
        <div className="flex justify-center">
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className={controlClass}
          >
            <option value="">Select {chartView === "exercise" ? "Exercise" : "Muscle Group"}</option>
            {options.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap justify-center gap-4">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value as any)}
            className={controlClass}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="ytd">Year to Date</option>
            <option value="all">All Time</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={controlClass} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={controlClass} />
        </div>

        {/* Chart */}
        {chartData ? (
          <div className="bg-white border border-gray-200 rounded shadow p-4 w-full">
            <div className="h-64 sm:h-80 w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded shadow p-4 w-full">
            <p className="text-center text-gray-500">Select an item to view progress.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
