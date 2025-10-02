// src/Tabs.js
import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import "./Tabs.css";
import Quiz from "./Quiz";
import QuestionsAnswered from "./QuestionsAnswered";
import "./Quiz.css";
import "./QuestionsAnswered.css";

// pdf.worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function Tabs() {
  const [activeTab, setActiveTab] = useState("interviewer");
  const [candidate, setCandidate] = useState(null);
  const [stage, setStage] = useState("upload");
  const [results, setResults] = useState([]);

  // Chatbot states
  const [tempInput, setTempInput] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [botThinking, setBotThinking] = useState(false);

  // Viewing record
  const [viewingRecord, setViewingRecord] = useState(null);

  // Already-attended UI
  const [alreadyAttended, setAlreadyAttended] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  // Show only my results
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // 🔍 Search & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("none");

  // Load stored results
  useEffect(() => {
    const stored = localStorage.getItem("quizResults");
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch (e) {
        console.error("Failed parsing quizResults from localStorage:", e);
        setResults([]);
      }
    }
  }, []);

  // --------------------------
  // Question banks
  // --------------------------
  const easyQuestions = [
    { id: 1, level: "easy", question: "Binary of decimal 15?", options: ["1110","1111","1001","1101"], correctIndex: 1, explanation: "15 in binary is 1111." },
    { id: 2, level: "easy", question: "Universal logic gate?", options: ["AND","OR","NAND","XOR"], correctIndex: 2, explanation: "NAND is universal." },
    { id: 3, level: "easy", question: "Which is not a programming language?", options: ["C","Python","HTML","Java"], correctIndex: 2, explanation: "HTML is markup." },
    { id: 4, level: "easy", question: "Stack uses which principle?", options: ["FIFO","LIFO","LILO","FILO"], correctIndex: 1, explanation: "Stack is LIFO." },
    { id: 5, level: "easy", question: "Decimal of binary 1010?", options: ["8","9","10","12"], correctIndex: 2, explanation: "1010 binary = 10 decimal." },
    { id: 6, level: "easy", question: "Which is volatile memory?", options: ["ROM","Cache","Hard Disk","SSD"], correctIndex: 1, explanation: "Cache is volatile." },
  ];

  const mediumQuestions = [
    { id: 7, level: "medium", question: "Time complexity of binary search?", options: ["O(n)","O(log n)","O(n log n)","O(1)"], correctIndex: 1, explanation: "Binary search is O(log n)." },
    { id: 8, level: "medium", question: "Which scheduling may cause starvation?", options: ["FCFS","SJF","Round Robin","Priority"], correctIndex: 3, explanation: "Priority may starve." },
    { id: 9, level: "medium", question: "Square root of 256?", options: ["14","15","16","18"], correctIndex: 2, explanation: "16x16=256." },
    { id: 10, level: "medium", question: "Which is not a linear data structure?", options: ["Array","Linked List","Stack","Graph"], correctIndex: 3, explanation: "Graph is non-linear." },
    { id: 11, level: "medium", question: "Best case time complexity of Insertion Sort?", options: ["O(n)","O(n log n)","O(n^2)","O(log n)"], correctIndex: 0, explanation: "Best = O(n)." },
    { id: 12, level: "medium", question: "OSI model has how many layers?", options: ["5","6","7","8"], correctIndex: 2, explanation: "OSI has 7 layers." },
  ];

  const hardQuestions = [
    { id: 13, level: "hard", question: "Worst case of QuickSort?", options: ["O(n)","O(log n)","O(n log n)","O(n^2)"], correctIndex: 3, explanation: "Worst = O(n^2)." },
    { id: 14, level: "hard", question: "Belady’s anomaly occurs in?", options: ["LRU","FIFO","Optimal","Clock"], correctIndex: 1, explanation: "Belady anomaly in FIFO." },
    { id: 15, level: "hard", question: "Page replacement algorithm with min faults?", options: ["LRU","FIFO","Optimal","Clock"], correctIndex: 2, explanation: "Optimal has min faults." },
    { id: 16, level: "hard", question: "Best case time of Merge Sort?", options: ["O(n)","O(n log n)","O(n^2)","O(log n)"], correctIndex: 1, explanation: "Always O(n log n)." },
    { id: 17, level: "hard", question: "Which algorithm is used for shortest path?", options: ["Dijkstra","Kruskal","Prim","DFS"], correctIndex: 0, explanation: "Dijkstra is shortest path." },
    { id: 18, level: "hard", question: "Which is NP-complete?", options: ["Sorting","TSP","Searching","Binary Search"], correctIndex: 1, explanation: "TSP is NP-complete." },
  ];

  const pickRandom = (arr, n) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  const quizQuestions = [
    ...pickRandom(easyQuestions, 2),
    ...pickRandom(mediumQuestions, 2),
    ...pickRandom(hardQuestions, 2),
  ];

  // -----------------------
  // Helpers
  // -----------------------
  const getMissingFields = (cand) => {
    const required = ["name", "email", "phone"];
    return required.filter((f) => !cand || !cand[f] || String(cand[f]).trim() === "");
  };

  const formatName = (name) => {
    if (!name) return "";
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  // -----------------------
  // File Upload + Parsing
  // -----------------------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((s) => s.str).join(" ") + "\n";
          }
          parseResume(text);
        } catch (err) {
          console.error("Error reading PDF:", err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type.includes("wordprocessingml")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          parseResume(result.value);
        } catch (err) {
          console.error("Error reading DOCX:", err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        parseResume(e.target.result);
      };
      reader.readAsText(file);
    }

    setStage("details");
  };

  const parseResume = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let name = "", email = "", phone = "";
    const phoneRegex = /\b(?:91)?[6-9]\d{9}\b/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

    for (let line of lines) {
      if (!phone && phoneRegex.test(line)) phone = line.match(phoneRegex)[0];
      if (!email && emailRegex.test(line)) email = line.match(emailRegex)[0];
    }

    if (!name && email) {
      const prefix = email.split("@")[0];
      name = prefix.replace(/[0-9._-]/g, " ");
    }

    const updated = { name: name || "", email: email || "", phone: phone || "" };
    setCandidate(updated);

    const missing = getMissingFields(updated);
    setMissingFields(missing);
    setMissingIndex(0);
    setCurrentStep(missing.length > 0 ? missing[0] : "done");
    setTempInput("");
    setBotThinking(false);

    setAlreadyAttended(false);
    setExistingRecord(null);
  };

  // -----------------------
  // Confirm missing field
  // -----------------------
  const handleConfirmForCurrent = () => {
    if (!missingFields || missingFields.length === 0) return;
    const field = missingFields[missingIndex];
    const trimmed = (tempInput || "").trim();
    if (!trimmed) return;
    const updatedCandidate = { ...(candidate || {}), [field]: trimmed };
    setCandidate(updatedCandidate);

    const nextIndex = missingIndex + 1;
    if (nextIndex < missingFields.length) {
      setBotThinking(true);
      setTimeout(() => {
        setMissingIndex(nextIndex);
        setCurrentStep(missingFields[nextIndex]);
        setTempInput("");
        setBotThinking(false);
      }, 500);
    } else {
      setBotThinking(true);
      setTimeout(() => {
        setMissingFields([]);
        setMissingIndex(0);
        setCurrentStep("done");
        setTempInput("");
        setBotThinking(false);
      }, 500);
    }
  };

  // -----------------------
  // Continue handler
  // -----------------------
  const handleContinue = () => {
    const email = (candidate?.email || "").trim().toLowerCase();
    if (!email) {
      alert("Please provide an email before continuing.");
      return;
    }
    const existing = results.find((r) => (r.email || "").toLowerCase() === email);
    if (existing) {
      setAlreadyAttended(true);
      setExistingRecord(existing);
      return;
    }
    setStage("quiz");
  };

  const handleQuitAfterAlready = () => {
    setCandidate(null);
    setTempInput("");
    setMissingFields([]);
    setMissingIndex(0);
    setCurrentStep("");
    setBotThinking(false);
    setAlreadyAttended(false);
    setExistingRecord(null);
    setStage("upload");
  };

  const onQuizFinish = (quizData) => {
  const newRecord = {
    id: Date.now(),
    name: candidate?.name || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    score: quizData.score,
    total: quizData.total,
    attempted: quizData.detailed.filter((d) => d.selectedIndex !== null).length,
    correct: quizData.detailed.filter((d) => d.correct).length,
    detailed: quizData.detailed,
    date: new Date().toLocaleString(),
  };

  const updated = [...results, newRecord];
  setResults(updated);
  localStorage.setItem("quizResults", JSON.stringify(updated));

  // Instead of switching to interviewee → just show score
  setStage("quizFinished");
  setViewingRecord(newRecord); // keep the last record handy
};


  const handleViewRecord = (record) => {
    setViewingRecord(record);
  };

  const handleClearAllRecords = () => {
    const ok = window.confirm("Clear all stored interview results? This cannot be undone.");
    if (!ok) return;
    localStorage.removeItem("quizResults");
    setResults([]);
    setViewingRecord(null);
    setShowOnlyMine(false);
  };

  // -----------------------
  // Filtering + Sorting
  // -----------------------
  const candidateEmailLower = (candidate?.email || "").trim().toLowerCase();
  const displayedResults = (() => {
    let list = results;

    if (showOnlyMine && candidateEmailLower) {
      list = list.filter((r) => (r.email || "").toLowerCase() === candidateEmailLower);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(lower)) ||
          (r.email && r.email.toLowerCase().includes(lower))
      );
    }

    if (sortOption === "high") {
      list = [...list].sort((a, b) => b.score - a.score);
    } else if (sortOption === "low") {
      list = [...list].sort((a, b) => a.score - b.score);
    } else if (sortOption === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "email") {
      list = [...list].sort((a, b) => a.email.localeCompare(b.email));
    }

    return list;
  })();

  // -----------------------
  // UI Rendering
  // -----------------------
  return (
    <div className="tabs-container">
      <div className="tab-content">
        {activeTab === "interviewer" && (
          <div className="content-box">
            <h2>Welcome to AI Interview</h2>

            {stage === "upload" && (
              <>
                <p>Upload your resume here to start the interview</p>
                <label className="upload-btn">
                  Upload Resume
                  <input type="file" accept=".txt,.pdf,.docx" style={{ display: "none" }} onChange={handleFileUpload} />
                </label>
              </>
            )}

            {stage === "details" && candidate && (
              <div className="candidate-top">
                <h3>👤 Candidate Verification</h3>

                {botThinking && <p>🤖 Thinking...</p>}

                {alreadyAttended && existingRecord && (
                  <div className="attended-message" style={{
                    border: "1px solid #f0f2f6",
                    background: "#fff9f9",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 12
                  }}>
                    <h4 style={{ margin: 0, color: "#b91c1c", fontFamily: "'Poppins', sans-serif" }}>Sorry — you already took this test</h4>
                    <p style={{ marginTop: 8 }}>
                      We found a previous submission with your email <strong>{existingRecord.email}</strong>.
                      You scored <strong>{existingRecord.score} / {existingRecord.total}</strong> on {existingRecord.date}.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleQuitAfterAlready} style={{ padding: "8px 12px", borderRadius:"1rem",border:"none", background:"#d9b0b0ff", padding:"1rem" }}>
                        Quit
                      </button>
                      <button onClick={() => { setViewingRecord(existingRecord); setAlreadyAttended(false); }} style={{borderRadius:"1rem",border:"none", background:"#d9b0b0ff", padding:"1rem"}}>
                        View My Result
                      </button>
                    </div>
                  </div>
                )}

                {!botThinking && !alreadyAttended && currentStep !== "done" && currentStep && (
                  <div className="chat-bot">
                    {currentStep === "name" && <p>🤖 I couldn’t find your <strong>Name</strong>. Please enter it:</p>}
                    {currentStep === "email" && <p>🤖 What’s your <strong>Email</strong> address?</p>}
                    {currentStep === "phone" && <p>🤖 Could you provide your <strong>Phone number</strong>?</p>}

                    <input
                      type={currentStep === "email" ? "email" : "text"}
                      placeholder={`Enter your ${currentStep}`}
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                    />
                    <button onClick={handleConfirmForCurrent}>Confirm</button>
                  </div>
                )}

                {currentStep === "done" && !alreadyAttended && (
                  <>
                    <div className="extracted-details">
                      <p><strong>Name:</strong> {formatName(candidate.name)}</p>
                      <p><strong>Email:</strong> {candidate.email}</p>
                      <p><strong>Phone:</strong> {candidate.phone}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button className="continue-btn" onClick={handleContinue} >
                        Continue to Interview
                      </button>
                      <button onClick={() => {
                        setCandidate(null);
                        setTempInput("");
                        setMissingFields([]);
                        setMissingIndex(0);
                        setCurrentStep("");
                        setBotThinking(false);
                        setStage("upload");
                      }} style={{ border:"none", borderRadius:"0.8rem", width:"10vw", background:"#cbcaca84", color:"black", padding:"0.5rem" }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {stage === "quiz" && (
              <Quiz questions={quizQuestions} candidate={candidate} onFinish={onQuizFinish} />
            )}

            {viewingRecord && activeTab === "interviewer" && (
              <div style={{ marginTop: 12 }}>
                <QuestionsAnswered record={viewingRecord} onClose={() => setViewingRecord(null)} />
              </div>
            )}
          </div>
        )}

        {activeTab === "interviewee" && (
          <div className="content-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Interviewee Results</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {showOnlyMine && (
                  <div style={{ fontSize: 13, color: "#374151" }}>
                    Showing only your result ({candidate?.email})
                  </div>
                )}
                <button onClick={() => setShowOnlyMine(false)} style={{padding:"0.5rem",borderRadius:"5px",border:"none",background:"#3c3c3c",color:"white"}}>Show All</button>
                <button onClick={handleClearAllRecords} style={{padding:"0.5rem",borderRadius:"5px",border:"none",background:"#3c3c3c",color:"white"}}>Clear</button>
              </div>
            </div>

            {/* 🔍 Search + Sort */}
            <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
              <input
                type="text"
                placeholder="🔍 Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "1rem", borderRadius: "1rem", width: "30%",border:"none",background:"#cbcaca84" }}
              />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ padding: "1rem", borderRadius: "1rem" }}
              >
                <option value="none">Sort By</option>
                <option value="high">Score: High → Low</option>
                <option value="low">Score: Low → High</option>
                <option value="name">Name (A → Z)</option>
                <option value="email">Email (A → Z)</option>
              </select>
            </div>

            {viewingRecord ? (
              <QuestionsAnswered record={viewingRecord} onClose={() => setViewingRecord(null)} />
            ) : (
              <>
                {displayedResults.length === 0 ? (
                  <p>{showOnlyMine ? "No result found for your email." : "No results yet."}</p>
                ) : (
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Score</th>
                        <th>Attempted</th>
                        <th>Correct</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedResults.map((r, idx) => (
                        <tr key={r.id || idx}>
                          <td>{formatName(r.name)}</td>
                          <td>{r.email}</td>
                          <td>{r.phone}</td>
                          <td>{r.score} / {r.total}</td>
                          <td>{r.attempted}</td>
                          <td>{r.correct}</td>
                          <td>{r.date}</td>
                          <td>
                            <button onClick={() => handleViewRecord(r)} style={{borderRadius:"5px",border:"none",padding:"0.3rem 0.6rem",background:"#3c3c3c",color:"white"}}>View Score</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="tab-buttons">
        <button className={activeTab === "interviewee" ? "active" : ""} onClick={() => { setActiveTab("interviewee"); setViewingRecord(null); }}>
          Interviewer
        </button>
        <button className={activeTab === "interviewer" ? "active" : ""} onClick={() => { setActiveTab("interviewer"); setStage("upload"); }}>
          Interviewee
        </button>
      </div>
    </div>
  );
}

export default Tabs;
