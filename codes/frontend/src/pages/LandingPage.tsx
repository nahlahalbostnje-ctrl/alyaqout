import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, AnimatePresence,
  useInView, useScroll, useMotionValue, useSpring, useTransform,
} from 'framer-motion';
import api from '../services/axios';
import { useLenis } from '../hooks/useLenis';

/* ── Types ─────────────────────────────────── */
interface Country    { id: number; name: string; }
interface Faq        { id: number; question: string; answer: string; }
interface SocialLink { id: number; platform: string; url: string; }
interface Banner     { id: number; title?: string; image_url: string; link_url?: string; }

/* ── Constants ──────────────────────────────── */
const SUBJECTS = ['رياضيات','علوم','لغة عربية','لغة إنجليزية','فيزياء','كيمياء','أحياء','تاريخ','جغرافيا','تربية إسلامية'];

const FEATURES = [
  { icon: '📡', title: 'حصص مباشرة تفاعلية',  desc: 'تعلّم مع أفضل المعلمين في بث مباشر احترافي مع إمكانية التفاعل الفوري وطرح الأسئلة' },
  { icon: '🤖', title: 'بوت ذكي مساعد',        desc: 'مساعد ذكاء اصطناعي يجيب على أسئلتك الدراسية في أي وقت دون انتظار أو تأخير' },
  { icon: '📊', title: 'تتبع التقدم الدراسي',   desc: 'تقارير تفصيلية لولي الأمر والطالب تُظهر مستوى التحسن والإنجاز بشكل دوري' },
  { icon: '🏆', title: 'دوري ياقوت',            desc: 'نظام نقاط ومسابقات بين الطلاب يحفّز على التعلم ويكافئ الإنجاز بمكافآت حقيقية' },
];

const STEPS = [
  { num: '01', title: 'احجز مكانك',   desc: 'أرسل بياناتك عبر نموذج التسجيل البسيط في دقيقة واحدة' },
  { num: '02', title: 'تواصل معنا',   desc: 'يتواصل فريقنا معك لتحديد المستوى والمادة والموعد المناسب' },
  { num: '03', title: 'ابدأ التعلّم',  desc: 'انضم لفصلك المباشر واستمتع بتجربة تعلّم عالمية المستوى' },
];

const STATIC_FAQS: Faq[] = [
  { id: 1, question: 'ما هي المواد الدراسية المتاحة؟',          answer: 'تغطي منصة ياقوت جميع المواد الأساسية: الرياضيات، العلوم، اللغة العربية، الإنجليزية، الفيزياء، الكيمياء، الأحياء وغيرها لجميع المراحل الدراسية.' },
  { id: 2, question: 'كيف تعمل الحصة المباشرة؟',               answer: 'تُعقد الحصة عبر منصة ياقوت مباشرةً في المتصفح أو التطبيق، مع إمكانية التفاعل مع المعلم والزملاء في الوقت الفعلي بجودة عالية.' },
  { id: 3, question: 'هل يمكن لولي الأمر متابعة أداء الطالب؟', answer: 'نعم، يتلقى ولي الأمر تقارير دورية عبر واتساب وتطبيق ياقوت تشمل: نسبة الحضور، درجات الامتحانات، ومستوى حل الواجبات.' },
  { id: 4, question: 'ما هو نظام النقاط ودوري ياقوت؟',         answer: 'يكسب الطالب نقاطاً مقابل الحضور وحل الواجبات والامتحانات، ويتنافس في دوري ياقوت للحصول على مكافآت وجوائز قيّمة.' },
];

const STATS = [
  { value: 500, suffix: '+', label: 'طالب مسجّل' },
  { value: 50,  suffix: '+', label: 'معلم محترف'  },
  { value: 10,  suffix: '+', label: 'دولة عربية'  },
  { value: 98,  suffix: '%', label: 'رضا الطلاب'  },
];

const TYPEWRITER_WORDS = ['بطريقة تفاعلية', 'مع أفضل المعلمين', 'في كل مكان', 'للنجاح والتميز'];

/* ── Easings ─────────────────────────────────── */
const SP  = [0.16, 1, 0.3, 1]      as const;
const POP = [0.34, 1.56, 0.64, 1]  as const;

/* ── Motion variants ─────────────────────────── */
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
};
const cardItem = {
  hidden:  { opacity: 0, y: 36, scale: 0.93 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.7, ease: SP } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.8, ease: SP } },
};
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════ */

/* Scroll progress bar */
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="progress-bar-glow fixed top-0 left-0 right-0 z-[9999] origin-left"
      style={{
        height: 2,
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg,#d4860e,#f5a623,#ffd166,#f5a623,#d4860e)',
        backgroundSize: '200% auto',
      }}
    />
  );
}

/* Film-grain noise overlay */
function NoiseOverlay() {
  return (
    <div className="noise-overlay fixed inset-0 z-[9993] pointer-events-none" style={{ opacity: 0.032 }} />
  );
}

/* Dramatic page loader */
function PageLoader() {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 1600); return () => clearTimeout(t); }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: '#040a18' }}
          exit={{ opacity: 0, transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}>

          {/* outer pulse rings */}
          {[1, 1.7, 2.5].map((s, i) => (
            <div key={i} className="absolute rounded-full pointer-events-none"
              style={{
                width: 140, height: 140,
                border: `1px solid rgba(245,166,35,${0.35 - i * 0.08})`,
                animation: `yq-pulse-ring ${1.6 + i * 0.4}s ease-out ${i * 0.3}s infinite`,
                transform: `scale(${s})`,
              }} />
          ))}

          <motion.div className="relative z-10 flex flex-col items-center gap-5"
            initial={{ scale: 0.35, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: 0, transition: { duration: 0.8, ease: POP } }}
            exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.4 } }}>
            <img src="/logo.png" alt="ياقوت" className="w-24 h-24 object-contain"
              style={{ filter: 'drop-shadow(0 0 60px rgba(245,166,35,0.8)) drop-shadow(0 0 15px rgba(245,166,35,1))' }} />
            <p className="t-label" style={{ color: 'rgba(245,166,35,0.55)', letterSpacing: '0.35em' }}>
              منصة الياقوت
            </p>
          </motion.div>

          {/* loading track */}
          <div className="absolute bottom-14 w-44 overflow-hidden"
            style={{ height: 1.5, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
            <motion.div className="h-full"
              style={{ background: 'linear-gradient(90deg,#f5a623,#ffd166)', borderRadius: 99 }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1, transition: { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] } }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Custom cursor */
function CustomCursor() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(mx, { stiffness: 280, damping: 22 });
  const ry = useSpring(my, { stiffness: 280, damping: 22 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(!!(el.closest('a,button,[role="button"],.tilt-card')));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, [mx, my]);

  const dotSize = useSpring(hovered ? 6 : 8, { stiffness: 320, damping: 24 });
  const ringSize = useSpring(hovered ? 48 : 36, { stiffness: 260, damping: 22 });
  const ringOpacity = useSpring(hovered ? 0.8 : 0.4, { stiffness: 300, damping: 24 });

  return (
    <>
      <motion.div className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          x: mx, y: my,
          translateX: '-50%', translateY: '-50%',
          width: dotSize, height: dotSize,
          background: hovered ? '#ffd166' : '#f5a623',
          boxShadow: '0 0 10px rgba(245,166,35,0.9)',
        }} />
      <motion.div className="fixed top-0 left-0 z-[9997] pointer-events-none rounded-full"
        style={{
          x: rx, y: ry,
          translateX: '-50%', translateY: '-50%',
          width: ringSize, height: ringSize,
          border: '1.5px solid rgba(245,166,35,0.55)',
          opacity: ringOpacity,
        }} />
    </>
  );
}

/* Canvas particle system */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const N = Math.min(90, Math.floor(window.innerWidth / 14));
    interface P { x: number; y: number; vx: number; vy: number; r: number; a: number; }
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.5 + 0.15,
    }));

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        const dx = mouse.current.x - p.x, dy = mouse.current.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 240) { p.vx += dx * 0.00007; p.vy += dy * 0.00007; }
        p.vx *= 0.992; p.vy *= 0.992;
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,166,35,${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(245,166,35,${0.13 * (1 - d / 100)})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 z-[2] pointer-events-none" />;
}

/* 3D Tilt card with inner cursor glow */
function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const xVal = useMotionValue(0);
  const yVal = useMotionValue(0);
  const rotX = useTransform(yVal, [-0.5, 0.5], [7, -7]);
  const rotY = useTransform(xVal, [-0.5, 0.5], [-7, 7]);
  const spr  = { stiffness: 200, damping: 18 };
  const srX  = useSpring(rotX, spr);
  const srY  = useSpring(rotY, spr);
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top)  / r.height;
    xVal.set(nx - 0.5);
    yVal.set(ny - 0.5);
    setGlow({ x: nx * 100, y: ny * 100 });
  };

  const onLeave = () => { xVal.set(0); yVal.set(0); setGlow({ x: 50, y: 50 }); setActive(false); };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card relative ${className}`}
      style={{ rotateX: srX, rotateY: srY, transformPerspective: 1000 }}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={onLeave}>

      {/* inner cursor glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-350"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(245,166,35,0.18), transparent 55%)`,
          transition: 'opacity 0.3s ease',
        }} />

      {/* gold border reveal */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-350"
        style={{
          opacity: active ? 1 : 0,
          border: '1px solid rgba(245,166,35,0.45)',
          boxShadow: '0 0 44px rgba(245,166,35,0.07), inset 0 0 44px rgba(245,166,35,0.035)',
          transition: 'opacity 0.3s ease',
        }} />

      {children}
    </motion.div>
  );
}

/* Magnetic button */
function MagBtn({ children, className = '', style = {}, onClick }: {
  children: ReactNode; className?: string;
  style?: CSSProperties; onClick?: () => void;
}) {
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sx = useSpring(bx, { stiffness: 180, damping: 14 });
  const sy = useSpring(by, { stiffness: 180, damping: 14 });
  return (
    <motion.div style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        bx.set((e.clientX - r.left - r.width  / 2) * 0.28);
        by.set((e.clientY - r.top  - r.height / 2) * 0.28);
      }}
      onMouseLeave={() => { bx.set(0); by.set(0); }}>
      <button className={className} style={style} onClick={onClick}>{children}</button>
    </motion.div>
  );
}

/* Animated counter */
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const dur = 2200;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3.5);
      setN(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* Word-by-word blur+fade reveal */
function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.7, ease: SP, delay: delay + i * 0.1 }}
          style={{ display: 'inline-block', marginInlineEnd: '0.28em' }}>
          {w}
        </motion.span>
      ))}
    </span>
  );
}

/* Typewriter hook */
function useTypewriter(words: string[], speed = 85, pause = 2600) {
  const [text, setText] = useState('');
  const [idx,  setIdx]  = useState(0);
  const [del,  setDel]  = useState(false);
  const waiting = useRef(false);
  useEffect(() => {
    if (waiting.current) return;
    const cur = words[idx % words.length];
    const t = setTimeout(() => {
      if (!del) {
        const n = cur.slice(0, text.length + 1);
        setText(n);
        if (n === cur) { waiting.current = true; setTimeout(() => { waiting.current = false; setDel(true); }, pause); }
      } else {
        const n = cur.slice(0, text.length - 1);
        setText(n);
        if (!n) { setDel(false); setIdx(i => i + 1); }
      }
    }, del ? speed * 0.45 : speed);
    return () => clearTimeout(t);
  }, [text, del, idx, words, speed, pause]);
  return text;
}

/* Glowing divider */
function GlowDivider() {
  return <div className="glow-divider mx-auto" style={{ width: '80%', maxWidth: 700 }} />;
}

/* ── Single orbiting dot ─── */
function OrbitDot({ index, total, radius }: { index: number; total: number; radius: number }) {
  const startDeg = (index / total) * 360;
  const size     = index % 2 === 0 ? 5 : 3.5;
  const color    = index % 3 === 0 ? '#ffd166' : '#f5a623';
  const dur      = 5.5 + index * 0.55;
  const neg      = -index * 0.5;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `rotate(${startDeg}deg)`,
      animation: `yq-spin-slow ${dur}s linear ${neg}s infinite`,
    }}>
      <div style={{
        position: 'absolute',
        left: `calc(50% + ${radius}px)`,
        top: '50%',
        width: size, height: size,
        transform: 'translate(-50%,-50%)',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 9px ${color}cc, 0 0 4px ${color}`,
        animation: `yq-spin-slow ${dur}s linear ${neg}s infinite reverse`,
      }} />
    </div>
  );
}

/* ── Logo hero — orbit ring + particles + halo + hover burst ─── */
function LogoHero() {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: 220, height: 220 }}
      initial={{ scale: 0.22, opacity: 0, rotate: -22 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease: POP, delay: 1.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}>

      {/* Sun halo */}
      <div className="logo-halo absolute inset-0" />

      {/* Pulse rings */}
      {[1, 1.65, 2.35].map((scale, i) => (
        <div key={i} className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(245,166,35,0.26)',
            animation: `yq-pulse-ring ${2 + i * 0.6}s ease-out ${i * 0.48}s infinite`,
            transform: `scale(${scale})`,
          }} />
      ))}

      {/* Orbit ring */}
      <div className="logo-orbit-ring absolute" style={{ inset: '-24%', width: '148%', height: '148%' }} />

      {/* Orbit dots */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <OrbitDot key={i} index={i} total={8} radius={82} />
      ))}

      {/* Logo image */}
      <motion.img
        src="/logo.png" alt="ياقوت"
        className="relative z-10 object-contain select-none"
        style={{
          width: 215, height: 215,
          filter: hovered
            ? 'drop-shadow(0 0 95px rgba(245,166,35,1)) drop-shadow(0 0 38px rgba(255,209,102,1))'
            : 'drop-shadow(0 0 58px rgba(245,166,35,0.72)) drop-shadow(0 0 16px rgba(245,166,35,0.95))',
          transition: 'filter 0.4s ease',
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      />

      {/* Hover burst */}
      <AnimatePresence>
        {hovered && (
          <motion.div className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 0.5, opacity: 0.85 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.5) 0%, transparent 65%)' }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Shooting stars ─── */
function ShootingStars() {
  const stars = [
    { top: '10%', left: '5%',  delay: 0.5,  dur: 0.85, w: 150, angle: -18 },
    { top: '25%', left: '52%', delay: 4,    dur: 0.72, w: 110, angle: -22 },
    { top: '7%',  left: '28%', delay: 8,    dur: 1.0,  w: 190, angle: -15 },
    { top: '42%', left: '62%', delay: 12,   dur: 0.78, w: 125, angle: -20 },
    { top: '16%', left: '75%', delay: 6.5,  dur: 0.9,  w: 95,  angle: -26 },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', top: s.top, left: s.left,
            height: 1.5, width: s.w, borderRadius: 99,
            background: 'linear-gradient(90deg,transparent 0%,rgba(255,209,102,0.85) 55%,#f5a623 80%,transparent 100%)',
            rotate: s.angle, zIndex: 3, pointerEvents: 'none',
          }}
          initial={{ x: '-130%', opacity: 0 }}
          animate={{ x: '340%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: s.dur, repeat: Infinity, repeatDelay: 7 + s.delay, ease: [0.2,0,0.8,1], delay: s.delay }} />
      ))}
    </>
  );
}

/* ── Badge with animated stars + shimmer ─── */
function StarBadge() {
  return (
    <motion.div
      className="badge-hero"
      initial={{ opacity: 0, y: 22, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.78, ease: POP, delay: 1.62 }}>
      {/* shimmer sweep */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg,transparent,rgba(245,166,35,0.32),transparent)',
          width: '50%',
        }}
        animate={{ x: ['-130%', '300%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }} />
      {[0,1].map(i => (
        <motion.span key={i} style={{ color: '#ffd166', fontSize: 9, position: 'relative', zIndex: 1 }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}>✦</motion.span>
      ))}
      <span style={{ position: 'relative', zIndex: 1 }}>منصة التعليم الأولى عربياً</span>
      {[0,1].map(i => (
        <motion.span key={i} style={{ color: '#ffd166', fontSize: 9, position: 'relative', zIndex: 1 }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: 0.85 + i * 0.6, ease: 'easeInOut' }}>✦</motion.span>
      ))}
    </motion.div>
  );
}

/* ── Magnetic button with ripple on click ─── */
function RippleBtn({ children, className = '', style = {}, onClick, variant = 'primary' }: {
  children: ReactNode; className?: string; style?: CSSProperties;
  onClick?: () => void; variant?: 'primary' | 'ghost';
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref  = useRef<HTMLDivElement>(null);
  const bx   = useMotionValue(0);
  const by   = useMotionValue(0);
  const sx   = useSpring(bx, { stiffness: 180, damping: 14 });
  const sy   = useSpring(by, { stiffness: 180, damping: 14 });

  const addRipple = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 800);
    onClick?.();
  };

  return (
    <motion.div ref={ref}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        bx.set((e.clientX - r.left - r.width  / 2) * 0.3);
        by.set((e.clientY - r.top  - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => { bx.set(0); by.set(0); }}>
      <button className={`${className} relative overflow-hidden`} style={style} onClick={addRipple}>
        {children}
        {ripples.map(r => (
          <motion.span key={r.id}
            style={{
              position: 'absolute', left: r.x, top: r.y, pointerEvents: 'none', zIndex: 20,
              width: 0, height: 0, borderRadius: '50%',
              transform: 'translate(-50%,-50%)',
              background: variant === 'primary' ? 'rgba(255,255,255,0.4)' : 'rgba(245,166,35,0.4)',
            }}
            animate={{ width: 420, height: 420, opacity: [0.75, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }} />
        ))}
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function LandingPage() {
  useLenis();

  const [countries, setCountries] = useState<Country[]>([]);
  const [faqs,      setFaqs]      = useState<Faq[]>([]);
  const [social,    setSocial]    = useState<SocialLink[]>([]);
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [source,    setSource]    = useState<'book_now' | 'free_class'>('book_now');
  const [submitting,setSubmitting]= useState(false);
  const [success,   setSuccess]   = useState('');
  const [scrolled,  setScrolled]  = useState(false);
  const [form, setForm] = useState({
    country_id: '', student_name: '', phone: '', school: '', region: '', subjects: [] as string[],
  });

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '22%']);

  useEffect(() => {
    api.get('/public/countries').then(({ data }) => setCountries(data.countries ?? [])).catch(() => {});
    api.get('/public/faqs').then(({ data })     => setFaqs(data.faqs ?? [])).catch(() => {});
    api.get('/public/social').then(({ data })   => setSocial(data.links ?? [])).catch(() => {});
    api.get('/public/banners').then(({ data })  => setBanners(data.banners ?? [])).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openModal = (src: 'book_now' | 'free_class') => {
    setSource(src);
    setSuccess('');
    setForm({ country_id: String(countries[0]?.id ?? ''), student_name: '', phone: '', school: '', region: '', subjects: [] });
    setModalOpen(true);
  };

  const toggleSubject = (s: string) =>
    setForm(f => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/leads', { ...form, country_id: Number(form.country_id), source });
      setSuccess(data.message);
    } catch {
      setSuccess('حدث خطأ، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const socialIcon = (p: string) =>
    ({ facebook:'f', instagram:'ig', twitter:'x', youtube:'YT', tiktok:'TK', whatsapp:'WA', telegram:'TG', linkedin:'in' })[p.toLowerCase()] ?? p[0].toUpperCase();

  const displayFaqs = faqs.length ? faqs : STATIC_FAQS;

  /* ─── Render ──────────────────────────────── */
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#060d1f', color: '#fff' }} dir="rtl">
      <ProgressBar />
      <NoiseOverlay />
      <PageLoader />
      <CustomCursor />

      {/* ════════ NAVBAR ════════ */}
      <motion.nav
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: SP, delay: 1.3 }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={scrolled ? {
          background: 'rgba(4,10,24,0.82)',
          backdropFilter: 'blur(28px) saturate(160%)',
          borderBottom: '1px solid rgba(245,166,35,0.13)',
          paddingTop: 10,
          paddingBottom: 10,
        } : { paddingTop: 20, paddingBottom: 20 }}>
        <div className="container-max flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/logo.png" alt="ياقوت" className="h-16 w-16 object-contain relative z-10"
                style={{ filter: 'drop-shadow(0 0 12px rgba(245,166,35,0.4))' }} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1 }}>
                منصة الياقوت
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: '#f5a623', fontWeight: 700, letterSpacing: '0.12em' }}>
                لخدمات التعليم
              </p>
            </div>
          </div>

          {/* Nav links + CTA */}
          <div className="flex items-center gap-6">
            {[['المميزات', '#features'], ['الأسئلة الشائعة', '#faqs']].map(([label, href]) => (
              <a key={href} href={href}
                style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'rgba(255,255,255,0.58)', transition: 'color 0.2s ease' }}
                className="hidden md:block"
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#fff')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.58)')}>
                {label}
              </a>
            ))}
            <Link to="/login"
              className="btn-shimmer rounded-xl"
              style={{ color: '#0d1b4b', padding: '10px 24px', fontSize: 'var(--text-sm)' }}>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ════════════════ HERO ════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Base gradient */}
        <div className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(155deg,#0e1c4e 0%,#060d1f 52%,#091424 100%)' }} />

        {/* Aurora orbs */}
        <div className="aurora-orb au-gold-1"   style={{ zIndex: 1 }} />
        <div className="aurora-orb au-blue-1"   style={{ zIndex: 1 }} />
        <div className="aurora-orb au-purple-1" style={{ zIndex: 1 }} />
        <div className="aurora-orb au-teal-1"   style={{ zIndex: 1 }} />
        <div className="aurora-orb au-gold-2"   style={{ zIndex: 1 }} />
        <div className="aurora-orb au-indigo-1" style={{ zIndex: 1 }} />

        {/* Animated scrolling grid */}
        <div className="hero-grid-animated absolute inset-0" style={{ zIndex: 2 }} />

        {/* Particles canvas */}
        <ParticleCanvas />

        {/* Shooting stars */}
        <ShootingStars />

        {/* Parallax content */}
        <motion.div
          style={{ y: heroY, zIndex: 10, position: 'relative' }}
          className="text-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.3 }}>

          <div style={{
            maxWidth: 880,
            margin: '0 auto',
            padding: '128px 24px 96px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}>

            {/* ── Logo ── */}
            <div style={{ marginBottom: 36 }}>
              <LogoHero />
            </div>

            {/* ── Badge ── */}
            <div style={{ marginBottom: 36 }}>
              <StarBadge />
            </div>

            {/* ── Hero heading ── */}
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', fontFamily: "'Cairo','Tajawal',sans-serif",
              color: '#fff',
              marginBottom: 24,
              textShadow: '0 0 100px rgba(245,166,35,0.18), 0 8px 50px rgba(0,0,0,0.6)',
              textAlign: 'center',
            }}>
              {[
                { word: 'تعلّم',    gold: false },
                { word: 'مع',       gold: false },
                { word: 'أفضل',     gold: true  },
                { word: 'المعلمين', gold: false },
              ].map(({ word, gold }, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0, y: 55, filter: 'blur(20px)', scale: 0.88 }}
                  animate={{ opacity: 1, y: 0,  filter: 'blur(0px)',  scale: 1    }}
                  transition={{ duration: 0.95, ease: SP, delay: 1.62 + i * 0.2 }}
                  className={gold ? 'text-gold-gradient' : ''}
                  style={{ display: 'inline-block', marginInlineEnd: '0.24em' }}>
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* ── Subtitle ── */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: SP, delay: 2.05 }}
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 400,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.55)',
                maxWidth: 520,
                marginBottom: 48,
                textAlign: 'center',
              }}>
              منصة ياقوت تجمع أفضل المعلمين مع الطلاب في فصول مباشرة احترافية
              — مع نظام متابعة ذكي لولي الأمر
            </motion.p>

            {/* ── CTA Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: SP, delay: 2.2 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 36 }}>

              <RippleBtn
                variant="primary"
                className="btn-shimmer btn-hero-pulse rounded-2xl"
                style={{ color: '#0d1b4b', padding: '18px 44px', fontSize: 'var(--text-xl)' }}
                onClick={() => openModal('book_now')}>
                📚 احجز مكانك الآن
              </RippleBtn>

              <RippleBtn
                variant="ghost"
                className="btn-ghost rounded-2xl"
                style={{
                  color: '#fff',
                  padding: '18px 44px',
                  fontSize: 'var(--text-xl)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.04)',
                }}
                onClick={() => openModal('free_class')}>
                🎁 اطلب حصة مجانية
              </RippleBtn>
            </motion.div>

            {/* footnote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>
              انضم لآلاف الطلاب المتفوقين في المنطقة العربية
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.38 }}
          transition={{ delay: 2.6, duration: 0.9 }}>
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1.5">
            <div style={{ width: 24, height: 42, border: '1.5px solid rgba(255,255,255,0.24)', borderRadius: 99, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 6 }}>
              <div style={{ width: 3, height: 10, background: 'rgba(245,166,35,0.7)', borderRadius: 99, marginTop: 2 }} />
            </div>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.28em', fontWeight: 700 }}>
              SCROLL
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════ STATS ════════ */}
      <GlowDivider />
      <section className="section-py relative overflow-hidden" style={{ background: '#070e22' }}>
        <div className="aurora-orb au-gold-2 opacity-25" style={{ bottom: -120, insetInlineEnd: -80 }} />
        <motion.div
          className="container-max"
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '48px 24px' }}>
            {STATS.map((s, i) => (
              <motion.div key={i} variants={cardItem} style={{ textAlign: 'center' }}>
                <p className="stat-number text-gold-gradient">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'rgba(255,255,255,0.42)', marginTop: 8, letterSpacing: '0.04em' }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════ BANNERS ════════ */}
      {banners.length > 0 && (
        <>
          <GlowDivider />
          <section className="section-py" style={{ background: '#060d1f' }}>
            <div className="container-max">
              <motion.div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
                variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                {banners.map(b => (
                  <motion.div key={b.id} variants={cardItem}>
                    <TiltCard className="glass-card rounded-2xl overflow-hidden">
                      {b.link_url
                        ? <a href={b.link_url} target="_blank" rel="noopener noreferrer">
                            <img src={b.image_url} alt={b.title ?? ''} className="w-full object-cover" style={{ height: 200 }} />
                          </a>
                        : <img src={b.image_url} alt={b.title ?? ''} className="w-full object-cover" style={{ height: 200 }} />}
                    </TiltCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* ════════ FEATURES ════════ */}
      <GlowDivider />
      <section id="features" className="section-py" style={{ background: '#060d1f' }}>
        <div className="container-max">
          <motion.div
            style={{ textAlign: 'center', marginBottom: 64 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <span className="section-badge" style={{ marginBottom: 20, display: 'inline-block' }}>
              ✦ لماذا ياقوت؟
            </span>
            <h2 className="t-display" style={{ marginTop: 20, marginBottom: 16, color: '#fff' }}>
              <WordReveal text="مميزات تجعل الفرق" />
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              lineHeight: 1.78,
              color: 'rgba(255,255,255,0.44)',
              maxWidth: 480,
              margin: '0 auto',
            }}>
              تجربة تعليمية متكاملة مصممة لتحقيق أفضل النتائج الأكاديمية
            </p>
          </motion.div>

          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={cardItem}>
                <TiltCard className="glass-card rounded-2xl h-full" style={{ padding: '32px 28px', textAlign: 'center' }}>
                  <div className="float-icon" style={{ fontSize: 44, marginBottom: 20, display: 'inline-block', animationDelay: `${i * 0.5}s` }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', marginBottom: 12 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.78, color: 'rgba(255,255,255,0.47)' }}>
                    {f.desc}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ STEPS ════════ */}
      <GlowDivider />
      <section className="section-py relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#0d1b4b 0%,#060d1f 100%)' }}>
        <div className="aurora-orb au-purple-1 opacity-18" style={{ top: -220, left: '28%', zIndex: 0 }} />
        <div className="container-max" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            style={{ textAlign: 'center', marginBottom: 64 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <span className="section-badge" style={{ marginBottom: 20, display: 'inline-block' }}>
              ✦ كيف نعمل؟
            </span>
            <h2 className="t-display" style={{ marginTop: 20, color: '#fff' }}>
              <WordReveal text="3 خطوات فقط للانطلاق" />
            </h2>
          </motion.div>

          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 32 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
            {STEPS.map((s, i) => (
              <motion.div key={i} variants={cardItem} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                  <div className="glass-card-gold rounded-2xl flex items-center justify-center"
                    style={{
                      width: 64, height: 64,
                      fontSize: 'var(--text-xl)',
                      fontWeight: 900,
                      color: '#f5a623',
                      letterSpacing: '-0.02em',
                    }}>
                    {s.num}
                  </div>
                </div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#fff', letterSpacing: '-0.015em', marginBottom: 12 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.78, color: 'rgba(255,255,255,0.46)' }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div style={{ textAlign: 'center', marginTop: 56 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <MagBtn
              className="btn-shimmer rounded-2xl"
              style={{ color: '#0d1b4b', padding: '18px 48px', fontSize: 'var(--text-lg)' }}
              onClick={() => openModal('book_now')}>
              ابدأ رحلتك الآن ←
            </MagBtn>
          </motion.div>
        </div>
      </section>

      {/* ════════ FAQs ════════ */}
      <GlowDivider />
      <section id="faqs" className="section-py" style={{ background: '#060d1f' }}>
        <div style={{ maxWidth: 'var(--max-text)', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            style={{ textAlign: 'center', marginBottom: 56 }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <span className="section-badge" style={{ marginBottom: 20, display: 'inline-block' }}>
              ✦ لديك سؤال؟
            </span>
            <h2 className="t-display" style={{ marginTop: 20, color: '#fff' }}>
              <WordReveal text="الأسئلة الشائعة" />
            </h2>
          </motion.div>

          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }}>
            {displayFaqs.map((faq, i) => (
              <motion.div key={faq.id} variants={cardItem}
                className="glass-card rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    textAlign: 'right',
                    background: openFaq === i ? 'rgba(245,166,35,0.04)' : 'transparent',
                    transition: 'background 0.2s ease',
                    border: 'none',
                    cursor: 'none',
                  }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.35, ease: SP }}
                    style={{
                      display: 'inline-block',
                      color: '#f5a623',
                      flexShrink: 0,
                      marginInlineStart: 16,
                      fontSize: 28,
                      fontWeight: 200,
                      lineHeight: 1,
                    }}>
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: SP }}>
                      <p style={{
                        padding: '12px 24px 24px',
                        fontSize: 'var(--text-sm)',
                        lineHeight: 1.82,
                        color: 'rgba(255,255,255,0.5)',
                        borderTop: '1px solid rgba(255,255,255,0.055)',
                      }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ CTA BAND ════════ */}
      <GlowDivider />
      <section className="section-py relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#e8950f 0%,#f5a623 25%,#ffd166 50%,#f5a623 75%,#e8950f 100%)',
          backgroundSize: '220% auto',
          animation: 'yq-shimmer 7s linear infinite',
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 18% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(ellipse at 82% 50%, rgba(13,27,75,0.16) 0%, transparent 50%)',
          }} />
        <motion.div
          className="container-max"
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 760 }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
          <h2 className="t-display" style={{ color: '#0d1b4b', marginBottom: 16 }}>
            <WordReveal text="جاهز للانطلاق نحو التفوق؟" />
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(13,27,75,0.65)', marginBottom: 40, lineHeight: 1.72, fontWeight: 400 }}>
            سجّل الآن واحصل على حصتك التجريبية المجانية مع أفضل المعلمين
          </p>
          <MagBtn
            className="rounded-2xl"
            style={{
              color: '#fff',
              padding: '18px 48px',
              fontSize: 'var(--text-lg)',
              fontWeight: 800,
              fontFamily: "'Cairo', 'Tajawal', sans-serif",
              background: '#0d1b4b',
              boxShadow: '0 24px 64px -12px rgba(13,27,75,0.55)',
              letterSpacing: '-0.01em',
            }}
            onClick={() => openModal('free_class')}>
            🎁 اطلب حصتك المجانية
          </MagBtn>
        </motion.div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="footer-grid" style={{ background: '#040a18', position: 'relative' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(4,10,24,0.95), rgba(4,10,24,0.6))' }} />

        <motion.div
          className="container-max"
          style={{ position: 'relative', zIndex: 1, paddingTop: 64, paddingBottom: 48 }}
          variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>

          {/* Top row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32, marginBottom: 48 }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img src="/logo.png" alt="ياقوت" style={{
                width: 52, height: 52, objectFit: 'contain',
                filter: 'drop-shadow(0 0 14px rgba(245,166,35,0.45))',
              }} />
              <div>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  منصة الياقوت
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#f5a623', fontWeight: 700, letterSpacing: '0.14em', marginTop: 2 }}>
                  لخدمات التعليم
                </p>
              </div>
            </div>

            {/* Social links */}
            {social.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {social.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="social-icon glass-card rounded-full flex items-center justify-center"
                    style={{
                      width: 44, height: 44,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      color: 'rgba(255,255,255,0.44)',
                      textDecoration: 'none',
                    }}>
                    {socialIcon(s.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <GlowDivider />

          {/* Copyright */}
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 400,
            marginTop: 32,
            lineHeight: 1.6,
          }}>
            © {new Date().getFullYear()} منصة الياقوت لخدمات التعليم — جميع الحقوق محفوظة
          </p>
        </motion.div>
      </footer>

      {/* ════════════════ MODAL ════════════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9990, backdropFilter: 'blur(18px)', background: 'rgba(4,10,24,0.88)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>

            <motion.div
              className="w-full rounded-3xl"
              style={{
                maxWidth: 520,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'rgba(8,16,40,0.98)',
                border: '1px solid rgba(245,166,35,0.18)',
                backdropFilter: 'blur(32px)',
              }}
              initial={{ scale: 0.78, opacity: 0, y: 48 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.86, opacity: 0, y: 28 }}
              transition={{ duration: 0.42, ease: POP }}
              dir="rtl">

              {/* Header */}
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                    {source === 'book_now' ? '📚 احجز مكانك' : '🎁 الحصة المجانية'}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.36)', marginTop: 4, fontWeight: 400 }}>
                    أكمل بياناتك وسنتواصل معك قريباً
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)}
                  style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: 200, lineHeight: 1, background: 'none', border: 'none', cursor: 'none', transition: 'color 0.2s ease' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = '#fff')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.3)')}>
                  ×
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '28px' }}>
                {success ? (
                  <motion.div
                    style={{ textAlign: 'center', padding: '48px 0' }}
                    initial={{ scale: 0.65, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ease: POP }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: '#fff' }}>{success}</p>
                    <button onClick={() => setModalOpen(false)}
                      className="btn-shimmer rounded-xl"
                      style={{ color: '#0d1b4b', padding: '14px 36px', fontSize: 'var(--text-base)', marginTop: 28 }}>
                      إغلاق
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { label: 'الاسم الكامل *', key: 'student_name', type: 'text', ph: 'اسم الطالب الكامل', req: true },
                      { label: 'رقم الهاتف *',  key: 'phone',        type: 'tel',  ph: '07xxxxxxxx',        req: true, ltr: true },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 8 }}>
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          required={f.req}
                          value={form[f.key as keyof typeof form] as string}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="modal-input"
                          placeholder={f.ph}
                          dir={f.ltr ? 'ltr' : undefined}
                          style={{ width: '100%', height: 48, borderRadius: 14, padding: '0 16px' }}
                        />
                      </div>
                    ))}

                    {countries.length > 0 && (
                      <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 8 }}>
                          الدولة *
                        </label>
                        <select
                          required
                          value={form.country_id}
                          onChange={e => setForm(p => ({ ...p, country_id: e.target.value }))}
                          className="modal-input"
                          style={{ width: '100%', height: 48, borderRadius: 14, padding: '0 16px' }}>
                          <option value="">اختر الدولة</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { label: 'المدرسة', key: 'school', ph: 'اسم المدرسة' },
                        { label: 'المنطقة', key: 'region', ph: 'المنطقة السكنية' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 8 }}>
                            {f.label}
                          </label>
                          <input
                            type="text"
                            value={form[f.key as keyof typeof form] as string}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="modal-input"
                            placeholder={f.ph}
                            style={{ width: '100%', height: 48, borderRadius: 14, padding: '0 14px' }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Subjects */}
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: 12 }}>
                        المواد المطلوبة
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {SUBJECTS.map(s => (
                          <button type="button" key={s} onClick={() => toggleSubject(s)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 10,
                              fontSize: 'var(--text-sm)',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'none',
                              transition: 'all 0.22s ease',
                              ...(form.subjects.includes(s)
                                ? { background: 'linear-gradient(135deg,#f5a623,#ffd166)', color: '#0d1b4b', transform: 'scale(1.07)' }
                                : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }),
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-shimmer rounded-xl"
                      style={{ color: '#0d1b4b', width: '100%', height: 52, fontSize: 'var(--text-base)', marginTop: 8 }}>
                      {submitting ? 'جاري الإرسال...' : (source === 'book_now' ? 'احجز الآن ←' : 'اطلب الحصة المجانية ←')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
