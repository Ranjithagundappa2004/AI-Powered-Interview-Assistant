// src/QuestionsAnswered.js
import React, { useState } from "react";
import "./QuestionsAnswered.css";
import "./Quiz.css"; // reuse styles from quiz

// record prop: the record object saved in results (has detailed[] and meta)
function QuestionsAnswered({ record, onClose }) {
  const [showSolutionFor, setShowSolutionFor] = useState(null);

  if (!record) return null;

  return (
    <div className="questions-answered">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Result: {record.name} — {record.score}/{record.total}</h3>
        <div>
          <button onClick={onClose} style={{ marginRight: 8 }}>Back</button>
          <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(record.detailed, null, 2)); alert("Detailed answers copied to clipboard"); }}>Copy JSON</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {record.detailed.map((d, idx) => {
          const selectedText = d.selectedIndex === null || d.selectedIndex === undefined ? "No answer" : d.options[d.selectedIndex];
          const correctText = (typeof d.correctIndex === "number") ? d.options[d.correctIndex] : "N/A";
          const isCorrect = d.correct === true;
          return (
            <div key={idx} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>Q{idx+1}:</strong> {d.question}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{isCorrect ? "Correct" : "Wrong"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>Time: {d.timeTaken}s</div>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div><strong>Your answer:</strong> {selectedText}</div>
                <div><strong>Correct answer:</strong> {correctText}</div>
              </div>

              {!isCorrect && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => setShowSolutionFor(showSolutionFor === idx ? null : idx)}>
                    {showSolutionFor === idx ? "Hide Solution" : "Show Solution"}
                  </button>
                  {showSolutionFor === idx && (
                    <div style={{ marginTop: 8, padding: 10, background: "#fafafa", borderRadius: 6 }}>
                      <strong>Solution:</strong>
                      <div style={{ marginTop: 6 }}>{d.explanation || "No explanation provided."}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionsAnswered;
