import { useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { authHeaders } from "../authHeaders";

export default function ReportIssue() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const textareaClass =
    "w-full h-40 border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonClassBase = "px-4 py-2 rounded transition text-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/report`,
        { message },
        { headers: authHeaders() } // <- harmless if no token; sends Authorization if present
      );
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Layout>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto space-y-4 bg-white border border-gray-300 p-6 rounded shadow"
        aria-labelledby="report-heading"
      >
        <h1 id="report-heading" className="text-2xl font-bold">
          Found a Bug?
        </h1>

        <p id="report-description" className="text-gray-700 text-sm">
          It’s hard to catch every error during development. If you experience
          an issue, please describe it in detail below and I’ll fix it ASAP. You can also suggest features!
        </p>

        <textarea
          id="report-message"
          aria-describedby="report-description"
          role="textbox"
          placeholder="Describe the issue you encountered..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={textareaClass}
          required
        />

        <button
          type="submit"
          aria-label="Send report"
          disabled={!message.trim()}
          className={`${buttonClassBase} ${
            !message.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Send Report
        </button>

        {status === "sent" && (
          <p role="alert" className="text-green-600 text-sm">
            Thank you! Your report was sent.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-red-600 text-sm">
            There was a problem sending your report.
          </p>
        )}
      </form>
    </Layout>
  );
}
