# 🧠 IQ Arena — Global IQ Leaderboard

Competitive IQ test platform with real-time global rankings and AI-powered analysis.

---

## 🚀 Deploy karo Netlify pe — Step by Step

### Step 1 — GitHub pe upload karo

1. GitHub.com pe jaao
2. New repository banao — naam: `iq-arena`
3. Saari files is folder se upload karo (ya git use karo)

```bash
git init
git add .
git commit -m "IQ Arena launch"
git remote add origin https://github.com/YOUR_USERNAME/iq-arena.git
git push -u origin main
```

---

### Step 2 — Netlify pe deploy karo

1. **netlify.com** pe jaao → Login karo
2. "Add new site" → "Import an existing project"
3. GitHub select karo → `iq-arena` repo choose karo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. **Deploy site** click karo

---

### Step 3 — AI Analysis ke liye API Key set karo

1. **anthropic.com/console** pe jaao
2. API Key banao (free mein milti hai limited usage)
3. Netlify dashboard → Site settings → Environment variables
4. Add karo:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-xxxxxxxx` (teri actual key)
5. Site redeploy karo

---

## 📁 Project Structure

```
iq-arena/
├── src/
│   ├── App.jsx          # Main platform
│   ├── main.jsx         # React entry
│   └── index.css        # Global styles
├── netlify/
│   └── functions/
│       └── claude-proxy.js  # AI proxy (fixes CORS)
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```

---

## 💻 Local mein chalao

```bash
npm install
npm run dev
```

Browser mein jaao: `http://localhost:5173`

---

## 🔧 Features

- ✅ 12 IQ questions (Pattern, Logic, Math, Spatial)
- ✅ Per-question countdown timer
- ✅ Global leaderboard with country flags
- ✅ AI-powered cognitive analysis
- ✅ Skill breakdown (strengths & weaknesses)
- ✅ Netlify serverless function for API proxy

---

Made with ❤️ by Kuldeep | IQ Arena
