import { useState, useRef, useEffect, useCallback } from "react";

const MIC_DURATION = 25; // seconds the mic stays open

// ── Severity-aware symptom parsing ────────────────────────────────────────────
// Returns values that match alertEngine.js exactly:
//   nausea: 'none' | 'nausea' | 'vomiting'
//   fatigue: 'none' | 'mild' | 'moderate' | 'extreme'
//   breathingDifficulty: 'none' | 'mild' | 'moderate' | 'severe'
//   bleeding: 'none' | 'minor' | 'heavy'
//   swelling: 'none' | 'mild' | 'significant'
//   consciousness: 'normal' | 'confused'
//   temperature: number (°C) — inferred from fever keywords
// ── Negation-aware matcher ────────────────────────────────────────────────────
// Returns true only if `pattern` matches AND is NOT preceded by a negation word
// within a 4-word window (e.g. "don't have", "no", "not feeling", "without").
function neg(text, pattern) {
  // Build a regex: (negation)(up to 4 words)(keyword)
  const negPrefix = /(?:no|not|don'?t|do not|does not|doesn'?t|haven'?t|have no|without|never|i don'?t|i do not)\s+(?:\w+\s+){0,4}/i;
  // Find all matches of the pattern and check if any is NOT negated
  const src = pattern.source;
  // Check if the negated form exists
  const negated = new RegExp(negPrefix.source + src, 'i');
  // Check if the positive form exists
  const positive = pattern;
  if (!positive.test(text)) return false; // keyword not present at all
  // If both negated and positive match, the negated one wins
  if (negated.test(text)) return false;
  return true;
}

function parseTranscript(text) {
  const t = text.toLowerCase();

  // ── Pain level ─────────────────────────────────────────────────────────────
  // catches: "pain is 7", "level eight", "9 out of 10", bare digit
  const wordNums = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
  let painLevel = null;
  const digitPain = t.match(/\b(10|[1-9])\s*(?:out\s*of\s*10|\/\s*10)?\b/);
  if (digitPain) painLevel = parseInt(digitPain[1], 10);
  else { for (const [w,n] of Object.entries(wordNums)) { if (new RegExp(`\\b${w}\\b`).test(t)) { painLevel=n; break; } } }

  // ── Temperature / fever ────────────────────────────────────────────────────
  let temperature = null;
  const degMatch = t.match(/\b(3[5-9](?:\.\d)?|4[0-2](?:\.\d)?)\s*(?:degrees?|°c?|celsius)?\b/);
  if (degMatch) temperature = parseFloat(degMatch[1]);
  else if (neg(t, /burning up|i.?m on fire|very high fever|raging fever|104|105|103/i)) temperature = 40.2;
  else if (neg(t, /high fever|severe fever|bad fever|really hot|extremely hot/i))        temperature = 39.6;
  else if (neg(t, /fever|feverish|feeling hot|running hot|chills|shivering|temperature is high|warm to touch/i)) temperature = 38.7;

  // ── Nausea — warning='vomiting' ───────────────────────────────────────────
  let nausea = 'none';
  if      (neg(t, /vomit|threw up|throwing up|throw up|puking|can.t keep food|can.t keep anything/i)) nausea = 'vomiting';
  else if (neg(t, /nausea|nauseous|queasy|feel sick|sick to.*stomach|want to vomit|about to vomit/i)) nausea = 'nausea';

  // ── Fatigue — warning='extreme' ───────────────────────────────────────────
  let fatigue = 'none';
  if      (neg(t, /can.?t (move|get up|stand|walk)|completely exhausted|totally exhausted|utterly exhausted|no energy at all|severe fatigue|extreme.? tired|extreme fatigue/i)) fatigue = 'extreme';
  else if (neg(t, /very tired|very fatigued|so tired|moderately tired|quite tired|really tired|so exhausted|drained/i)) fatigue = 'moderate';
  else if (neg(t, /tired|fatigue|fatigued|weak|exhausted|sleepy|lethargic|sluggish|low energy|no strength/i)) fatigue = 'mild';

  // ── Breathing — critical='severe', warning='moderate' ────────────────────
  let breathingDifficulty = 'none';
  if      (neg(t, /can.?t breathe|cannot breathe|no breath|suffocating|gasping|struggling to breathe|severe.? short of breath/i)) breathingDifficulty = 'severe';
  else if (neg(t, /trouble breathing|difficulty breathing|hard to breathe|breathing is hard|breathing problem|chest tight|tightness in chest/i)) breathingDifficulty = 'moderate';
  else if (neg(t, /short of breath|shortness of breath|breathless|a little short|mild breath/i)) breathingDifficulty = 'mild';

  // ── Bleeding — critical='heavy' ───────────────────────────────────────────
  let bleeding = 'none';
  if      (neg(t, /heavy bleed|a lot of blood|profuse|bleeding badly|blood everywhere|bleeding heavily/i)) bleeding = 'heavy';
  else if (neg(t, /bleed|blood|bleeding|wound is open|minor bleed|a little blood|small cut/i))            bleeding = 'minor';

  // ── Swelling — warning='significant' ─────────────────────────────────────
  let swelling = 'none';
  if      (neg(t, /very swollen|a lot of swelling|significant swelling|badly swollen|major swelling|severe swelling/i)) swelling = 'significant';
  else if (neg(t, /swollen|swelling|puffiness|puffy|a little swollen|slight swelling/i))                               swelling = 'mild';

  // ── Consciousness — critical='confused' ───────────────────────────────────
  const consciousness = /confused|disoriented|don.?t know where|don.?t remember|losing consciousness|passing out|can.?t think|not oriented|blacked out/i.test(t)
    ? 'confused' : 'normal';

  // ── UI-only flags (not in alertEngine) ───────────────────────────────────
  const headache  = neg(t, /headache|head ache|migraine|head pain|my head hurts|head is pounding|throbbing head/i);
  const dizziness = neg(t, /dizzy|dizziness|lightheaded|vertigo|room is spinning|can.?t balance|unsteady/i);

  return { painLevel, temperature, nausea, fatigue, breathingDifficulty, bleeding, swelling, consciousness, headache, dizziness };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function VoiceVitalsForm({ onSave }) {

  const [isListening, setIsListening] = useState(false);
  const [countdown, setCountdown] = useState(MIC_DURATION);
  const [fullTranscript, setFullTranscript] = useState("");
  const [painLevel, setPainLevel] = useState(5);
  const [parsed, setParsed] = useState(null);
  // UI symptom checkboxes (merged from voice + manual)
  const [uiSymptoms, setUiSymptoms] = useState({
    headache: false, fever: false, nausea: false,
    fatigue: false, dizziness: false, shortnessOfBreath: false,
  });
  const [statusMsg, setStatusMsg] = useState("");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef("");

  const stopListening = useCallback(() => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);
    setCountdown(MIC_DURATION);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;      // keep listening even after pauses
    recognition.interimResults = true;  // show live partial results
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      // Accumulate all final results into one string
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) combined += event.results[i][0].transcript + " ";
      }
      // Also grab the latest interim result for display
      const interim = event.results[event.results.length - 1];
      const display = combined.trim() || interim[0].transcript;
      transcriptRef.current = combined.trim();
      setFullTranscript(display);

      // Live-parse as the user speaks
      const p = parseTranscript(display);
      setParsed(p);
      if (p.painLevel !== null) setPainLevel(p.painLevel);
      setUiSymptoms({
        headache:         p.headache,
        fever:            p.temperature !== null,
        nausea:           p.nausea !== 'none',
        fatigue:          p.fatigue !== 'none',
        dizziness:        p.dizziness,
        shortnessOfBreath: p.breathingDifficulty !== 'none',
      });
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // ignore silence gaps
      setStatusMsg(`⚠️ Error: ${e.error}`);
      stopListening();
    };

    // Auto-restart on unexpected end while still "listening" (browser limit)
    recognition.onend = () => {
      if (recognitionRef.current?._shouldRestart) {
        try { recognition.start(); } catch (_) {}
      }
    };

    recognitionRef.current = recognition;
  }, [stopListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current._shouldRestart = false;
      stopListening();
      setStatusMsg("✅ Stopped. Review & submit below.");
      return;
    }
    // Reset state
    transcriptRef.current = "";
    setFullTranscript("");
    setParsed(null);
    setStatusMsg(`🎙️ Listening for ${MIC_DURATION}s — speak freely…`);
    setCountdown(MIC_DURATION);
    recognitionRef.current._shouldRestart = true;
    recognitionRef.current.start();
    setIsListening(true);

    // Countdown timer — auto-stop at 0
    let secs = MIC_DURATION;
    timerRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) {
        recognitionRef.current._shouldRestart = false;
        stopListening();
        setStatusMsg("✅ Done! Review below & submit.");
      }
    }, 1000);
  };

  const handleSlider = (e) => setPainLevel(Number(e.target.value));

  const handleCheckbox = (key) =>
    setUiSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = () => {
    if (typeof onSave === "function") {
      onSave({
        painLevel,
        // Pass the rich parsed object so SymptomLog can map to alertEngine
        parsedVoice: parsed,
        uiSymptoms,
        transcript: fullTranscript,
        recordedAt: new Date().toISOString(),
      });
    }
  };

  const symptomLabels = {
    headache: "🤕 Headache",
    fever: "🌡️ Fever",
    nausea: "🤢 Nausea",
    fatigue: "😴 Fatigue",
    dizziness: "💫 Dizziness",
    shortnessOfBreath: "😮‍💨 Shortness of Breath",
  };

  const painColor = painLevel <= 3 ? "#22c55e" : painLevel <= 6 ? "#f59e0b" : "#ef4444";

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🩺 Voice Vitals Check-In</h2>
      <p style={styles.subtitle}>
        Tap the mic and describe your symptoms — speak for up to {MIC_DURATION} seconds.
      </p>

      {/* ── Microphone Button ───────────────────────────── */}
      {!supported ? (
        <p style={styles.unsupported}>
          ⚠️ Voice input is not supported in this browser. Please use Chrome or Edge.
        </p>
      ) : (
        <div style={styles.micWrapper}>
          <button
            onClick={toggleListening}
            style={{
              ...styles.micButton,
              background: isListening
                ? "radial-gradient(circle, #ef4444, #b91c1c)"
                : "radial-gradient(circle, #6366f1, #4338ca)",
              animation: isListening ? "pulse 1.2s infinite" : "none",
            }}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? "⏹" : "🎙️"}
          </button>

          {/* Countdown ring */}
          {isListening && (
            <div style={styles.countdown}>
              <span style={{ fontSize: "1.6rem", fontWeight: 700, color: countdown <= 10 ? "#ef4444" : "#a5b4fc" }}>
                {countdown}s
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>remaining</span>
            </div>
          )}

          <p style={styles.micLabel}>
            {isListening ? "Recording… tap to stop early" : "Tap to Speak"}
          </p>
          {statusMsg && <p style={styles.statusMsg}>{statusMsg}</p>}
          {fullTranscript && (
            <p style={styles.transcript}><em>"{fullTranscript}"</em></p>
          )}
        </div>
      )}

      <hr style={styles.divider} />

      {/* ── Pain Level Slider ───────────────────────────── */}
      <div style={styles.section}>
        <label style={styles.label}>
          Pain Level:{" "}
          <span style={{ color: painColor, fontWeight: 700, fontSize: "1.3rem" }}>
            {painLevel} / 10
          </span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={painLevel}
          onChange={handleSlider}
          style={{ ...styles.slider, accentColor: painColor }}
          aria-label="Pain level slider"
        />
        <div style={styles.sliderScale}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <span
              key={n}
              style={{
                ...styles.scaleTick,
                fontWeight: painLevel === n ? 700 : 400,
                color: painLevel === n ? painColor : "#94a3b8",
              }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* ── Symptom Checkboxes ──────────────────────────── */}
      <div style={styles.section}>
        <label style={styles.label}>Symptoms <span style={{fontSize:"0.75rem",color:"#64748b",fontWeight:400}}>(auto-detected or tap to toggle)</span>:</label>
        <div style={styles.checkboxGrid}>
          {Object.entries(symptomLabels).map(([key, label]) => (
            <label key={key} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={uiSymptoms[key]}
                onChange={() => handleCheckbox(key)}
                style={styles.checkbox}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Submit Button ───────────────────────────────── */}
      <button onClick={handleSubmit} style={styles.submitBtn}>
        ✅ Confirm &amp; Submit
      </button>

      {/* ── Pulse Animation ─────────────────────────────── */}
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); transform: scale(1); }
          70%  { box-shadow: 0 0 0 18px rgba(239,68,68,0); transform: scale(1.07); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const styles = {
  card: {
    maxWidth: 560,
    margin: "2rem auto",
    padding: "2.5rem 2rem",
    background: "linear-gradient(145deg, #1e1b4b, #0f172a)",
    borderRadius: 24,
    boxShadow: "0 8px 40px rgba(99,102,241,0.25)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#e2e8f0",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    margin: "0 0 0.3rem",
    textAlign: "center",
    color: "#a5b4fc",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  unsupported: {
    background: "#7f1d1d",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: 10,
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  micWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "1rem",
  },
  countdown: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "0.4rem 1.2rem",
    border: "1px solid #334155",
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: "2.4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    transition: "background 0.3s, transform 0.1s",
  },
  micLabel: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#c7d2fe",
    margin: 0,
  },
  statusMsg: {
    fontSize: "0.85rem",
    color: "#a5b4fc",
    margin: 0,
  },
  transcript: {
    fontSize: "0.88rem",
    color: "#64748b",
    maxWidth: 380,
    textAlign: "center",
    margin: 0,
  },
  divider: {
    border: "none",
    borderTop: "1px solid #334155",
    margin: "1.5rem 0",
  },
  section: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#c7d2fe",
    marginBottom: "0.6rem",
  },
  slider: {
    width: "100%",
    height: 8,
    cursor: "pointer",
    borderRadius: 4,
  },
  sliderScale: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.3rem",
    fontSize: "0.75rem",
  },
  scaleTick: {
    width: "10%",
    textAlign: "center",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem 1.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    userSelect: "none",
    color: "#cbd5e1",
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: "#6366f1",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: "0.9rem",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
    transition: "opacity 0.2s",
  },
};
