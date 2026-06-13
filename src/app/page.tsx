"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   CONFIG
   ============================================================ */

const STORY_LINES = [
  { text: "To my little sister, Hanen…", emphasis: true },
  { text: "For 20 years, you haven't just been my sister." },
  { text: "You've been my joy, my light, and my sweetest blessing." },
  { text: "Through every moment, you filled our home with laughter…" },
  { text: "…making even the ordinary days feel magical." },
  { text: "Thank you for being the heart of our family." },
  { text: "Happy 20th Birthday.\n— Your older brother, Ahmed", emphasis: true },
];

const CAKE_LAYERS = [
  { width: 200, depth: 18, body: 50, topColor: "#b86b8a", bodyColor: "#944e6e", borderColor: "#7a3d5a", delay: 0.3 },
  { width: 155, depth: 16, body: 44, topColor: "#d48aaa", bodyColor: "#b87090", borderColor: "#9a5878", delay: 0.8 },
  { width: 115, depth: 14, body: 38, topColor: "#e8a8c4", bodyColor: "#d490aa", borderColor: "#b87090", delay: 1.3 },
];

const CANDLE_COUNT = 20;
const CANDLE_COLORS = ["#f5a0c0", "#c8a0e8", "#ffb8d0", "#e0b0f0", "#f0c0d8", "#d8b0e8"];

/* Place 20 candles in concentric rings within the top layer radius */
function generateCandlePositions(): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const rings = [
    { count: 1, radius: 0 },
    { count: 7, radius: 15 },
    { count: 12, radius: 34 },
  ];
  rings.forEach((ring) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (Math.PI * 2 * i) / ring.count - Math.PI / 2;
      positions.push({
        x: Math.cos(angle) * ring.radius,
        y: Math.sin(angle) * ring.radius * 0.45,
      });
    }
  });
  return positions;
}

const CANDLE_POSITIONS = generateCandlePositions();
const CANDLE_HEIGHTS = Array.from({ length: CANDLE_COUNT }, () => 18 + Math.random() * 8);
const FLAME_DELAYS = Array.from({ length: CANDLE_COUNT }, () => Math.random() * 0.5);

/* ============================================================
   CONFETTI
   ============================================================ */
function launchConfetti() {
  const colors = ["#e8a0bf", "#f5b8d0", "#c8a0e8", "#d4a0c0", "#f0c0d8", "#fff0f5"];
  const pieces: HTMLDivElement[] = [];
  for (let i = 0; i < 100; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = `${Math.random() * 8 + 4}px`;
    el.style.height = `${Math.random() * 8 + 4}px`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.animationDuration = `${Math.random() * 2.5 + 2}s`;
    el.style.animationDelay = `${Math.random() * 1.5}s`;
    document.body.appendChild(el);
    pieces.push(el);
  }
  setTimeout(() => pieces.forEach((el) => el.remove()), 6000);
}

/* ============================================================
   COMPONENT: IntroOverlay
   ============================================================ */
function IntroOverlay({ onBegin }: { onBegin: () => void }) {
  return (
    <motion.div
      className="intro-overlay"
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-warm-soft text-sm tracking-[0.3em] uppercase"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        A letter for Hanen
      </motion.p>

      <motion.button
        className="begin-btn"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
        onClick={onBegin}
      >
        Click to Begin
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="text-muted text-xs tracking-widest"
      >
        🎧 best with headphones
      </motion.p>
    </motion.div>
  );
}

/* ============================================================
   COMPONENT: MusicToggle
   ============================================================ */
function MusicToggle({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  const bars = [
    { h: "10px", dur: "0.4s", del: "0s" },
    { h: "16px", dur: "0.35s", del: "0.1s" },
    { h: "8px", dur: "0.5s", del: "0.15s" },
    { h: "14px", dur: "0.45s", del: "0.05s" },
  ];

  return (
    <button onClick={onToggle} className="music-btn" aria-label="Toggle music">
      <span className="flex items-end gap-[2px] h-4">
        {bars.map((b, i) => (
          <span
            key={i}
            className={`eq-bar ${playing ? "playing" : ""}`}
            style={{
              height: playing ? undefined : "3px",
              "--h": b.h,
              "--dur": b.dur,
              "--del": b.del,
            } as React.CSSProperties}
          />
        ))}
      </span>
      <span>{playing ? "Playing" : "Paused"}</span>
    </button>
  );
}

/* ============================================================
   COMPONENT: StoryLine
   ============================================================ */
function StoryLine({
  text,
  emphasis,
  index,
}: {
  text: string;
  emphasis?: boolean;
  index: number;
}) {
  const isLast = index === STORY_LINES.length - 1;

  return (
    <div
      className="flex items-center justify-center px-6"
      style={{ minHeight: isLast ? "70vh" : "85vh" }}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)", y: 40 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        viewport={{ once: true, amount: 0.6 }}
        className="max-w-2xl text-center"
      >
        {isLast && (
          <div
            className="mx-auto mb-10"
            style={{
              width: 40,
              height: 1,
              background: "linear-gradient(90deg, transparent, #a89070, transparent)",
            }}
          />
        )}

        <p
          className={`story-serif ${
            emphasis
              ? "text-2xl sm:text-3xl md:text-4xl font-semibold italic text-warm"
              : "text-xl sm:text-2xl md:text-3xl font-normal text-foreground"
          }`}
          style={{
            whiteSpace: "pre-line",
            textShadow: emphasis
              ? "0 0 50px rgba(196, 168, 130, 0.12)"
              : undefined,
          }}
        >
          {text}
        </p>
      </motion.div>
    </div>
  );
}

/* ============================================================
   COMPONENT: CakeFinale (Fake-3D Isometric)
   ============================================================ */
function CakeFinale() {
  const cakeRef = useRef<HTMLDivElement>(null);
  const [showCandles, setShowCandles] = useState(false);
  const [candlesLanded, setCandlesLanded] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [cakeVisible, setCakeVisible] = useState(false);

  useEffect(() => {
    const el = cakeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCakeVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!cakeVisible) return;
    const t1 = setTimeout(() => setShowCandles(true), 2200);
    const t2 = setTimeout(
      () => setCandlesLanded(true),
      2200 + CANDLE_COUNT * 70 + 900
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [cakeVisible]);

  const handleBlow = useCallback(() => {
    if (!candlesBlown) {
      setCandlesBlown(true);
      launchConfetti();
    }
  }, [candlesBlown]);

  return (
    <section className="relative z-10 flex flex-col items-center justify-center py-32 px-4 min-h-screen">
      {/* Intro text */}
      <motion.p
        initial={{ opacity: 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true, amount: 0.5 }}
        className="story-serif italic text-xl sm:text-2xl text-warm text-center mb-24"
      >
        And now… make a wish 🕯️
      </motion.p>

      {/* Fake-3D Isometric Cake */}
      <div ref={cakeRef} className="cake-container">
        {/* Candle area — sits above the cake */}
        <div
          className="relative"
          style={{
            width: CAKE_LAYERS[CAKE_LAYERS.length - 1].width,
            height: 50,
            marginBottom: -4,
            zIndex: 10,
          }}
        >
          {showCandles &&
            CANDLE_POSITIONS.map((pos, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 0,
                  marginLeft: pos.x,
                }}
                initial={{ y: -500, opacity: 0 }}
                animate={{ y: pos.y, opacity: 1 }}
                transition={{
                  delay: i * 0.065,
                  type: "spring",
                  stiffness: 320,
                  damping: 18,
                  mass: 0.5,
                }}
              >
                <div
                  className="candle-stick"
                  style={{
                    height: CANDLE_HEIGHTS[i],
                    background: CANDLE_COLORS[i % CANDLE_COLORS.length],
                  }}
                >
                  {/* Flame — extinguishes when candlesBlown is true */}
                  <motion.div
                    className="flame"
                    style={{ animationDelay: `${FLAME_DELAYS[i]}s` }}
                    animate={
                      candlesBlown
                        ? { opacity: 0, scale: 0 }
                        : { opacity: 1, scale: 1 }
                    }
                    transition={
                      candlesBlown
                        ? { duration: 0.3, delay: i * 0.02 }
                        : { duration: 0 }
                    }
                  />
                </div>
              </motion.div>
            ))}
        </div>

        {/* Cake layers — top (smallest) to bottom (largest) */}
        {[...CAKE_LAYERS].reverse().map((layer, renderIdx) => {
          const i = CAKE_LAYERS.length - 1 - renderIdx;
          return (
            <motion.div
              key={i}
              className="cake-layer-iso"
              style={{
                width: layer.width,
                height: layer.body,
                background: `linear-gradient(180deg, ${layer.topColor} 0%, ${layer.bodyColor} 30%, ${layer.bodyColor} 100%)`,
                borderBottom: `${layer.depth}px solid ${layer.borderColor}`,
                marginTop: renderIdx === 0 ? 0 : -8,
                zIndex: CAKE_LAYERS.length - renderIdx,
                boxShadow: `
                  inset 0 8px 16px rgba(255,255,255,0.08),
                  inset 0 -4px 12px rgba(0,0,0,0.2),
                  0 ${layer.depth + 4}px ${layer.depth + 8}px rgba(0,0,0,0.4)
                `,
              }}
              initial={{ scaleX: 0.4, scaleY: 0, opacity: 0 }}
              animate={
                cakeVisible
                  ? { scaleX: 1, scaleY: 1, opacity: 1 }
                  : { scaleX: 0.4, scaleY: 0, opacity: 0 }
              }
              transition={{
                delay: layer.delay,
                duration: 0.7,
                ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
              }}
            />
          );
        })}

        {/* Cake plate */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={cakeVisible ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-[50%] mt-1"
          style={{
            width: 230,
            height: 12,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.1), rgba(255,255,255,0.03))",
          }}
        />
      </div>

      {/* Warm glow under cake */}
      <div
        className="mt-2 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{
          width: 240,
          height: 60,
          background:
            "radial-gradient(ellipse, rgba(255,217,102,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Blow candles button — hides after blown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={
          candlesLanded && !candlesBlown
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
        }
        transition={{ duration: 1, delay: candlesLanded && !candlesBlown ? 0.6 : 0 }}
        className="mt-14"
      >
        <button
          onClick={handleBlow}
          disabled={candlesBlown}
          className="blow-btn"
        >
          Blow the Candles 🕯️
        </button>
      </motion.div>

      {/* Final message after blowing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={candlesBlown ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 2, delay: 1 }}
        className="mt-16 text-center"
      >
        <p className="story-serif italic text-xl sm:text-2xl text-warm mb-4">
          ✨ Wish Granted ✨
        </p>
        <p className="story-serif italic text-xl sm:text-2xl text-warm mb-8">
          Here&apos;s to another amazing year, little sis. ❤️
        </p>
        <p className="text-muted text-xs tracking-[0.2em] uppercase mt-8">
          Made with love by Ahmed
        </p>
      </motion.div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleBegin = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(() => {});
      setPlaying(true);
    }
    setStarted(true);
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  /* Hide scroll hint after user scrolls past 200px */
  const [scrollHintVisible, setScrollHintVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 200) setScrollHintVisible(false);
      else setScrollHintVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative">
      <audio ref={audioRef} src="/music/background.mp3" loop preload="auto" />

      <AnimatePresence>
        {!started && <IntroOverlay onBegin={handleBegin} />}
      </AnimatePresence>

      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 50%, rgba(212,160,192,0.025) 0%, transparent 70%)",
        }}
      />

      {started && <MusicToggle playing={playing} onToggle={toggleMusic} />}

      {/* Scroll-down hint */}
      <AnimatePresence>
        {started && scrollHintVisible && (
          <motion.div
            className="scroll-hint"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <span className="scroll-hint-arrow">&#8964;</span>
            <span>Scroll down to see more</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10">
        <div style={{ height: "40vh" }} />
        {STORY_LINES.map((line, i) => (
          <StoryLine
            key={i}
            text={line.text}
            emphasis={line.emphasis}
            index={i}
          />
        ))}
      </section>

      <CakeFinale />
    </main>
  );
}
