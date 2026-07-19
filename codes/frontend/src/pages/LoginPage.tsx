import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginWithEmail, sendOtp, verifyOtp, clearAuthError } from '../features/auth/authSlice';
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

const POP = [0.34, 1.56, 0.64, 1] as const;

type LoginTab = 'email' | 'phone';

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
            ? 'linear-gradient(135deg,#8a6a1a 0%,#a67c1a 100%)'
            : 'linear-gradient(135deg,#f5a623 0%,#ffd166 50%,#e09000 100%)',
          color: disabled ? 'rgba(255,255,255,0.85)' : '#0d1b4b',
          fontSize: 17, fontWeight: 900,
          fontFamily: "'Cairo','Tajawal',sans-serif",
          letterSpacing: '-0.01em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : '0 16px 48px -8px rgba(245,166,35,0.55)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        }}
        onMouseEnter={e => { if (!disabled) { const b = e.currentTarget; b.style.transform = 'translateY(-3px) scale(1.025)'; b.style.boxShadow = '0 22px 60px -6px rgba(245,166,35,0.82)'; } }}
        onMouseLeave={e => { const b = e.currentTarget; b.style.transform = ''; b.style.boxShadow = disabled ? 'none' : '0 16px 48px -8px rgba(245,166,35,0.55)'; }}>

        {!disabled && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)', width: '45%', borderRadius: 16 }}
            animate={{ x: ['-130%', '280%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
        )}

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
function FloatingInput({ value, onChange, hasError, label, type = 'text', autoComplete, dir }: {
  value: string; onChange: (v: string) => void; hasError: boolean;
  label: string; type?: string; autoComplete?: string; dir?: 'rtl' | 'ltr';
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <motion.label
        animate={{
          top:      floated ? 9  : 20,
          fontSize: floated ? 11 : 15,
          color: hasError ? '#f87171' : focused ? '#f5a623' : 'rgba(255,255,255,0.36)',
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          position: 'absolute', insetInlineEnd: 16, zIndex: 2,
          fontWeight: 600, lineHeight: 1, pointerEvents: 'none',
          fontFamily: "'Cairo','Tajawal',sans-serif",
        }}>
        {label}
      </motion.label>

      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        dir={dir ?? 'rtl'}
        style={{
          width: '100%', height: 60,
          paddingTop: 20, paddingBottom: 6,
          paddingInlineEnd: 16, paddingInlineStart: 16,
          background: 'rgba(255,255,255,0.055)',
          border: `1.5px solid ${hasError ? 'rgba(248,113,113,0.65)' : focused ? 'rgba(245,166,35,0.65)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 14,
          color: '#fff', fontSize: 15, fontWeight: 500,
          fontFamily: "'Cairo','Tajawal',sans-serif",
          outline: 'none', cursor: 'text',
          backdropFilter: 'blur(8px)',
          boxShadow: focused ? '0 0 0 3px rgba(245,166,35,0.12)' : 'none',
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
        }}
      />
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

  const [tab, setTab] = useState<LoginTab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState('');
  const [localError, setLocalError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token && user?.role) {
      setSuccess(true);
      setTimeout(() => navigate(ROLE_ROUTES[user.role] ?? '/dashboard', { replace: true }), 750);
    }
  }, [token, user, navigate]);

  const hasError = !!(localError || error);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 650);
  };

  const switchTab = (next: LoginTab) => {
    setTab(next);
    setLocalError('');
    setInfoMsg('');
    setDebugOtp(null);
    setOtpSent(false);
    setOtp('');
    dispatch(clearAuthError());
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !password) {
      setLocalError('أدخل البريد الإلكتروني وكلمة المرور');
      triggerShake();
      return;
    }
    dispatch(loginWithEmail({ email: email.trim(), password }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setInfoMsg('');
    setDebugOtp(null);
    if (!phone.trim()) {
      setLocalError('أدخل رقم الجوال');
      triggerShake();
      return;
    }
    const result = await dispatch(sendOtp(phone.trim()));
    if (sendOtp.fulfilled.match(result)) {
      setOtpSent(true);
      setInfoMsg(result.payload.message);
      if (result.payload.debug_otp) setDebugOtp(result.payload.debug_otp);
    } else {
      triggerShake();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setLocalError('أدخل رمز التحقق المكوّن من 6 أرقام');
      triggerShake();
      return;
    }
    dispatch(verifyOtp({ phone: phone.trim(), otp: otp.trim() }));
  };

  const tabBtn = (id: LoginTab, label: string) => {
    const active = tab === id;
    return (
      <button type="button" onClick={() => switchTab(id)}
        style={{
          flex: 1, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
          fontFamily: "'Cairo','Tajawal',sans-serif", fontWeight: 800, fontSize: 13,
          background: active ? 'linear-gradient(135deg,#f5a623,#ffd166)' : 'rgba(255,255,255,0.04)',
          color: active ? '#0d1b4b' : 'rgba(255,255,255,0.55)',
          transition: 'all 0.25s ease',
        }}>
        {label}
      </button>
    );
  };

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', background: '#060d1f',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(155deg,#0d1b4b 0%,#060d1f 52%,#091424 100%)',
      }} />
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
      <BgParticles />

      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: POP }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, margin: '0 24px' }}>

        <motion.div
          animate={shake ? { x: [0,-12,12,-9,9,-5,5,0] } : { x: 0 }}
          transition={{ duration: 0.55 }}
          style={{
            borderRadius: 28,
            background: 'rgba(8,16,40,0.84)',
            backdropFilter: 'blur(28px) saturate(160%)',
            border: `1.5px solid ${success ? 'rgba(34,197,94,0.55)' : hasError ? 'rgba(248,113,113,0.45)' : 'rgba(245,166,35,0.22)'}`,
            boxShadow: '0 0 55px rgba(245,166,35,0.1), 0 32px 80px -16px rgba(0,0,0,0.75)',
            overflow: 'hidden',
          }}>

          <div style={{
            height: 3,
            background: 'linear-gradient(90deg,transparent,#f5a623,#ffd166,#f5a623,transparent)',
            backgroundSize: '250% auto',
            animation: 'yq-shimmer 3.5s linear infinite',
          }} />

          <div style={{ padding: '32px 36px 20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <div style={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(245,166,35,0.42) 0%,transparent 68%)',
                filter: 'blur(18px)', transform: 'scale(1.8)', pointerEvents: 'none',
              }} />
              <BrandLogo size={130} style={{ width: 130, height: 'auto', position: 'relative', zIndex: 1 }} />
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600,
              fontFamily: "'Cairo','Tajawal',sans-serif", margin: 0,
            }}>
              سجّل الدخول حسب صلاحياتك
            </p>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(245,166,35,0.2),transparent)', margin: '0 28px' }} />

          <div style={{ padding: '24px 32px 32px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.03)' }}>
              {tabBtn('email', 'إيميل وكلمة سر')}
              {tabBtn('phone', 'جوال وواتساب')}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'email' ? (
                <motion.form key="email"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleEmailLogin}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FloatingInput
                    label="البريد الإلكتروني"
                    type="email"
                    autoComplete="username"
                    dir="ltr"
                    value={email}
                    onChange={v => { setEmail(v); setLocalError(''); }}
                    hasError={hasError}
                  />
                  <FloatingInput
                    label="كلمة المرور"
                    type="password"
                    autoComplete="current-password"
                    dir="ltr"
                    value={password}
                    onChange={v => { setPassword(v); setLocalError(''); }}
                    hasError={hasError}
                  />
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0, fontFamily: "'Cairo',sans-serif" }}>
                    لجميع الأدوار: سوبر أدمن، أدمن، معلم، مشرف، طالب، وولي أمر
                  </p>

                  {/* Error / success / info inside forms below */}
                  {hasError && (
                    <div style={{
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 600,
                      color: '#f87171', textAlign: 'center', fontFamily: "'Cairo',sans-serif",
                    }}>
                      {localError || error}
                    </div>
                  )}
                  {success && (
                    <div style={{
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.32)',
                      borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700,
                      color: '#4ade80', textAlign: 'center', fontFamily: "'Cairo',sans-serif",
                    }}>
                      ✓ تم الدخول بنجاح، جاري التحويل...
                    </div>
                  )}

                  <RippleButton type="submit" disabled={loading || success || !email.trim() || !password}>
                    {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                  </RippleButton>
                </motion.form>
              ) : (
                <motion.form key="phone"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FloatingInput
                    label="رقم الجوال"
                    type="tel"
                    autoComplete="tel"
                    dir="ltr"
                    value={phone}
                    onChange={v => { setPhone(v); setLocalError(''); setOtpSent(false); setDebugOtp(null); }}
                    hasError={hasError}
                  />
                  {otpSent && (
                    <FloatingInput
                      label="رمز التحقق (OTP)"
                      type="text"
                      autoComplete="one-time-code"
                      dir="ltr"
                      value={otp}
                      onChange={v => { setOtp(v.replace(/\D/g, '').slice(0, 6)); setLocalError(''); }}
                      hasError={hasError}
                    />
                  )}
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0, fontFamily: "'Cairo',sans-serif" }}>
                    للطالب وولي الأمر — يُرسل الرمز عبر واتساب
                  </p>
                  {otpSent && (
                    <button type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); setDebugOtp(null); setInfoMsg(''); }}
                      style={{
                        background: 'none', border: 'none', color: '#f5a623', fontSize: 12,
                        fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                      }}>
                      تغيير الرقم / إعادة إرسال
                    </button>
                  )}

                  {(infoMsg || debugOtp) && !hasError && (
                    <div style={{
                      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: 12, padding: '10px 16px', fontSize: 12, fontWeight: 600,
                      color: '#93c5fd', textAlign: 'center', fontFamily: "'Cairo',sans-serif",
                    }}>
                      {infoMsg}
                      {debugOtp && (
                        <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#f5a623', letterSpacing: 4 }}>
                          {debugOtp}
                        </div>
                      )}
                    </div>
                  )}

                  {hasError && (
                    <div style={{
                      background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 600,
                      color: '#f87171', textAlign: 'center', fontFamily: "'Cairo',sans-serif",
                    }}>
                      {localError || error}
                    </div>
                  )}
                  {success && (
                    <div style={{
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.32)',
                      borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700,
                      color: '#4ade80', textAlign: 'center', fontFamily: "'Cairo',sans-serif",
                    }}>
                      ✓ تم الدخول بنجاح، جاري التحويل...
                    </div>
                  )}

                  <RippleButton type="submit" disabled={loading || success || !phone.trim() || (otpSent && otp.length !== 6)}>
                    {loading
                      ? (otpSent ? 'جاري التحقق...' : 'جاري الإرسال...')
                      : (otpSent ? 'تأكيد الرمز والدخول' : 'إرسال رمز واتساب')}
                  </RippleButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
