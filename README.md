# ⏰ Pomodoro Timer

A beautiful, feature-rich Pomodoro Timer app built with React + Vite.

## ✨ Features

### ⏱ Timer
- 🍅 **Pomodoro** — 25 minute focus sessions (customizable)
- ☕ **Short Break** — 5 minute breaks (customizable)
- 🌊 **Long Break** — 15 minute breaks (customizable)
- 🔄 **Reset & Skip** buttons
- 🔔 **Sound alert** when timer ends
- 🔇 **Mute toggle** for sound
- 🤖 **Auto start** next session automatically

### 💬 Motivational Quotes
- 💬 **20 motivational quotes** from great minds
- 🔄 **Tap to change** quote anytime
- ✨ Smooth animation on change

### 📊 History Log
- 📊 **Session history** — see all past sessions
- 📅 **Grouped by day** — easy to read
- ⏰ **Time stamp** for each session
- 📋 **Daily summary** — pomodoros & focus time per day
- 🗑️ **Clear history** button
- 💾 **Saves to localStorage** — persists across refreshes

### 🎯 Daily Goal Tracker
- 🎯 **Set daily session goal** — decide how many sessions to complete
- 📊 **Progress bar** with percentage
- 🔴 **Goal dots** — visual progress tracking
- ✅ **Goal reached celebration** when you hit your target
- 📍 **Mini goal bar** always visible
- 💾 **Saves to localStorage** — persists across refreshes

### ⚙️ Custom Settings
- ✏️ **Change durations** for all 3 modes
- ➕➖ **Step buttons** to increase/decrease easily
- 🤖 **Auto start toggle** — on/off
- ✅ **Apply** to save changes instantly
- ↺ **Reset to default** anytime

### 🎨 Themes
- 🌙 **Dark** — classic dark theme
- ☀️ **Light** — clean light theme
- 🌿 **Forest** — deep green theme
- 🌊 **Ocean** — deep blue theme

### 📊 Stats
- ✅ **Sessions counter** — tracks completed pomodoros
- ⏱ **Total focus time** — minutes spent focusing
- 🎯 **Sets counter** — every 4 sessions = 1 set
- 🔴 **Progress dots** — visual session progress

### 📋 Tasks
- ➕ Add tasks to work on during sessions
- ✅ Check off completed tasks
- 🗑️ Delete tasks
- ⌨️ Press Enter to add quickly

### 🎨 UI
- 🎨 4 beautiful themes
- 🎨 Color changes per mode (red/green/blue)
- ⭕ Animated circular progress ring
- 💫 Smooth animations & transitions

## 🚀 Live Demo

👉 [pomodoro-iota-pink.vercel.app](https://pomodoro-iota-pink.vercel.app)

## 🛠 Tech Stack

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — lightning-fast bundler
- Web Audio API — for sound alerts
- CSS Variables — for dynamic theming
- localStorage — for history & goal persistence

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 How to Use

1. Click **📊** to view your session history
2. Click **🎯** to set your daily session goal
3. Click **⚙️** to customize timer & enable auto start
4. Click **🎨** to pick your favorite theme
5. Click **▶** to start the timer
6. Work until the timer ends 🔔
7. Take a **Short Break** (5 min)
8. Repeat 4 times then take a **Long Break** (15 min)
9. Tap the **quote card** for motivation 💬
10. Track your tasks in the **📋 Tasks** panel
11. Watch your daily goal progress! 🎯

## ⚙️ Default Timer Settings

| Mode | Default | Range |
|------|---------|-------|
| 🍅 Pomodoro | 25 min | 1-99 min |
| ☕ Short Break | 5 min | 1-99 min |
| 🌊 Long Break | 15 min | 1-99 min |

## 🎨 Themes

| Theme | Style |
|-------|-------|
| 🌙 Dark | Classic dark background |
| ☀️ Light | Clean white background |
| 🌿 Forest | Deep green nature feel |
| 🌊 Ocean | Deep blue ocean feel |

## 📁 Project Structure

pomodoro/
├── src/
│   ├── App.jsx      # Main component & timer logic
│   ├── App.css      # Styles & themes
│   └── main.jsx     # Entry point
├── index.html
└── package.json

## 📄 License

MIT