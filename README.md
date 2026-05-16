# ⏰ Pomodoro Timer

A beautiful, feature-rich Pomodoro Timer app built with React + Vite.

## ✨ Features

### ⏱ Timer
- 🍅 **Pomodoro** — 25 minute focus sessions
- ☕ **Short Break** — 5 minute breaks
- 🌊 **Long Break** — 15 minute breaks
- 🔄 **Reset & Skip** buttons
- 🔔 **Sound alert** when timer ends
- 🔇 **Mute toggle** for sound

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
- 🌙 Beautiful dark theme
- 🎨 Color changes per mode (red/green/blue)
- ⭕ Animated circular progress ring
- 💫 Smooth animations

## 🚀 Live Demo

👉 [Coming soon on Vercel]

## 🛠 Tech Stack

- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — lightning-fast bundler
- Web Audio API — for sound alerts
- CSS Variables — for dynamic theming

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

1. Click **▶** to start the 25 minute focus timer
2. Work until the timer ends 🔔
3. Take a **Short Break** (5 min)
4. Repeat 4 times then take a **Long Break** (15 min)
5. Track your tasks in the **📋 Tasks** panel
6. Watch your stats grow! 📊

## 📁 Project Structure
pomodoro/
├── src/
│   ├── App.jsx      # Main component & timer logic
│   ├── App.css      # Styles & animations
│   └── main.jsx     # Entry point
├── index.html
└── package.json

## 📄 License

MIT