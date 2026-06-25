import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login } from '../features/auth/authSlice';
import {
  motion, AnimatePresence,
  useMotionValue, useSpring,
} from 'framer-motion';
import BrandLogo from '../components/BrandLogo';

/* ── Constants ─────────────────────────────── */
const ROLE_ROUTES: Record<string, string> = {
  super_admin: '/dashboard',
  admin:       '/admin/dashboard',
  student:     '/student/dashboard',
  teacher:     '/teacher/dashboard',
  parent:      '/parent/dashboard',
  supervisor:  '/supervisor/students',
};
const KEYWORD_MAP: Record<string, string> = {
  // الأردن
  super:         '00962100000000',
  admin:         '00962200000000',
  teacher:       '00962300000000',
  student:       '00962400000000',
  parent:        '00962500000000',
  supervisor:    '00962600000000',
  // فلسطين
  ps_admin:      '00970444444444',
  ps_teacher:    '00970111111111',
  ps_student:    '00970222222221',
  ps_parent:     '00970333333331',
  ps_supervisor: '00970555555551',
};

const SP  = [0.16, 1, 0.3, 1]     as const;
const POP = [0.34, 1.56, 0.64, 1] as const;

/* ── Custom cursor ──────────────────────────── */
function LoginCursor() {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(mx, { stiffness: 280, damping: 22 });
  const ry = useSpring(my, { stiffness: 280, damping: 22 });
  const [hov, setHov] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    const over = (e: MouseEvent) => setHov(!!(e.target as HTMLElement).closest('button,input,a'));
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, [mx, my]);

  return (
    <>
      <motion.div className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%',
          width: hov ? 6 : 8, height: hov ? 6 : 8,
          background: '#f5a623', boxShadow: '0 0 10px rgba(245,166,35,0.9)',
          transition: 'width 0.2s, height 0.2s',
        }} />
      <motion.div className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%',
          width: hov ? 46 : 34, height: hov ? 46 : 34,
          border: '1.5px solid rgba(245,166,35,0.5)',
          transition: 'width 0.22s, height 0.22s',
        }} />
    </>
  );
}

/* ── Background particles ───────────────────── */
function BgParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const N = Math.min(55, Math.floor(window.innerWidth / 22));
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.5 + 0.4,
      a: Math.random() * 0.42 + 0.1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.vx *= 0.994; p.vy *= 0.994;
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
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(245,166,35,${0.1 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={ref}
      style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', display: 'block' }} />
  );
}

/* ── Ripple button ──────────────────────────── */
function RippleButton({ children, disabled, type = 'button' }: {
  children: ReactNode; disabled?: boolean; type?: 'button' | 'submit';
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const bx  = useMotionValue(0);
  const by  = useMotionValue(0);
  const sx  = useSpring(bx, { stiffness: 180, damping: 14 });
  const sy  = useSpring(by, { stiffness: 180, damping: 14 });

  const addRipple = (e: React.MouseEvent) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 800);
  };

  return (
    <motion.div ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={e => {
        if (disabled) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        bx.set((e.clientX - r.left - r.width  / 2) * 0.28);
        by.set((e.clientY - r.top  - r.height / 2) * 0.28);
      }}
      onMouseLeave={() => { bx.set(0); by.set(0); }}>
      <button type={type} disabled={disabled} onClick={addRipple}
        className="relative overflow-hidden"
        style={{
          width: '100%', height: 56, borderRadius: 16, border: 'none',
          background: disabled
            ? 'rgba(245,166,35,0.3)'
            : 'linear-gradient(135deg,#f5a623 0%,#ffd166 50%,#e09000 100%)',
          color: disabled ? 'rgba(255,255,255,0.45)' : '#0d1b4b',
          fontSize: 17, fontWeight: 900,
          fontFamily: "'Cairo','Tajawal',sans-serif",
          letterSpacing: '-0.01em',
          cursor: disabled ? 'not-allowed' : 'none',
          boxShadow: disabled ? 'none' : '0 16px 48px -8px rgba(245,166,35,0.55)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        }}
        onMouseEnter={e => { if (!disabled) { const b = e.currentTarget; b.style.transform = 'translateY(-3px) scale(1.025)'; b.style.boxShadow = '0 22px 60px -6px rgba(245,166,35,0.82)'; } }}
        onMouseLeave={e => { const b = e.currentTarget; b.style.transform = ''; b.style.boxShadow = disabled ? 'none' : '0 16px 48px -8px rgba(245,166,35,0.55)'; }}>

        {/* shimmer */}
        {!disabled && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)', width: '45%', borderRadius: 16 }}
            animate={{ x: ['-130%', '280%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
        )}

        {/* ripples */}
        {ripples.map(r => (
          <motion.span key={r.id}
            style={{
              position: 'absolute', left: r.x, top: r.y, borderRadius: '50%',
              background: 'rgba(255,255,255,0.42)', transform: 'translate(-50%,-50%)',
              pointerEvents: 'none', zIndex: 10, width: 0, height: 0,
            }}
            animate={{ width: 500, height: 500, opacity: [0.7, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }} />
        ))}

        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      </button>
    </motion.div>
  );
}

/* ── Floating label input ───────────────────── */
function FloatingInput({ value, onChange, hasError }: {
  value: string; onChange: (v: string) => void; hasError: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      {/* floating label */}
      <motion.label
        animate={{
          top:      floated ? 9  : 20,
          fontSize: floated ? 11 : 15,
          color: hasError ? '#f87171' : focused ? '#f5a623' : 'rgba(255,255,255,0.36)',
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          position: 'absolute', insetInlineEnd: 46, zIndex: 2,
          fontWeight: 600, lineHeight: 1, pointerEvents: 'none',
          fontFamily: "'Cairo','Tajawal',sans-serif",
        }}>
        الكلمة المفتاحية
      </motion.label>

      {/* lock icon */}
      <div style={{
        position: 'absolute', top: '50%', insetInlineEnd: 15,
        transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none',
        color: hasError ? '#f87171' : focused ? '#f5a623' : 'rgba(255,255,255,0.28)',
        transition: 'color 0.22s ease',
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>

      {/* input */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        dir="rtl"
        style={{
          width: '100%', height: 60,
          paddingTop: 20, paddingBottom: 6,
          paddingInlineEnd: 44, paddingInlineStart: 16,
          background: 'rgba(255,255,255,0.055)',
          border: `1.5px solid ${hasError ? 'rgba(248,113,113,0.65)' : focused ? 'rgba(245,166,35,0.65)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 14,
          color: '#fff', fontSize: 15, fontWeight: 500,
          fontFamily: "'Cairo','Tajawal',sans-serif",
          outline: 'none', cursor: 'none',
          backdropFilter: 'blur(8px)',
          boxShadow: focused ? '0 0 0 3px rgba(245,166,35,0.12)' : 'none',
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
        }}
      />

      {/* focus glow line */}
      <motion.div
        animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: SP }}
        style={{
          position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 1,
          background: 'linear-gradient(90deg,transparent,#f5a623,transparent)',
          borderRadius: 99, originX: 0.5, filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token, user } = useAppSelector(s => s.auth);

  const [keyword,    setKeyword]    = useState('');
  const [localError, setLocalError] = useState('');
  const [shake,      setShake]      = useState(false);
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    if (token && user?.role) {
      setSuccess(true);
      setTimeout(() => navigate(ROLE_ROUTES[user.role] ?? '/dashboard', { replace: true }), 750);
    }
  }, [token, user, navigate]);

  const hasError = !!(localError || error);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError('');
    const phone = KEYWORD_MAP[keyword.trim().toLowerCase()];
    if (!phone) {
      setLocalError('الكلمة المفتاحية غير صحيحة');
      setShake(true);
      setTimeout(() => setShake(false), 650);
      return;
    }
    dispatch(login(phone));
  };

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', background: '#060d1f',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <LoginCursor />

      {/* Base gradient */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(155deg,#0d1b4b 0%,#060d1f 52%,#091424 100%)',
      }} />

      {/* Aurora orbs */}
      <div style={{
        position: 'absolute', width: 800, height: 600, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(245,166,35,0.2) 0%,transparent 68%)',
        top: -250, right: -200, filter: 'blur(100px)', zIndex: 1,
        animation: 'au1 22s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(59,130,246,0.2) 0%,transparent 68%)',
        bottom: -180, left: -150, filter: 'blur(110px)', zIndex: 1,
        animation: 'au2 17s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(139,92,246,0.13) 0%,transparent 68%)',
        top: '40%', left: '25%', filter: 'blur(90px)', zIndex: 1,
        animation: 'au3 14s ease-in-out infinite alternate',
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'yq-grid-scroll 5s linear infinite',
      }} />

      {/* Particles */}
      <BgParticles />

      {/* ════ CARD — entrance wrapper ════ */}
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: POP }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, margin: '0 24px' }}>

        {/* shake wrapper — separate from entrance */}
        <motion.div
          animate={shake ? { x: [0,-12,12,-9,9,-5,5,0] } : { x: 0 }}
          transition={{ duration: 0.55 }}
          style={{
            borderRadius: 28,
            background: 'rgba(8,16,40,0.84)',
            backdropFilter: 'blur(28px) saturate(160%)',
            border: `1.5px solid ${success ? 'rgba(34,197,94,0.55)' : hasError ? 'rgba(248,113,113,0.45)' : 'rgba(245,166,35,0.22)'}`,
            boxShadow: success
              ? '0 0 55px rgba(34,197,94,0.18), 0 32px 80px -16px rgba(0,0,0,0.75)'
              : hasError
              ? '0 0 40px rgba(248,113,113,0.12), 0 32px 80px -16px rgba(0,0,0,0.75)'
              : '0 0 55px rgba(245,166,35,0.1), 0 32px 80px -16px rgba(0,0,0,0.75)',
            transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
            overflow: 'hidden',
          }}>

          {/* Gold top accent line */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg,transparent,#f5a623,#ffd166,#f5a623,transparent)',
            backgroundSize: '250% auto',
            animation: 'yq-shimmer 3.5s linear infinite',
          }} />

          {/* Logo section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: SP, delay: 0.25 }}
            style={{ padding: '36px 36px 24px', textAlign: 'center' }}>

            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
              {/* halo glow */}
              <div style={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(245,166,35,0.42) 0%,rgba(245,166,35,0.1) 48%,transparent 68%)',
                filter: 'blur(18px)', transform: 'scale(1.8)', pointerEvents: 'none',
                animation: 'yq-breathe 3.2s ease-in-out infinite alternate',
              }} />
              {/* pulse rings */}
              {[0, 0.7].map((delay, i) => (
                <div key={i} style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: '1px solid rgba(245,166,35,0.28)',
                  animation: `yq-pulse-ring 2.2s ease-out ${delay}s infinite`,
                  pointerEvents: 'none',
                }} />
              ))}
              {/* orbit ring */}
              <div style={{
                position: 'absolute', inset: -14, borderRadius: '50%',
                border: '1.5px solid transparent',
                background: 'linear-gradient(rgba(8,16,40,0),rgba(8,16,40,0)) padding-box, linear-gradient(90deg,#f5a623,#ffd166,transparent,#ffd166,#f5a623) border-box',
                animation: 'yq-spin-slow 9s linear infinite',
                pointerEvents: 'none',
              }} />
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.9, ease: POP, delay: 0.35 }}
                whileHover={{ scale: 1.08 }}
                style={{
                  position: 'relative', zIndex: 1,
                  filter: 'drop-shadow(0 0 28px rgba(245,166,35,0.6))',
                }}>
                <BrandLogo size={150} style={{ width: 150, height: 'auto' }} />
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(245,166,35,0.2),transparent)', margin: '0 28px' }} />

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: SP, delay: 0.42 }}
            style={{ padding: '28px 32px 32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <FloatingInput
                value={keyword}
                onChange={v => { setKeyword(v); setLocalError(''); }}
                hasError={hasError}
              />

              {/* Error */}
              <AnimatePresence>
                {hasError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0,  height: 'auto' }}
                    exit={{ opacity: 0, y: -8,   height: 0 }}
                    transition={{ duration: 0.28, ease: SP }}
                    style={{
                      background: 'rgba(248,113,113,0.1)',
                      border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: 12, padding: '10px 16px',
                      fontSize: 13, fontWeight: 600,
                      color: '#f87171', textAlign: 'center',
                      fontFamily: "'Cairo','Tajawal',sans-serif",
                      overflow: 'hidden',
                    }}>
                    {localError || error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ease: POP }}
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.32)',
                      borderRadius: 12, padding: '10px 16px',
                      fontSize: 13, fontWeight: 700,
                      color: '#4ade80', textAlign: 'center',
                      fontFamily: "'Cairo','Tajawal',sans-serif",
                    }}>
                    ✓ تم الدخول بنجاح، جاري التحويل...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <RippleButton type="submit" disabled={loading || !keyword.trim() || success}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
                      style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(13,27,75,0.3)', borderTopColor: '#0d1b4b', borderRadius: '50%' }} />
                    جاري الدخول...
                  </span>
                ) : '🔐 تسجيل الدخول'}
              </RippleButton>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                style={{
                  textAlign: 'center', fontSize: 12, fontWeight: 400,
                  color: 'rgba(245,166,35,0.4)',
                  fontFamily: "'Cairo','Tajawal',sans-serif",
                  lineHeight: 1.6, marginTop: 4,
                }}>
                انضم لآلاف الطلاب المتفوقين في المنطقة العربية
              </motion.p>

            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
