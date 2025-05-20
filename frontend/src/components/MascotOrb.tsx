import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

// Orb mascot colors
const ORB_COLOR = "#7C3AED";
const ORB_GRADIENT = "url(#orbGradient)";
const EYE_COLOR = "#fff";
const EYE_RING = "#a78bfa";

// Fun facts for the orb to say
const FACTS = [
  "We've helped companies save 10,000+ hours in hiring!",
  "Over 50,000 interviews conducted on our platform.",
  "Trusted by Fortune 500s and fast-growing startups.",
  "AI-powered insights for smarter hiring decisions.",
  "Global reach: 100+ countries, 24/7 uptime.",
  "Seamless integrations with your favorite tools.",
  "Our clients report 2x faster time-to-hire!",
  "Dedicated support, always here for you.",
];

// SVG path for orb to follow (normalized to viewport)
// This is a cubic Bezier from bottom right, up left, then right, then left again
const PATH = [
  { x: 0.85, y: 0.85 }, // start (bottom right)
  { x: 0.15, y: 0.6 },  // control 1
  { x: 0.85, y: 0.3 },  // control 2
  { x: 0.15, y: 0.15 }, // end (top left)
];

type Point = { x: number; y: number };
function getCubicBezierXYatT(start: Point, c1: Point, c2: Point, end: Point, t: number) {
  // Returns {x, y} for t in [0,1] along cubic Bezier
  const x =
    Math.pow(1 - t, 3) * start.x +
    3 * Math.pow(1 - t, 2) * t * c1.x +
    3 * (1 - t) * Math.pow(t, 2) * c2.x +
    Math.pow(t, 3) * end.x;
  const y =
    Math.pow(1 - t, 3) * start.y +
    3 * Math.pow(1 - t, 2) * t * c1.y +
    3 * (1 - t) * Math.pow(t, 2) * c2.y +
    Math.pow(t, 3) * end.y;
  return { x, y };
}

const MascotOrb: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [fact, setFact] = useState<string | null>(null);
  const [scrollT, setScrollT] = useState(0); // scroll progress [0,1]
  const controls = useAnimation();
  const factTimeout = useRef<NodeJS.Timeout | null>(null);

  // Track mouse position (normalized to [0,1])
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMouse({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blink every 3-6 seconds
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  // Wave on click or hover
  useEffect(() => {
    if (hovered) {
      controls.start({ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.7, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" } });
    }
  }, [hovered, controls]);

  // Eye position (centered, moves with mouse, more dramatic)
  const eyeOffsetX = (mouse.x - 0.5) * 32;
  const eyeOffsetY = (mouse.y - 0.5) * 32;

  // Scroll progress [0,1]
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const t = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      setScrollT(t);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Orb position along path
  const { x, y } = getCubicBezierXYatT(PATH[0], PATH[1], PATH[2], PATH[3], scrollT);
  const orbX = `calc(${x * 100}% - 45px)`;
  const orbY = `calc(${y * 100}% - 45px)`;

  // Show random fact on click
  const showFact = () => {
    const newFact = FACTS[Math.floor(Math.random() * FACTS.length)];
    setFact(newFact);
    if (factTimeout.current) clearTimeout(factTimeout.current);
    factTimeout.current = setTimeout(() => setFact(null), 3500);
    controls.start({ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.7, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" } });
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        left: orbX,
        top: orbY,
        zIndex: 50,
        width: 90,
        height: 90,
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none",
        transition: "left 0.7s cubic-bezier(.4,1,.4,1), top 0.7s cubic-bezier(.4,1,.4,1)",
      }}
      animate={controls}
      initial={{ rotate: 0 }}
      whileTap={{ scale: 1.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={showFact}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
    >
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        <defs>
          <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor={ORB_COLOR} />
          </radialGradient>
        </defs>
        {/* Orb body */}
        <circle cx="45" cy="45" r="40" fill={ORB_GRADIENT} stroke="#fff" strokeWidth="2" filter="url(#orbShadow)" />
        {/* Eye ring */}
        <ellipse cx={45 + eyeOffsetX * 0.5} cy={45 + eyeOffsetY * 0.5} rx="13" ry="13" fill="none" stroke={EYE_RING} strokeWidth="2" />
        {/* Eye white */}
        <ellipse cx={45 + eyeOffsetX} cy={45 + eyeOffsetY} rx="8" ry={blinking ? 2 : 8} fill={EYE_COLOR} />
        {/* Eye pupil */}
        <ellipse cx={45 + eyeOffsetX} cy={45 + eyeOffsetY} rx="3.5" ry={blinking ? 1 : 3.5} fill={ORB_COLOR} />
        {/* Cute smile */}
        <path d="M38 58 Q45 64 52 58" stroke="#fff" strokeWidth="2" fill="none" />
        {/* Glow */}
        <ellipse cx="38" cy="38" rx="7" ry="4" fill="#fff" opacity="0.18" />
        {/* Shadow filter */}
        <filter id="orbShadow" x="0" y="0" width="90" height="90">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#a78bfa" floodOpacity="0.25" />
        </filter>
      </svg>
      <AnimatePresence>
        {fact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "110%",
              transform: "translateX(-50%)",
              background: "#fff",
              color: "#5B21B6",
              borderRadius: 16,
              boxShadow: "0 4px 24px 0 #a78bfa33",
              padding: "16px 20px",
              fontWeight: 500,
              fontSize: 15,
              minWidth: 180,
              maxWidth: 260,
              zIndex: 100,
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            {fact}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MascotOrb; 