// src/Quiz.js
import React, { useEffect, useState, useRef } from "react";

const LEVEL_TO_SECONDS = {
  easy: 20,
  medium: 60,
  hard: 120,
};

function Quiz({ questions = [], candidate = null, onFinish = () => {} }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // saved answers per question
  const [timeLeft, setTimeLeft] = useState(LEVEL_TO_SECONDS[questions[0]?.level || "easy"]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // set timer for current question
    const lvl = questions[index]?.level || "easy";
    setTimeLeft(LEVEL_TO_SECONDS[lvl]);
    setSelected(null);
    setIsSubmitted(false);
    startTimeRef.current = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index, questions]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const saveAnswer = (selIndex) => {
    const q = questions[index];
    const timeTaken = Math.min(LEVEL_TO_SECONDS[q.level], Math.round((Date.now() - startTimeRef.current) / 1000));
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedIndex: selIndex === undefined ? null : selIndex,
        correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : null,
        explanation: q.explanation || "",
        timeTaken,
      },
    ]);
  };

  const handleAutoSubmit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    saveAnswer(selected);
    setIsSubmitted(true);
    setTimeout(() => {
      moveNext();
    }, 650);
  };

  const handleSubmitClick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    saveAnswer(selected);
    setIsSubmitted(true);
    setTimeout(() => {
      moveNext();
    }, 350);
  };

  const moveNext = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      finalize();
    }
  };

  const finalize = () => {
    // Build detailed array with correctness
    const detailed = answers.map((a) => {
      const sel = a.selectedIndex;
      const correct = (typeof a.correctIndex === "number") ? a.correctIndex === sel : null;
      return {
        questionId: a.questionId,
        question: a.question,
        options: a.options,
        selectedIndex: a.selectedIndex,
        correctIndex: a.correctIndex,
        correct,
        explanation: a.explanation || "",
        timeTaken: a.timeTaken,
      };
    });

    // compute score
    const score = detailed.reduce((acc, d) => (d.correct ? acc + 1 : acc), 0);
    const results = { candidate, detailed, score, total: questions.length };
    onFinish(results);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-box">
        <h3>No questions provided</h3>
        <p>Please provide an array of questions to start the aptitude test.</p>
      </div>
    );
  }

  const q = questions[index];
  const pct = Math.max(0, Math.round((timeLeft / LEVEL_TO_SECONDS[q.level]) * 100));

  return (
    <div className="quiz-box">
      <div className="quiz-header">
        <div>
          <h3>Question {index + 1} / {questions.length}</h3>
          <p className="level-tag">Level: {q.level}</p>
        </div>
        <div className="timer">
          <div className="timer-text">{formatTime(timeLeft)}</div>
          <div className="timer-bar">
            <div className="timer-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="quiz-question">
        <p>{q.question}</p>
      </div>

      <div className="quiz-options">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = isSubmitted && typeof q.correctIndex === "number" && q.correctIndex === i;
          const isWrongSelected = isSubmitted && isSelected && typeof q.correctIndex === "number" && q.correctIndex !== i;
          return (
            <button
              key={i}
              className={`option-btn ${isSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrongSelected ? "wrong" : ""}`}
              onClick={() => !isSubmitted && setSelected(i)}
            >
              <span className="opt-label">{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          );
        })}
      </div>

      <div className="quiz-actions">
        <button
          className="submit-btn"
          onClick={handleSubmitClick}
          disabled={isSubmitted}
        >
          {isSubmitted ? "Submitted" : (index + 1 === questions.length ? "Submit & Finish" : "Submit")}
        </button>

        <div className="progress-text">
          {answers.length} answered • {questions.length - answers.length} remaining
        </div>
      </div>
    </div>
  );
}

function formatTime(s) {
  if (s <= 0) return "00:00";
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default Quiz;
