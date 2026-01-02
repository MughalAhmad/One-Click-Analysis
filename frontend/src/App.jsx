import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { defaultData } from "./data.json";

function App() {
  // assume first task
  const taskDescription = defaultData[0];

  const {
    title,
    description = {},
    comments = []
  } = taskDescription;

  const {
    context = "",
    information = [],
    taskPoints = [],
    deliverables = [],
    references = []
  } = description;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------------------- GENERATE REPORT -------------------- */
  const reportGenerator = async () => {
    try {
      setReport(null);
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/analyze-task",
        taskDescription
      );

      setReport(response.data);

      Swal.fire({
        icon: "success",
        title: "Report Generated",
        text: "Task analysis completed successfully."
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to generate report."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* -------------------- TASK DETAILS -------------------- */}
      <h1 className="text-2xl font-bold">{title}</h1>

      <h2 className="font-semibold">Context</h2>
      <p className="text-gray-700">{context}</p>

      <h2 className="font-semibold">Information</h2>
      <ul className="list-disc ml-6">
        {information.map((info, i) => (
          <li key={i}>{info}</li>
        ))}
      </ul>

      <h2 className="font-semibold">Task Points</h2>
      <ol className="list-decimal ml-6">
        {taskPoints.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ol>

      <h2 className="font-semibold">Deliverables</h2>
      <ul className="list-disc ml-6">
        {deliverables.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>

      <h2 className="font-semibold">References</h2>
      <ul className="list-disc ml-6">
        {references.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      {/* -------------------- COMMENTS + REPORT -------------------- */}
      <div className="flex gap-6">
        {/* COMMENTS */}
        <div className="w-1/2 border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Comments</h2>
          <ul className="space-y-2">
            {comments.map((c, i) => (
              <li
                key={c.id || i}
                className="p-2 bg-gray-50 border rounded"
              >
                {i + 1}. {c.comment}
              </li>
            ))}
          </ul>
        </div>

        {/* REPORT */}
        <div className="w-1/2 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Task Report</h2>

            <button
              onClick={reportGenerator}
              disabled={loading}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {loading && (
            <p className="text-blue-500 text-sm">
              Analyzing task, please wait…
            </p>
          )}

          {!loading && !report && (
            <p className="text-gray-500">
              No report generated yet.
            </p>
          )}

          {!loading && report && (
            <div className="space-y-4 text-sm">
              <p><strong>Progress:</strong> {report.analysis.current_progress}</p>

              <div>
                <strong>Completed:</strong>
                <ul className="list-disc ml-5">
                  {report.analysis.work_completed.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Pending:</strong>
                <ul className="list-disc ml-5">
                  {report.analysis.work_pending.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Questions:</strong>
                <ul className="list-disc ml-5">
                  {report.analysis.open_questions.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-green-50 border rounded">
                <strong>Estimated Time:</strong>
                <p>{report.analysis.estimated_time_to_complete}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
