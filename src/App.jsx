import { useState, useEffect, useRef } from "react";
import "./App.css";

const MODES = {
  pomodoro: { label: "Pomodoro", time: 25 * 60, color: "#e94560" },
  short: { label: "Short Break", time: 5 * 60, color: "#2dc653" },
  long: { label: "Long Break", time: "#00b4d8", time: 15 * 60, color: "#00b4d8" },
};

const SOUNDS = {
  bell: () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    o.start(); o.stop(ctx.currentTime + 1);
  }
};

export default function App() {
  const [mode, setMode] = useState("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.time);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocus, setTotalFocus] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const currentMode = MODES[mode];
  const totalTime = currentMode.time;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - (totalTime - timeLeft) * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = totalTime - elapsed;
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setTimeLeft(0);
          if (soundOn) try { SOUNDS.bell(); } catch(e) {}
          if (mode === "pomodoro") {
            setSessions(s => s + 1);
            setTotalFocus(f => f + totalTime);
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const switchMode = (m) => {
    setMode(m);
    setTimeLeft(MODES[m].time);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setTimeLeft(currentMode.time);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const format = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(t => [...t, { id: Date.now(), text: taskInput.trim(), done: false }]);
    setTaskInput("");
  };

  const toggleTask = (id) => setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task));
  const deleteTask = (id) => setTasks(t => t.filter(task => task.id !== id));

  const circumference = 2 * Math.PI * 120;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="app" style={{ "--accent": currentMode.color }}>
      <div className="container">
        <header>
          <h1>🍅 Pomodoro</h1>
          <div className="header-controls">
            <button className="icon-btn" onClick={() => setSoundOn(s => !s)}>{soundOn ? "🔊" : "🔇"}</button>
            <button className={`icon-btn ${showTasks ? "active" : ""}`} onClick={() => setShowTasks(s => !s)}>📋</button>
          </div>
        </header>

        <div className="mode-tabs">
          {Object.entries(MODES).map(([key, val]) => (
            <button key={key} className={`mode-tab ${mode === key ? "active" : ""}`}
              style={{ "--tab-color": val.color }}
              onClick={() => switchMode(key)}>{val.label}</button>
          ))}
        </div>

        <div className="timer-wrap">
          <svg className="timer-ring" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="120" className="ring-bg" />
            <circle cx="140" cy="140" r="120" className="ring-progress"
              style={{ stroke: currentMode.color, strokeDasharray: circumference, strokeDashoffset: strokeDash }} />
          </svg>
          <div className="timer-content">
            <div className="timer-display">{format(timeLeft)}</div>
            <div className="timer-mode">{currentMode.label}</div>
          </div>
        </div>

        <div className="controls">
          <button className="ctrl-round" onClick={reset} title="Reset">↺</button>
          <button className="play-btn" onClick={() => setRunning(r => !r)}
            style={{ background: currentMode.color }}>
            {running ? "⏸" : "▶"}
          </button>
          <button className="ctrl-round" onClick={() => switchMode(
            mode === "pomodoro" ? "short" : mode === "short" ? "long" : "pomodoro"
          )} title="Next">⏭</button>
        </div>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-val">{sessions}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat">
            <span className="stat-val">{Math.floor(totalFocus / 60)}m</span>
            <span className="stat-label">Focus Time</span>
          </div>
          <div className="stat">
            <span className="stat-val">{Math.floor(sessions / 4)}</span>
            <span className="stat-label">Sets</span>
          </div>
        </div>

        <div className="pomodoro-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`dot ${i < (sessions % 4) ? "filled" : ""}`}
              style={{ background: i < (sessions % 4) ? currentMode.color : undefined }} />
          ))}
        </div>

        {showTasks && (
          <div className="tasks-panel">
            <h3>📋 Tasks</h3>
            <div className="task-input-row">
              <input className="task-input" placeholder="Add a task..."
                value={taskInput} onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()} />
              <button className="task-add-btn" style={{ background: currentMode.color }} onClick={addTask}>+</button>
            </div>
            <ul className="task-list">
              {tasks.length === 0 && <li className="task-empty">No tasks yet. Add one above!</li>}
              {tasks.map(task => (
                <li key={task.id} className={`task-item ${task.done ? "done" : ""}`}>
                  <button className="task-check" onClick={() => toggleTask(task.id)}
                    style={{ borderColor: currentMode.color, background: task.done ? currentMode.color : "transparent" }}>
                    {task.done ? "✔" : ""}
                  </button>
                  <span className="task-text">{task.text}</span>
                  <button className="task-delete" onClick={() => deleteTask(task.id)}>✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}