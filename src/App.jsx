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

const today = () => new Date().toDateString();
const timeStr = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
  const [showGoal, setShowGoal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem("pomoDailyGoal") || "8"));
  const [goalInput, setGoalInput] = useState("8");
  const [todaySessions, setTodaySessions] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("pomoTodayData") || "{}");
    return saved.date === today() ? saved.sessions : 0;
  });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("pomoHistory") || "[]"));
  const [autoStart, setAutoStart] = useState(() => localStorage.getItem("pomoAutoStart") === "true");
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
  const goalProgress = Math.min((todaySessions / dailyGoal) * 100, 100);
  const goalReached = todaySessions >= dailyGoal;

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
          if (mode === "pomodoro") {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            setTotalFocus(f => f + totalTime);
            const newToday = todaySessions + 1;
            setTodaySessions(newToday);
            localStorage.setItem("pomoTodayData", JSON.stringify({ date: today(), sessions: newToday }));
            const entry = { type: "🍅 Pomodoro", duration: customTimes.pomodoro, date: today(), time: timeStr() };
            const newHistory = [entry, ...history].slice(0, 50);
            setHistory(newHistory);
            localStorage.setItem("pomoHistory", JSON.stringify(newHistory));
            const nextM = newSessions % 4 === 0 ? "long" : "short";
            if (autoStart) {
              setTimeout(() => { setMode(nextM); setTimeLeft(MODES[nextM].time); setRunning(true); }, 1500);
            } else {
              switchMode(nextM);
            }
          } else {
            const entry = { type: mode === "short" ? "☕ Short Break" : "🌊 Long Break", duration: customTimes[mode], date: today(), time: timeStr() };
            const newHistory = [entry, ...history].slice(0, 50);
            setHistory(newHistory);
            localStorage.setItem("pomoHistory", JSON.stringify(newHistory));
            if (autoStart) {
              setTimeout(() => { setMode("pomodoro"); setTimeLeft(MODES.pomodoro.time); setRunning(true); }, 1500);
            } else {
              switchMode("pomodoro");
            }
          }
        } else { setTimeLeft(remaining); }
      }, 500);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running, todaySessions, history]);

  const switchMode = (m) => { setMode(m); setTimeLeft(MODES[m].time); setRunning(false); clearInterval(intervalRef.current); };
  const reset = () => { setTimeLeft(currentMode.time); setRunning(false); clearInterval(intervalRef.current); };

  const applySettings = () => {
    const p = Math.max(1, Math.min(99, parseInt(settingInputs.pomodoro) || 25));
    const s = Math.max(1, Math.min(99, parseInt(settingInputs.short) || 5));
    const l = Math.max(1, Math.min(99, parseInt(settingInputs.long) || 15));
    const newTimes = { pomodoro: p, short: s, long: l };
    setCustomTimes(newTimes); setTimeLeft(newTimes[mode] * 60);
    setRunning(false); clearInterval(intervalRef.current); setShowSettings(false);
  };

  const resetSettings = () => {
    setSettingInputs(DEFAULT_TIMES); setCustomTimes(DEFAULT_TIMES);
    setTimeLeft(DEFAULT_TIMES[mode] * 60); setRunning(false);
    clearInterval(intervalRef.current); setShowSettings(false);
  };

  const saveGoal = () => {
    const g = Math.max(1, Math.min(24, parseInt(goalInput) || 8));
    setDailyGoal(g); localStorage.setItem("pomoDailyGoal", String(g)); setShowGoal(false);
  };

  const clearHistory = () => { setHistory([]); localStorage.removeItem("pomoHistory"); };

  const format = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(t => [...t, { id: Date.now(), text: taskInput.trim(), done: false }]);
    setTaskInput("");
  };
  const toggleTask = (id) => setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task));
  const deleteTask = (id) => setTasks(t => t.filter(task => task.id !== id));

  const closeAll = (except) => {
    if (except !== "goal") setShowGoal(false);
    if (except !== "settings") setShowSettings(false);
    if (except !== "themes") setShowThemes(false);
    if (except !== "tasks") setShowTasks(false);
    if (except !== "history") setShowHistory(false);
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDash = circumference - (progress / 100) * circumference;

  const groupedHistory = history.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  return (
    <div className="app" style={{
      "--accent": currentMode.color, "--bg": currentTheme.bg, "--surface": currentTheme.surface,
      "--text": currentTheme.text, "--muted": currentTheme.muted, "--border": currentTheme.border, "--glow": currentTheme.glow,
      background: `radial-gradient(ellipse at top, ${currentTheme.glow}, ${currentTheme.bg})`, color: currentTheme.text,
    }}>
      <div className="container">
        <header>
          <h1>🍅 Pomodoro</h1>
          <div className="header-controls">
            <button className="icon-btn" onClick={() => setSoundOn(s => !s)}>{soundOn ? "🔊" : "🔇"}</button>
            <button className={`icon-btn ${showHistory ? "active" : ""}`} onClick={() => { setShowHistory(s => !s); closeAll("history"); }}>📊</button>
            <button className={`icon-btn ${showGoal ? "active" : ""}`} onClick={() => { setShowGoal(s => !s); closeAll("goal"); }}>🎯</button>
            <button className={`icon-btn ${showSettings ? "active" : ""}`} onClick={() => { setShowSettings(s => !s); closeAll("settings"); }}>⚙️</button>
            <button className={`icon-btn ${showThemes ? "active" : ""}`} onClick={() => { setShowThemes(s => !s); closeAll("themes"); }}>🎨</button>
            <button className={`icon-btn ${showTasks ? "active" : ""}`} onClick={() => { setShowTasks(s => !s); closeAll("tasks"); }}>📋</button>
          </div>
        </header>

        {/* HISTORY PANEL */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>📊 Session History</h3>
              {history.length > 0 && <button className="clear-btn" onClick={clearHistory}>Clear</button>}
            </div>
            {history.length === 0 ? (
              <div className="history-empty">No sessions yet. Start your first one! 🍅</div>
            ) : (
              <div className="history-list">
                {Object.entries(groupedHistory).map(([date, entries]) => (
                  <div key={date} className="history-day">
                    <div className="history-date">{date === today() ? "Today" : date}</div>
                    {entries.map((entry, i) => (
                      <div key={i} className="history-item">
                        <span className="history-type">{entry.type}</span>
                        <span className="history-duration">{entry.duration} min</span>
                        <span className="history-time">{entry.time}</span>
                      </div>
                    ))}
                    <div className="history-day-summary">
                      {entries.filter(e => e.type.includes("Pomodoro")).length} pomodoros •{" "}
                      {entries.filter(e => e.type.includes("Pomodoro")).reduce((s, e) => s + e.duration, 0)} min focus
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GOAL PANEL */}
        {showGoal && (
          <div className="goal-panel">
            <h3>🎯 Daily Goal</h3>
            <p className="goal-desc">Set how many Pomodoro sessions you want to complete today.</p>
            <div className="goal-progress-wrap">
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: `${goalProgress}%`, background: goalReached ? "#2dc653" : currentMode.color }} />
              </div>
              <div className="goal-progress-label">
                <span style={{ color: goalReached ? "#2dc653" : currentMode.color }}>{goalReached ? "🎉 Goal reached!" : `${todaySessions} / ${dailyGoal} sessions`}</span>
                <span style={{ color: "var(--muted)" }}>{Math.round(goalProgress)}%</span>
              </div>
            </div>
            <div className="goal-dots">
              {Array.from({ length: Math.min(dailyGoal, 12) }).map((_, i) => (
                <div key={i} className={`goal-dot ${i < todaySessions ? "done" : ""}`}
                  style={{ background: i < todaySessions ? (goalReached ? "#2dc653" : currentMode.color) : undefined }} />
              ))}
              {dailyGoal > 12 && <span className="goal-more">+{dailyGoal - 12} more</span>}
            </div>
            <div className="goal-input-row">
              <label>Daily Goal (sessions)</label>
              <div className="setting-input-row">
                <button className="setting-step" onClick={() => setGoalInput(g => String(Math.max(1, (parseInt(g) || 8) - 1)))}>−</button>
                <input className="setting-input" type="number" min="1" max="24" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
                <button className="setting-step" onClick={() => setGoalInput(g => String(Math.min(24, (parseInt(g) || 8) + 1)))}>+</button>
              </div>
            </div>
            <button className="save-goal-btn" style={{ background: currentMode.color }} onClick={saveGoal}>✅ Save Goal</button>
          </div>
        )}

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className="settings-panel">
            <h3>⚙️ Timer Settings (minutes)</h3>
            <div className="settings-grid">
              {[["pomodoro", "🍅 Pomodoro"], ["short", "☕ Short Break"], ["long", "🌊 Long Break"]].map(([key, label]) => (
                <div key={key} className="setting-item">
                  <label>{label}</label>
                  <div className="setting-input-row">
                    <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, [key]: Math.max(1, (parseInt(s[key]) || 25) - 1) }))}>−</button>
                    <input className="setting-input" type="number" min="1" max="99" value={settingInputs[key]} onChange={(e) => setSettingInputs(s => ({ ...s, [key]: e.target.value }))} />
                    <button className="setting-step" onClick={() => setSettingInputs(s => ({ ...s, [key]: Math.min(99, (parseInt(s[key]) || 25) + 1) }))}>+</button>
                  </div>
                </div>
                
              ))}
            </div>
              <div className="setting-item" style={{ marginBottom: "0.5rem" }}>
              <label>🤖 Auto start next session</label>
              <button className={`toggle-btn ${autoStart ? "on" : ""}`}
                style={{ background: autoStart ? currentMode.color : "transparent" }}
                onClick={() => { setAutoStart(a => { const n = !a; localStorage.setItem("pomoAutoStart", String(n)); return n; }); }}>
                {autoStart ? "ON" : "OFF"}
              </button>
            </div>
            <div className="settings-btns">
              <button className="settings-apply" style={{ background: currentMode.color }} onClick={applySettings}>✅ Apply</button>
              <button className="settings-reset" onClick={resetSettings}>↺ Reset</button>
            </div>
          </div>
        )}

        {/* THEMES PANEL */}
        {showThemes && (
          <div className="themes-panel">
            {Object.entries(THEMES).map(([key, val]) => (
              <button key={key} className={`theme-btn ${theme === key ? "active" : ""}`} onClick={() => { setTheme(key); setShowThemes(false); }}>{val.label}</button>
            ))}
          </div>
        )}

        <div className="mode-tabs">
          {Object.entries(MODES).map(([key, val]) => (
            <button key={key} className={`mode-tab ${mode === key ? "active" : ""}`} style={{ "--tab-color": val.color }} onClick={() => switchMode(key)}>{val.label}</button>
          ))}
        </div>

        <div className="timer-wrap">
          <svg className="timer-ring" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="120" className="ring-bg" />
            <circle cx="140" cy="140" r="120" className="ring-progress" style={{ stroke: currentMode.color, strokeDasharray: circumference, strokeDashoffset: strokeDash }} />
          </svg>
          <div className="timer-content">
            <div className="timer-display">{format(timeLeft)}</div>
            <div className="timer-mode">{currentMode.label}</div>
            <div className="timer-total">{customTimes[mode]}:00 total</div>
          </div>
        </div>

        <div className="controls">
          <button className="ctrl-round" onClick={reset}>↺</button>
          <button className="play-btn" onClick={() => setRunning(r => !r)} style={{ background: currentMode.color }}>{running ? "⏸" : "▶"}</button>
          <button className="ctrl-round" onClick={() => switchMode(mode === "pomodoro" ? "short" : mode === "short" ? "long" : "pomodoro")}>⏭</button>
        </div>

        <div className="goal-mini" onClick={() => { setShowGoal(s => !s); closeAll("goal"); }}>
          <div className="goal-mini-label">
            <span>🎯 Today: {todaySessions}/{dailyGoal}</span>
            <span style={{ color: goalReached ? "#2dc653" : "var(--muted)" }}>{goalReached ? "✅ Done!" : `${Math.round(goalProgress)}%`}</span>
          </div>
          <div className="goal-mini-bar">
            <div className="goal-mini-fill" style={{ width: `${goalProgress}%`, background: goalReached ? "#2dc653" : currentMode.color }} />
          </div>
        </div>

        <div className="stats-row">
          <div className="stat"><span className="stat-val">{sessions}</span><span className="stat-label">Sessions</span></div>
          <div className="stat"><span className="stat-val">{Math.floor(totalFocus / 60)}m</span><span className="stat-label">Focus Time</span></div>
          <div className="stat"><span className="stat-val">{Math.floor(sessions / 4)}</span><span className="stat-label">Sets</span></div>
        </div>

        <div className="pomodoro-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`dot ${i < (sessions % 4) ? "filled" : ""}`} style={{ background: i < (sessions % 4) ? currentMode.color : undefined }} />
          ))}
        </div>

        {showTasks && (
          <div className="tasks-panel">
            <h3>📋 Tasks</h3>
            <div className="task-input-row">
              <input className="task-input" placeholder="Add a task..." value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
              <button className="task-add-btn" style={{ background: currentMode.color }} onClick={addTask}>+</button>
            </div>
            <ul className="task-list">
              {tasks.length === 0 && <li className="task-empty">No tasks yet!</li>}
              {tasks.map(task => (
                <li key={task.id} className={`task-item ${task.done ? "done" : ""}`}>
                  <button className="task-check" onClick={() => toggleTask(task.id)} style={{ borderColor: currentMode.color, background: task.done ? currentMode.color : "transparent" }}>{task.done ? "✔" : ""}</button>
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