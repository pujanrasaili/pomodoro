import { useState, useEffect, useRef } from "react";
import "./App.css";

const DEFAULT_TIMES = { pomodoro: 25, short: 5, long: 15 };

const THEMES = {
  dark:   { label: "🌙 Dark",   bg: "#0f0e0c", surface: "rgba(255,255,255,0.05)", text: "#fff", muted: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.08)", glow: "rgba(233,69,96,0.15)" },
  light:  { label: "☀️ Light",  bg: "#f5f5f0", surface: "rgba(0,0,0,0.05)", text: "#111", muted: "rgba(0,0,0,0.4)", border: "rgba(0,0,0,0.08)", glow: "rgba(233,69,96,0.08)" },
  forest: { label: "🌿 Forest", bg: "#0d1f0d", surface: "rgba(255,255,255,0.06)", text: "#e8f5e8", muted: "rgba(200,240,200,0.4)", border: "rgba(100,200,100,0.12)", glow: "rgba(45,198,83,0.15)" },
  ocean:  { label: "🌊 Ocean",  bg: "#0a0f1e", surface: "rgba(255,255,255,0.05)", text: "#e0f0ff", muted: "rgba(150,200,255,0.4)", border: "rgba(0,180,216,0.15)", glow: "rgba(0,180,216,0.15)" },
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
  const [customTimes, setCustomTimes] = useState(DEFAULT_TIMES);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.pomodoro * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocus, setTotalFocus] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [showThemes, setShowThemes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingInputs, setSettingInputs] = useState(DEFAULT_TIMES);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const MODES = {
    pomodoro: { label: "Pomodoro", time: customTimes.pomodoro * 60, color: "#e94560" },
    short:    { label: "Short Break", time: customTimes.short * 60, color: "#2dc653" },
    long:     { label: "Long Break", time: customTimes.long * 60, color: "#00b4d8" },
  };

  const currentMode = MODES[mode];
  const currentTheme = THEMES[theme];
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
          setRunning(false); setTimeLeft(0);
          if (soundOn) try { SOUNDS.bell(); } catch(e) {}
          if (mode === "pomodoro") { setSessions(s => s + 1); setTotalFocus(f => f + totalTime); }
        } else { setTimeLeft(remaining); }
      }, 500);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const switchMode = (m) => {
    setMode(m); setTimeLeft(MODES[m].time);
    setRunning(false); clearInterval(intervalRef.current);
  };

  const reset = () => { setTimeLeft(currentMode.time); setRunning(false); clearInterval(intervalRef.current); };

  const applySettings = () => {
    const p = Math.max(1, Math.min(99, parseInt(settingInputs.pomodoro) || 25));
    const s = Math.max(1, Math.min(99, parseInt(settingInputs.short) || 5));
    const l = Math.max(1, Math.min(99, parseInt(settingInputs.long) || 15));
    const newTimes = { pomodoro: p, short: s, long: l };
    setCustomTimes(newTimes);
    setTimeLeft(newTimes[mode] * 60);
    setRunning(false); clearInterval(intervalRef.current);
    setShowSettings(false);
  };

  const resetSettings = () => {
    setSettingInputs(DEFAULT_TIMES);
    setCustomTimes(DEFAULT_TIMES);
    setTimeLeft(DEFAULT_TIMES[mode] * 60);
    setRunning(false); clearInterval(intervalRef.current);
    setShowSettings(false);
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
    <div className="app" style={{
      "--accent": currentMode.color,
      "--bg": currentTheme.bg,
      "--surface": currentTheme.surface,
      "--text": currentTheme.text,
      "--muted": currentTheme.muted,
      "--border": currentTheme.border,
      "--glow": currentTheme.glow,
      background: `radial-gradient(ellipse at top, ${currentTheme.glow}, ${currentTheme.bg})`,
      color: currentTheme.text,
    }}>
      <div className="container">
        <header>
          <h1>🍅 Pomodoro</h1>
          <div className="header-controls">
            <button className="icon-btn" onClick={() => setSoundOn(s => !s)}>{soundOn ? "🔊" : "🔇"}</button>
            <button className={`icon-btn ${showSettings ? "active" : ""}`} onClick={() => { setShowSettings(s => !s); setShowThemes(false); setShowTasks(false); }}>⚙️</button>
            <button className={`icon-btn ${showThemes ? "active" : ""}`} onClick={() => { setShowThemes(s => !s); setShowSettings(false); setShowTasks(false); }}>🎨</button>
            <button className={`icon-btn ${showTasks ? "active" : ""}`} onClick={() => { setShowTasks(s => !s); setShowSettings(false); setShowThemes(false); }}>📋</button>
          </div>
        </header>

        {showSettings && (
          <div className="settings-panel">
            <h3>⚙️ Timer Settings (minutes)</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>🍅 Pomodoro</label>
                <div className="setting-input-row">
                  <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, pomodoro: Math.max(1, (parseInt(s.pomodoro) || 25) - 1) }))}>−</button>
                  <input className="setting-input" type="number" min="1" max="99"
                    value={settingInputs.pomodoro}
                    onChange={(e) => setSettingInputs(s => ({ ...s, pomodoro: e.target.value }))} />
                  <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, pomodoro: Math.min(99, (parseInt(s.pomodoro) || 25) + 1) }))}>+</button>
                </div>
              </div>
              <div className="setting-item">
                <label>☕ Short Break</label>
                <div className="setting-input-row">
                  <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, short: Math.max(1, (parseInt(s.short) || 5) - 1) }))}>−</button>
                  <input className="setting-input" type="number" min="1" max="99"
                    value={settingInputs.short}
                    onChange={(e) => setSettingInputs(s => ({ ...s, short: e.target.value }))} />
                  <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, short: Math.min(99, (parseInt(s.short) || 5) + 1) }))}>+</button>
                </div>
              </div>
              <div className="setting-item">
                <label>🌊 Long Break</label>
                <div className="setting-input-row">
                  <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, long: Math.max(1, (parseInt(s.long) || 15) - 1) }))}>−</button>
                  <input className="setting-input" type="number" min="1" max="99"
                    value={settingInputs.long}
                    onChange={(e) => setSettingInputs(s => ({ ...s, long: e.target.value }))} />
                  <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, long: Math.min(99, (parseInt(s.long) || 15) + 1) }))}>+</button>
                </div>
              </div>
            </div>
            <div className="settings-btns">
              <button className="settings-apply" style={{ background: currentMode.color }} onClick={applySettings}>✅ Apply</button>
              <button className="settings-reset" onClick={resetSettings}>↺ Reset to Default</button>
            </div>
          </div>
        )}

        {showThemes && (
          <div className="themes-panel">
            {Object.entries(THEMES).map(([key, val]) => (
              <button key={key} className={`theme-btn ${theme === key ? "active" : ""}`}
                onClick={() => { setTheme(key); setShowThemes(false); }}>
                {val.label}
              </button>
            ))}
          </div>
        )}

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
            <div className="timer-total">{customTimes[mode]}:00 total</div>
          </div>
        </div>

        <div className="controls">
          <button className="ctrl-round" onClick={reset} title="Reset">↺</button>
          <button className="play-btn" onClick={() => setRunning(r => !r)} style={{ background: currentMode.color }}>
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