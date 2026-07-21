import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, Points, PointMaterial } from "@react-three/drei";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowRight, Bell, Box, ChevronDown, Command, FileText, Grid2X2, Layers3, MoreHorizontal, Plus, Search, Settings2, Share2, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

function SignalObject() {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const points = new Float32Array(1200 * 3);
    for (let i = 0; i < points.length; i += 3) {
      const radius = 2.3 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4;
      points[i] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.65;
      points[i + 1] = height;
      points[i + 2] = Math.sin(angle) * radius;
    }
    return points;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.getElapsedTime() * 0.12 + pointer.x * 0.23;
    group.current.rotation.x = pointer.y * 0.13;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.35} floatIntensity={0.45}>
        <Icosahedron args={[1.76, 2]}>
          <meshBasicMaterial color="#7d6cf3" wireframe transparent opacity={0.42} />
        </Icosahedron>
        <Icosahedron args={[1.34, 1]}>
          <meshBasicMaterial color="#31d4ff" wireframe transparent opacity={0.18} />
        </Icosahedron>
      </Float>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#92edff" size={0.024} sizeAttenuation depthWrite={false} opacity={0.74} />
      </Points>
    </group>
  );
}

function HeroScene() {
  return <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={[1, 1.5]}><SignalObject /></Canvas>;
}

const stages = [
  { id: "01", title: "Ingest", note: "Raw signal", copy: "Pull fragmented sources into a single, living context layer.", icon: Layers3 },
  { id: "02", title: "Analyze", note: "Structured intelligence", copy: "Map relationships, detect change, and expose what matters now.", icon: Sparkles },
  { id: "03", title: "Generate", note: "Actionable output", copy: "Turn decisions into precisely scoped work — already in motion.", icon: WandSparkles },
];

function FlowVisual({ active }: { active: number }) {
  const paths = [
    "M0 83 C24 83 25 32 47 47 S66 124 90 86 S113 28 142 64 S170 118 192 76 S222 32 240 84 S266 126 291 62 S324 26 350 78 S379 116 400 50",
    "M0 92 H55 V45 H110 V112 H166 V26 H222 V82 H279 V51 H337 V102 H400",
    "M0 86 H298 L265 53 M298 86 L265 119",
  ];
  return (
    <svg viewBox="0 0 400 150" className="h-32 w-full overflow-visible" fill="none">
      {[0, 1, 2].map((i) => <motion.path key={i} d={paths[i]} stroke={i === active ? "url(#signal)" : "#2b2f3a"} strokeWidth={i === active ? 3 : 1} initial={false} animate={{ opacity: i === active ? 1 : 0.12 }} transition={{ duration: 0.55 }} />)}
      <defs><linearGradient id="signal" x1="0" x2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#7567ee"/><stop offset="1" stopColor="#25d8ff"/></linearGradient></defs>
    </svg>
  );
}

function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Research", "Automations"];
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-mark"><span /><span /><span /></div>
        <div className="side-icons"><Grid2X2 /><FileText /><Layers3 /><Box /></div>
        <div className="side-icons bottom"><Settings2 /></div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="crumb"><span>Workspace</span><ChevronDown size={13}/><b>Product intelligence</b></div>
          <div className="top-actions"><button><Search size={15}/><span>Search</span><kbd>⌘ K</kbd></button><button className="avatar">NM</button></div>
        </header>
        <main className="dashboard-content">
          <div className="dashboard-title"><div><span className="eyebrow">SIGNAL ROOM</span><h3>Product intelligence</h3><p>Live context for your next decision.</p></div><button className="new-button"><Plus size={15}/> New brief</button></div>
          <div className="dashboard-tabs">{tabs.map((item) => <button onClick={() => setTab(item)} className={tab === item ? "active" : ""} key={item}>{item}</button>)}</div>
          <motion.div key={tab} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="dashboard-grid">
            <section className="panel signal-panel"><div className="panel-heading"><div><span>DECISION SIGNAL</span><h4>{tab === "Overview" ? "Confidence is compounding" : tab === "Research" ? "Evidence is connected" : "Flows are ready to run"}</h4></div><MoreHorizontal size={18}/></div><div className="stat-line"><strong>{tab === "Automations" ? "12" : "87"}<small>{tab === "Automations" ? " active paths" : "% decision confidence"}</small></strong><em>+18.4%</em></div><div className="chart"><i/><i/><i/><i/><i/><i/><svg viewBox="0 0 530 130" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#796bf1" stopOpacity=".35"/><stop offset="1" stopColor="#796bf1" stopOpacity="0"/></linearGradient></defs><path d="M0 112 C30 104 35 90 63 94 S95 102 120 70 S156 92 183 68 S211 80 241 43 S274 56 302 37 S335 57 359 45 S394 59 417 27 S449 47 475 18 S502 33 530 7 L530 130 L0 130Z" fill="url(#chartFill)"/><path d="M0 112 C30 104 35 90 63 94 S95 102 120 70 S156 92 183 68 S211 80 241 43 S274 56 302 37 S335 57 359 45 S394 59 417 27 S449 47 475 18 S502 33 530 7" stroke="#80e9ff" strokeWidth="2" fill="none"/></svg></div></section>
            <section className="panel pulse-panel"><div className="panel-heading"><div><span>ACTIVITY PULSE</span><h4>Signals moving now</h4></div><button><MoreHorizontal size={18}/></button></div>{[["Buyer research", "12 sources merged", "now"], ["Launch narrative", "Brief generated", "8m"], ["Risk monitor", "3 changes detected", "24m"]].map(([name, detail, time], i) => <div className="activity" key={name}><div className={`activity-dot d${i}`}/><div><b>{name}</b><small>{detail}</small></div><time>{time}</time></div>)}</section>
            <section className="panel source-panel"><div className="panel-heading"><div><span>CONNECTED CONTEXT</span><h4>Sources</h4></div><button className="soft-button">View all</button></div>{["Product feedback", "Customer calls", "Competitive intel"].map((source, i) => <div className="source" key={source}><div className={`source-icon s${i}`}>{i === 0 ? "▦" : i === 1 ? "◌" : "◇"}</div><span>{source}</span><small>{[248, 34, 17][i]} items</small><ArrowRight size={14}/></div>)}</section>
            <section className="panel brief-panel"><div className="brief-symbol"><Sparkles size={16}/></div><span>NEXT BEST ACTION</span><h4>Shape the launch message around <mark>time-to-value</mark>.</h4><p>Evidence shows this is the clearest differentiator in high-intent calls.</p><button>Open generated brief <ArrowDownRight size={15}/></button></section>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeStage, setActiveStage] = useState(0);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { damping: 26, stiffness: 180 });
  const springY = useSpring(cursorY, { damping: 26, stiffness: 180 });
  const { scrollYProgress } = useScroll();
  const orbScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to(".hero-scene", { y: 90, opacity: 0.32, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.fromTo(".flow-canvas", { opacity: 0.35, x: 50 }, { opacity: 1, x: 0, scrollTrigger: { trigger: ".flow-section", start: "top 70%", end: "center 55%", scrub: true } });
    }, page);
    return () => context.revert();
  }, []);

  return (
    <div ref={page} className="xai-page" onMouseMove={(e) => { cursorX.set(e.clientX); cursorY.set(e.clientY); }}>
      <motion.div className="cursor-glow" style={{ left: springX, top: springY }} />
      <header className="site-header"><button className="wordmark" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="logo-x">x</span><span>ai</span></button><nav><button onClick={() => document.getElementById("flow")?.scrollIntoView({ behavior: "smooth" })}>Platform</button><button onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}>Workspace</button><button onClick={() => document.getElementById("flow")?.scrollIntoView({ behavior: "smooth" })}>Changelog</button></nav><button className="header-cta" onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}>Enter Xai <ArrowRight size={15}/></button></header>

      <main>
        <section className="hero">
          <div className="hero-grid" />
          <motion.div className="hero-copy" style={{ scale: orbScale }}><motion.div className="announcement" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><span className="live-dot"/> INTELLIGENCE, IN MOTION <ArrowRight size={13}/></motion.div><h1>See the signal.<br/><em>Move with certainty.</em></h1><p>Xai turns the constant noise of your business into a living intelligence system — context that thinks ahead, so your team can too.</p><div className="hero-buttons"><button className="primary-button" onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}>Explore the workspace <ArrowDownRight size={16}/></button><button className="text-button" onClick={() => document.getElementById("flow")?.scrollIntoView({ behavior: "smooth" })}>See how it works <ArrowRight size={16}/></button></div></motion.div>
          <div className="hero-scene"><HeroScene /></div>
          <div className="hero-bottom"><span>SCROLL TO COMPOSE THE SIGNAL</span><div className="scroll-line"><i/></div><span>01 — 03</span></div>
        </section>

        <section id="flow" className="flow-section"><div className="section-intro"><span className="eyebrow">THE INTELLIGENCE ENGINE</span><h2>Chaos enters.<br/>Clarity leaves.</h2><p>One continuous system that transforms raw inputs into clear, compounding decisions.</p></div><div className="flow-layout"><div className="flow-stages">{stages.map((stage, index) => { const Icon = stage.icon; return <button key={stage.id} className={activeStage === index ? "flow-stage active" : "flow-stage"} onMouseEnter={() => setActiveStage(index)} onFocus={() => setActiveStage(index)} onClick={() => setActiveStage(index)}><span className="stage-number">{stage.id}</span><div><span className="stage-note">{stage.note}</span><h3>{stage.title}<Icon size={19}/></h3><p>{stage.copy}</p></div></button>; })}</div><div className="flow-canvas"><div className="flow-orb"><FlowVisual active={activeStage}/><span>{stages[activeStage].note}</span></div><div className="flow-metrics"><div><b>32</b><span>sources<br/>connected</span></div><div><b>4.8×</b><span>faster to<br/>insight</span></div></div></div></div></section>

        <section id="workspace" className="workspace-section"><div className="workspace-header"><div><span className="eyebrow">THE XAI WORKSPACE</span><h2>Where every signal<br/>finds its next move.</h2></div><p>A calm, exacting place for the work that changes what happens next.</p></div><motion.div initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.8 }}><Dashboard /></motion.div></section>

        <section className="closing-section"><div className="closing-grain"/><span className="eyebrow">INTELLIGENCE, COMPOSED</span><h2>The next move<br/>is already visible.</h2><button className="primary-button">Build with Xai <ArrowRight size={16}/></button></section>
      </main>
      <footer><div className="wordmark"><span className="logo-x">x</span><span>ai</span></div><span>© 2025 Xai Systems</span><span>Designed for decisive teams.</span></footer>
    </div>
  );
}
