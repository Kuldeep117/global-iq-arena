import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1, category: "Pattern Recognition",
    q: "What comes next? 2, 6, 12, 20, 30, __",
    opts: ["38", "40", "42", "44"],
    ans: 2, time: 30,
    skill: "pattern"
  },
  {
    id: 2, category: "Logical Deduction",
    q: "All Bloops are Razzies. All Razzies are Lazzies. Are ALL Bloops definitely Lazzies?",
    opts: ["Yes, always", "No, never", "Cannot determine", "Only sometimes"],
    ans: 0, time: 25,
    skill: "logic"
  },
  {
    id: 3, category: "Spatial Reasoning",
    q: "A cube painted red on all faces is cut into 27 equal pieces. How many pieces have ZERO red faces?",
    opts: ["0", "1", "6", "8"],
    ans: 1, time: 35,
    skill: "spatial"
  },
  {
    id: 4, category: "Mathematical Logic",
    q: "5 machines make 5 widgets in 5 minutes. How long for 100 machines to make 100 widgets?",
    opts: ["100 min", "50 min", "10 min", "5 min"],
    ans: 3, time: 30,
    skill: "math"
  },
  {
    id: 5, category: "Pattern Recognition",
    q: "1, 1, 2, 3, 5, 8, 13, __",
    opts: ["18", "19", "21", "24"],
    ans: 2, time: 20,
    skill: "pattern"
  },
  {
    id: 6, category: "Critical Thinking",
    q: "A bat and ball cost ₹110 total. The bat costs ₹100 MORE than the ball. What does the ball cost?",
    opts: ["₹10", "₹5", "₹15", "₹20"],
    ans: 1, time: 30,
    skill: "logic"
  },
  {
    id: 7, category: "Mathematical Logic",
    q: "What is 15% of 200 plus 20% of 150?",
    opts: ["55", "60", "65", "70"],
    ans: 1, time: 25,
    skill: "math"
  },
  {
    id: 8, category: "Pattern Recognition",
    q: "Which number does NOT belong: 16, 25, 36, 48, 64?",
    opts: ["16", "25", "48", "64"],
    ans: 2, time: 25,
    skill: "pattern"
  },
  {
    id: 9, category: "Logical Deduction",
    q: "Some cats are dogs. All dogs are birds. Which is DEFINITELY true?",
    opts: ["All cats are birds", "Some cats are birds", "No cats are birds", "All birds are cats"],
    ans: 1, time: 25,
    skill: "logic"
  },
  {
    id: 10, category: "Spatial Reasoning",
    q: "If you fold a square paper in half twice (both times along a line of symmetry), how many layers do you have?",
    opts: ["2", "3", "4", "8"],
    ans: 2, time: 25,
    skill: "spatial"
  },
  {
    id: 11, category: "Working Memory",
    q: "BIRD is to NEST as HUMAN is to:",
    opts: ["Food", "Home", "Work", "Family"],
    ans: 1, time: 20,
    skill: "logic"
  },
  {
    id: 12, category: "Mathematical Logic",
    q: "If 3x + 7 = 22, what is 2x?",
    opts: ["5", "10", "15", "30"],
    ans: 1, time: 25,
    skill: "math"
  }
];

const SEED_BOARD = [
  { name: "Arjun S.", score: 148, time: 187, country: "🇮🇳", rank: 1 },
  { name: "Mei L.", score: 145, time: 201, country: "🇨🇳", rank: 2 },
  { name: "Viktor K.", score: 142, time: 195, country: "🇷🇺", rank: 3 },
  { name: "Priya R.", score: 139, time: 220, country: "🇮🇳", rank: 4 },
  { name: "James T.", score: 137, time: 234, country: "🇬🇧", rank: 5 },
  { name: "Yuki H.", score: 135, time: 245, country: "🇯🇵", rank: 6 },
  { name: "Sofia M.", score: 133, time: 251, country: "🇪🇸", rank: 7 },
  { name: "Chen W.", score: 131, time: 263, country: "🇨🇳", rank: 8 },
  { name: "Rahul G.", score: 129, time: 271, country: "🇮🇳", rank: 9 },
  { name: "Anna K.", score: 127, time: 280, country: "🇩🇪", rank: 10 },
  { name: "Omar F.", score: 125, time: 289, country: "🇪🇬", rank: 11 },
  { name: "Lena V.", score: 123, time: 295, country: "🇫🇷", rank: 12 },
  { name: "Raj P.", score: 121, time: 305, country: "🇮🇳", rank: 13 },
  { name: "Sana A.", score: 119, time: 312, country: "🇵🇰", rank: 14 },
  { name: "Mark O.", score: 117, time: 320, country: "🇺🇸", rank: 15 },
];

function calcIQ(correct, total, totalTimeTaken, maxTime) {
  const accuracy = correct / total;
  const speedBonus = Math.max(0, (maxTime - totalTimeTaken) / maxTime);
  const raw = 70 + accuracy * 60 + speedBonus * 20;
  return Math.min(160, Math.round(raw));
}

function getSkillBreakdown(answers, questions) {
  const skills = { pattern: { correct: 0, total: 0 }, logic: { correct: 0, total: 0 }, math: { correct: 0, total: 0 }, spatial: { correct: 0, total: 0 } };
  questions.forEach((q, i) => {
    if (answers[i] !== undefined) {
      skills[q.skill].total++;
      if (answers[i] === q.ans) skills[q.skill].correct++;
    }
  });
  return skills;
}

function getRankFromIQ(iq, board) {
  const below = board.filter(e => e.score < iq).length;
  return board.length - below + 1;
}

const SKILL_LABELS = { pattern: "Pattern Recognition", logic: "Logical Deduction", math: "Mathematical Reasoning", spatial: "Spatial Thinking" };
const SKILL_ICONS = { pattern: "◈", logic: "⬡", math: "∑", spatial: "⬛" };

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function CountUp({ target, duration = 1500 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{val}</span>;
}

function ProgressBar({ value, max, color = "#00f5a0" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 1s ease" }} />
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────

export default function IQArena() {
  const [screen, setScreen] = useState("home"); // home | enter | test | result | board
  const [userName, setUserName] = useState("");
  const [userCountry, setUserCountry] = useState("🇮🇳");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [leaderboard, setLeaderboard] = useState(SEED_BOARD);
  const [userResult, setUserResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const timerRef = useRef(null);
  const totalTimeRef = useRef(0);

  const currentQ = QUESTIONS[qIdx];
  const maxTotalTime = QUESTIONS.reduce((s, q) => s + q.time, 0);

  // Timer
  useEffect(() => {
    if (screen !== "test") return;
    setTimeLeft(currentQ.time);
    setSelected(null);
    setRevealed(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        totalTimeRef.current += 1;
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleNext(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIdx]);

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    clearInterval(timerRef.current);
    setAnswers(prev => ({ ...prev, [qIdx]: idx }));
  };

  const handleNext = useCallback((forcedAns) => {
    if (forcedAns !== undefined && forcedAns !== null) {
      setAnswers(prev => ({ ...prev, [qIdx]: forcedAns }));
    }
    clearInterval(timerRef.current);
    if (qIdx + 1 >= QUESTIONS.length) {
      finishTest();
    } else {
      setQIdx(q => q + 1);
    }
  }, [qIdx]);

  const finishTest = () => {
    const correct = Object.entries(answers).filter(([i, a]) => QUESTIONS[+i].ans === a).length;
    const iq = calcIQ(correct, QUESTIONS.length, totalTimeRef.current, maxTotalTime);
    const rank = getRankFromIQ(iq, SEED_BOARD);
    const skills = getSkillBreakdown(answers, QUESTIONS);
    const result = { iq, rank, correct, total: QUESTIONS.length, time: totalTimeRef.current, skills };
    setUserResult(result);

    // Add to leaderboard
    const newEntry = { name: userName || "You", score: iq, time: totalTimeRef.current, country: userCountry, rank, isUser: true };
    setLeaderboard(prev => {
      const updated = [...prev, newEntry].sort((a, b) => b.score - a.score || a.time - b.time).map((e, i) => ({ ...e, rank: i + 1 }));
      return updated.slice(0, 50);
    });

    setScreen("result");
    fetchAIAnalysis(result, correct);
  };

  const fetchAIAnalysis = async (result, correct) => {
    setLoadingAI(true);
    const skillText = Object.entries(result.skills).map(([k, v]) => `${SKILL_LABELS[k]}: ${v.correct}/${v.total}`).join(", ");
    try {
      const res = await fetch("/.netlify/functions/claude-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an expert psychologist analyzing IQ test results. The user scored IQ ${result.iq}, got ${correct}/${result.total} correct in ${result.time} seconds. Skill breakdown: ${skillText}.

Write a personalized 3-paragraph analysis in this format:
1. Overall cognitive profile (2-3 sentences about what IQ ${result.iq} means and their percentile)
2. Strengths: Which skills they excelled at and what that reveals about their thinking style
3. Growth areas: Which skills need improvement and specific actionable tips

Keep it encouraging, specific, and insightful. Use plain text, no markdown symbols.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setAiAnalysis(text);
    } catch {
      setAiAnalysis("Your cognitive profile shows a unique blend of analytical and creative thinking. Your performance indicates strong reasoning capabilities with room to develop in specific areas. Continue practicing logical puzzles and pattern recognition exercises to further enhance your scores.");
    }
    setLoadingAI(false);
  };

  const restart = () => {
    setScreen("home"); setQIdx(0); setAnswers({}); setSelected(null);
    setRevealed(false); setUserResult(null); setAiAnalysis(""); totalTimeRef.current = 0;
  };

  // ── STYLES ──
  const S = {
    app: {
      minHeight: "100vh", background: "#060810",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e8eaf0", position: "relative", overflow: "hidden"
    },
    bg: {
      position: "fixed", inset: 0, zIndex: 0,
      background: "radial-gradient(ellipse at 20% 20%, rgba(0,245,160,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,180,255,0.07) 0%, transparent 50%)",
      pointerEvents: "none"
    },
    grid: {
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(0,245,160,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,160,0.04) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    },
    wrap: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 20px" },
    card: {
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 16, padding: 32, backdropFilter: "blur(20px)"
    },
    accent: { color: "#00f5a0" },
    accent2: { color: "#00b4ff" },
    btn: {
      background: "linear-gradient(135deg, #00f5a0, #00b4ff)", border: "none",
      color: "#060810", fontWeight: 700, padding: "14px 32px", borderRadius: 8,
      cursor: "pointer", fontSize: 16, fontFamily: "inherit", letterSpacing: 1
    },
    btnOutline: {
      background: "transparent", border: "1px solid rgba(0,245,160,0.4)",
      color: "#00f5a0", padding: "10px 24px", borderRadius: 8,
      cursor: "pointer", fontSize: 14, fontFamily: "inherit"
    },
    tag: {
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase"
    }
  };

  // ── SCREENS ──

  if (screen === "home") return (
    <div style={S.app}>
      <div style={S.bg} /><div style={S.grid} />
      <div style={S.wrap}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 24 }}>
          <div style={{ ...S.tag, background: "rgba(0,245,160,0.1)", color: "#00f5a0", border: "1px solid rgba(0,245,160,0.3)" }}>Global IQ Arena</div>
          <h1 style={{ fontSize: "clamp(40px,8vw,80px)", fontWeight: 900, letterSpacing: -2, lineHeight: 1, margin: 0, fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}>
            HOW SMART<br /><span style={{ WebkitTextStroke: "2px #00f5a0", color: "transparent" }}>ARE YOU?</span>
          </h1>
          <p style={{ fontSize: 16, opacity: 0.6, maxWidth: 420, lineHeight: 1.7, margin: 0 }}>
            12 questions. Real IQ score. Global leaderboard.<br />Find out where YOU rank among thousands worldwide.
          </p>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[["12", "Questions"], ["~6min", "Duration"], ["Top 100", "Global Rank"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#00f5a0" }}>{n}</div>
                <div style={{ fontSize: 12, opacity: 0.5, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button style={S.btn} onClick={() => setScreen("enter")}>START TEST →</button>
            <button style={S.btnOutline} onClick={() => setScreen("board")}>VIEW LEADERBOARD</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "enter") return (
    <div style={S.app}>
      <div style={S.bg} /><div style={S.grid} />
      <div style={S.wrap}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 24, maxWidth: 480, margin: "0 auto" }}>
          <button style={{ ...S.btnOutline, alignSelf: "flex-start" }} onClick={() => setScreen("home")}>← Back</button>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: 1 }}>
            ENTER THE <span style={S.accent}>ARENA</span>
          </h2>
          <div style={S.card}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Your Name</label>
              <input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Enter your name..."
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "12px 16px", color: "#e8eaf0", fontSize: 16, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Country</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["🇮🇳", "🇺🇸", "🇬🇧", "🇨🇳", "🇷🇺", "🇯🇵", "🇩🇪", "🇫🇷", "🌍"].map(flag => (
                  <button key={flag} onClick={() => setUserCountry(flag)} style={{ fontSize: 24, background: userCountry === flag ? "rgba(0,245,160,0.2)" : "rgba(255,255,255,0.05)", border: userCountry === flag ? "2px solid #00f5a0" : "2px solid transparent", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                    {flag}
                  </button>
                ))}
              </div>
            </div>
            <button style={{ ...S.btn, width: "100%" }} onClick={() => { if (userName.trim()) setScreen("test"); }}>
              BEGIN IQ TEST →
            </button>
            {!userName.trim() && <p style={{ textAlign: "center", fontSize: 12, opacity: 0.4, margin: "8px 0 0" }}>Enter your name to continue</p>}
          </div>
          <div style={{ ...S.card, padding: 20 }}>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.6, lineHeight: 1.7 }}>
              ⚡ Each question has a time limit<br />
              🧠 Answer quickly for speed bonus<br />
              🌍 Your score goes on the global leaderboard<br />
              📊 AI analyzes your cognitive profile at the end
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "test") {
    const progress = ((qIdx) / QUESTIONS.length) * 100;
    const timerPct = (timeLeft / currentQ.time) * 100;
    const timerColor = timerPct > 50 ? "#00f5a0" : timerPct > 25 ? "#ffcc00" : "#ff4444";

    return (
      <div style={S.app}>
        <div style={S.bg} /><div style={S.grid} />
        <div style={S.wrap}>
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, padding: "40px 0" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.5 }}>Question <span style={{ color: "#00f5a0", fontWeight: 700 }}>{qIdx + 1}</span> / {QUESTIONS.length}</div>
              <div style={{ ...S.tag, background: "rgba(0,180,255,0.1)", color: "#00b4ff", border: "1px solid rgba(0,180,255,0.3)" }}>{currentQ.category}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: timerColor, minWidth: 60, textAlign: "right" }}>{timeLeft}s</div>
            </div>

            {/* Progress */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00f5a0,#00b4ff)", borderRadius: 4, transition: "width 0.3s" }} />
            </div>

            {/* Timer bar */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 3 }}>
              <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 4, transition: "width 1s linear" }} />
            </div>

            {/* Question */}
            <div style={{ ...S.card, padding: "28px 32px" }}>
              <p style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, margin: 0, lineHeight: 1.5, letterSpacing: -0.5 }}>{currentQ.q}</p>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {currentQ.opts.map((opt, i) => {
                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.1)";
                let col = "#e8eaf0";
                if (revealed) {
                  if (i === currentQ.ans) { bg = "rgba(0,245,160,0.15)"; border = "1px solid #00f5a0"; col = "#00f5a0"; }
                  else if (i === selected && i !== currentQ.ans) { bg = "rgba(255,68,68,0.15)"; border = "1px solid #ff4444"; col = "#ff4444"; }
                } else if (selected === i) { bg = "rgba(0,180,255,0.15)"; border = "1px solid #00b4ff"; }
                return (
                  <button key={i} onClick={() => handleSelect(i)} style={{ background: bg, border, borderRadius: 12, padding: "16px 20px", color: col, fontSize: 15, fontFamily: "inherit", cursor: revealed ? "default" : "pointer", textAlign: "left", fontWeight: selected === i || (revealed && i === currentQ.ans) ? 700 : 400, transition: "all 0.2s" }}>
                    <span style={{ opacity: 0.4, marginRight: 8, fontSize: 12 }}>{["A", "B", "C", "D"][i]}</span>{opt}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <button style={{ ...S.btn, alignSelf: "flex-end", padding: "12px 28px" }} onClick={() => handleNext(selected)}>
                {qIdx + 1 >= QUESTIONS.length ? "SEE RESULTS →" : "NEXT →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "result" && userResult) {
    const { iq, rank, correct, total, time, skills } = userResult;
    const percentile = Math.max(1, Math.round(100 - (rank / (leaderboard.length + 500)) * 100));
    const skillEntries = Object.entries(skills);

    return (
      <div style={S.app}>
        <div style={S.bg} /><div style={S.grid} />
        <div style={S.wrap}>
          <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* IQ Score Hero */}
            <div style={{ ...S.card, textAlign: "center", padding: "40px 32px", background: "rgba(0,245,160,0.05)", border: "1px solid rgba(0,245,160,0.2)" }}>
              <div style={{ fontSize: 12, opacity: 0.5, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Your IQ Score</div>
              <div style={{ fontSize: "clamp(72px,15vw,120px)", fontWeight: 900, lineHeight: 1, color: "#00f5a0", fontFamily: "'Bebas Neue','Impact',sans-serif" }}>
                <CountUp target={iq} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20, flexWrap: "wrap" }}>
                {[["#" + rank, "Global Rank"], [correct + "/" + total, "Correct"], [percentile + "%ile", "Percentile"], [time + "s", "Time"]].map(([v, l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#00b4ff" }}>{v}</div>
                    <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Breakdown */}
            <div style={S.card}>
              <div style={{ fontSize: 12, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Cognitive Skill Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {skillEntries.map(([key, val]) => {
                  const pct = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0;
                  const color = pct >= 75 ? "#00f5a0" : pct >= 50 ? "#00b4ff" : pct >= 25 ? "#ffcc00" : "#ff6644";
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span>{SKILL_ICONS[key]} {SKILL_LABELS[key]}</span>
                        <span style={{ color, fontWeight: 700 }}>{val.correct}/{val.total} — {pct}%</span>
                      </div>
                      <ProgressBar value={val.correct} max={val.total} color={color} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Analysis */}
            <div style={{ ...S.card, background: "rgba(0,180,255,0.04)", border: "1px solid rgba(0,180,255,0.2)" }}>
              <div style={{ fontSize: 12, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                ✦ AI Cognitive Analysis
              </div>
              {loadingAI ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[100, 85, 70].map((w, i) => (
                    <div key={i} style={{ height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 4, width: `${w}%`, animation: "pulse 1.5s infinite" }} />
                  ))}
                  <p style={{ opacity: 0.4, fontSize: 13, textAlign: "center", margin: 0 }}>AI is analyzing your profile...</p>
                </div>
              ) : (
                <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.85, margin: 0, whiteSpace: "pre-wrap" }}>{aiAnalysis}</p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button style={S.btn} onClick={() => setScreen("board")}>VIEW LEADERBOARD</button>
              <button style={S.btnOutline} onClick={restart}>TAKE TEST AGAIN</button>
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
      </div>
    );
  }

  if (screen === "board") {
    const userEntry = leaderboard.find(e => e.isUser);
    return (
      <div style={S.app}>
        <div style={S.bg} /><div style={S.grid} />
        <div style={S.wrap}>
          <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: 1 }}>
                  GLOBAL <span style={S.accent}>LEADERBOARD</span>
                </h2>
                <p style={{ opacity: 0.4, fontSize: 13, margin: "4px 0 0" }}>{leaderboard.length}+ participants worldwide</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {userResult ? <button style={S.btnOutline} onClick={() => setScreen("result")}>MY RESULT</button> : null}
                <button style={S.btn} onClick={() => setScreen(userResult ? "home" : "enter")}>
                  {userResult ? "PLAY AGAIN" : "TAKE TEST →"}
                </button>
              </div>
            </div>

            {userEntry && (
              <div style={{ ...S.card, background: "rgba(0,245,160,0.08)", border: "1px solid rgba(0,245,160,0.3)", padding: "16px 20px" }}>
                <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Your Position</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#00f5a0" }}>#{userEntry.rank}</span>
                    <span style={{ fontSize: 22 }}>{userEntry.country}</span>
                    <span style={{ fontWeight: 700 }}>{userEntry.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#00f5a0" }}>IQ {userEntry.score}</div>
                    <div style={{ fontSize: 11, opacity: 0.4 }}>{userEntry.time}s</div>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div style={S.card}>
              <div style={{ display: "grid", gridTemplateColumns: "50px 1fr auto auto", gap: "10px 16px", fontSize: 11, opacity: 0.4, letterSpacing: 2, textTransform: "uppercase", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
                <span>Rank</span><span>Player</span><span style={{ textAlign: "right" }}>IQ</span><span style={{ textAlign: "right" }}>Time</span>
              </div>
              {leaderboard.slice(0, 20).map((entry, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const isUser = entry.isUser;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr auto auto", gap: "10px 16px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", background: isUser ? "rgba(0,245,160,0.05)" : "transparent", borderRadius: isUser ? 8 : 0, alignItems: "center" }}>
                    <span style={{ fontWeight: 900, color: i < 3 ? "#ffcc00" : isUser ? "#00f5a0" : "#666", fontSize: i < 3 ? 18 : 14 }}>
                      {i < 3 ? medals[i] : `#${entry.rank}`}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{entry.country}</span>
                      <span style={{ fontWeight: isUser ? 700 : 400, color: isUser ? "#00f5a0" : "#e8eaf0" }}>{entry.name}{isUser ? " (You)" : ""}</span>
                    </span>
                    <span style={{ textAlign: "right", fontWeight: 900, color: i < 3 ? "#ffcc00" : "#00b4ff", fontSize: 16 }}>{entry.score}</span>
                    <span style={{ textAlign: "right", opacity: 0.4, fontSize: 12 }}>{entry.time}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
