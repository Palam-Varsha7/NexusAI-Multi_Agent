import React, { useEffect, useRef, useState } from "react";

function ParticleCanvas({ burst }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    // Ambient floating particles
    for (let i = 0; i < 120; i++) {
      particles.current.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        color: Math.random() > 0.5 ? "60,255,181" : "0,229,255",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.current.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Burst effect
  useEffect(() => {
    if (!burst) return;
    const canvas = canvasRef.current;
    const W = canvas.width;
    const H = canvas.height;
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particles.current.push({
        x: W / 2,
        y: H / 2,
        r: Math.random() * 2 + 1,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        alpha: 1,
        color: Math.random() > 0.5 ? "60,255,181" : "255,79,216",
        decay: true,
      });
    }
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

const PHASES = ["black", "grid", "logo", "tagline", "burst", "exit"];

export default function Intro({ onComplete }) {
  const [phase, setPhase] = useState(0); // index into PHASES
  const [burst, setBurst] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [charIdx, setCharIdx] = useState(0);
  const tagline = "MULTI-AGENT BUSINESS INTELLIGENCE";

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // grid fades in
      setTimeout(() => setPhase(2), 1200),  // logo assembles
      setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 300); }, 2200),
      setTimeout(() => setPhase(3), 2800),  // tagline types
      setTimeout(() => { setPhase(4); setBurst(true); }, 4600), // burst
      setTimeout(() => setPhase(5), 5600),  // exit
      setTimeout(() => onComplete(), 6400), // done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Typewriter for tagline
  useEffect(() => {
    if (phase < 3) return;
    if (charIdx >= tagline.length) return;
    const t = setTimeout(() => setCharIdx((c) => c + 1), 55);
    return () => clearTimeout(t);
  }, [phase, charIdx]);

  const phaseName = PHASES[phase];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020307",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 9999,
        transition: phaseName === "exit" ? "opacity 0.8s ease" : "none",
        opacity: phaseName === "exit" ? 0 : 1,
      }}
    >
      {/* Particle canvas */}
      <ParticleCanvas burst={burst} />

      <div className="owner-badge">
        <strong>PALAM VARSHA</strong>
        <span>160624733239</span>
      </div>

      {/* Animated grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(60,255,181,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 1.2s ease",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Horizon glow */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(60,255,181,0.72), rgba(0,229,255,0.62), rgba(255,79,216,0.45), transparent)",
          boxShadow: "0 0 40px 2px rgba(60,255,181,0.22)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 1.5s ease 0.5s",
        }}
      />

      {/* Center content */}
      <div style={{ position: "relative", textAlign: "center", zIndex: 10 }}>

        {/* Scanning ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: "1px solid rgba(60,255,181,0.22)",
            boxShadow: "0 0 60px rgba(60,255,181,0.12), inset 0 0 60px rgba(0,229,255,0.05)",
            opacity: phase >= 2 ? 1 : 0,
            transition: "opacity 0.6s ease",
            animation: phase >= 2 ? "spin-ring 8s linear infinite" : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 320,
            height: 320,
            borderRadius: "50%",
            border: "1px solid rgba(255,79,216,0.16)",
            opacity: phase >= 2 ? 1 : 0,
            transition: "opacity 0.6s ease 0.2s",
            animation: phase >= 2 ? "spin-ring-rev 12s linear infinite" : "none",
          }}
        />

        {/* NEXUS logo */}
        <div
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 800,
            letterSpacing: "0.25em",
            color: glitch ? "#ff003c" : "#fff",
            textShadow: glitch
              ? "4px 0 #ff4fd8, -4px 0 #00e5ff"
              : "0 0 40px rgba(60,255,181,0.75), 0 0 80px rgba(0,229,255,0.35), 0 0 120px rgba(255,79,216,0.18)",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
            transition: "opacity 0.8s ease, transform 0.8s ease, color 0.05s, text-shadow 0.05s",
            clipPath: glitch ? "inset(10% 0 20% 0)" : "none",
            position: "relative",
          }}
        >
          NEXUS<span style={{ color: "#3cffb5" }}>AI</span>
        </div>

        {/* Divider line */}
        <div
          style={{
            margin: "12px auto",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #3cffb5, #00e5ff, #ff4fd8, transparent)",
            width: phase >= 3 ? "100%" : "0%",
            transition: "width 0.6s ease",
            boxShadow: "0 0 10px rgba(60,255,181,0.45)",
          }}
        />

        {/* Tagline typewriter */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
            letterSpacing: "0.35em",
            color: "#3cffb5",
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.4s ease",
            minHeight: "1.4em",
          }}
        >
          {tagline.slice(0, charIdx)}
          <span
            style={{
              display: "inline-block",
              width: "0.5em",
              height: "1em",
              background: "#3cffb5",
              marginLeft: 2,
              verticalAlign: "middle",
              animation: "blink 0.7s step-end infinite",
              opacity: charIdx < tagline.length ? 1 : 0,
            }}
          />
        </div>

        {/* Status line */}
        <div
          style={{
            marginTop: 32,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            color: "rgba(60,255,181,0.62)",
            letterSpacing: "0.2em",
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.6s ease 0.5s",
          }}
        >
          {phase >= 4 ? "> 5 AI AGENTS ONLINE" : "> INITIALIZING ORCHESTRATOR..."}
        </div>

        <div
          style={{
            margin: "20px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(52px, 1fr))",
            gap: 8,
            maxWidth: 520,
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.6s ease 0.7s",
          }}
        >
          {["HR", "SALES", "PM", "FIN", "ADMIN"].map((agent, index) => (
            <div
              key={agent}
              style={{
                border: "1px solid rgba(211,255,245,0.12)",
                background: "rgba(7,16,19,0.72)",
                color: index === 2 ? "#ff4fd8" : index === 3 ? "#ffd166" : "#3cffb5",
                padding: "8px 6px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.56rem",
                letterSpacing: "0.14em",
                boxShadow: "inset 0 0 18px rgba(0,229,255,0.04)",
              }}
            >
              {agent}
            </div>
          ))}
        </div>
      </div>

      {/* Corner HUD elements */}
      {[
        { top: 20, left: 20 },
        { top: 20, right: 20 },
        { bottom: 20, left: 20 },
        { bottom: 20, right: 20 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 40,
            height: 40,
            borderTop: i < 2 ? "1px solid rgba(60,255,181,0.46)" : "none",
            borderBottom: i >= 2 ? "1px solid rgba(0,229,255,0.42)" : "none",
            borderLeft: i % 2 === 0 ? "1px solid rgba(60,255,181,0.46)" : "none",
            borderRight: i % 2 === 1 ? "1px solid rgba(255,79,216,0.35)" : "none",
            opacity: phase >= 1 ? 1 : 0,
            transition: `opacity 0.6s ease ${0.2 * i}s`,
          }}
        />
      ))}

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes spin-ring {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes spin-ring-rev {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
