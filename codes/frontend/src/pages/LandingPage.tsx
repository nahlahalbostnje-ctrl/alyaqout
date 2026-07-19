import { useState, useEffect, useRef, type ReactNode, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, AnimatePresence,
  useScroll, useMotionValue, useSpring,
} from 'framer-motion';
import api from '../services/axios';
import { useLenis } from '../hooks/useLenis';
import BrandLogo from '../components/BrandLogo';

/* ── Types ──────────────────────────────────── */
interface Country    { id: number; name: string; code?: string; }
interface Faq        { id: number; question: string; answer: string; }
interface SocialLink { id: number; platform: string; url: string; }
interface Banner     { id: number; title: string; image_url: string | null; link_url: string | null; }
interface PublicStats { students: number; teachers: number; countries: number; courses: number; }

const CODE_FLAG: Record<string, string> = {
  PS:'🇵🇸', JO:'🇯🇴', EG:'🇪🇬', SA:'🇸🇦', AE:'🇦🇪', KW:'🇰🇼', QA:'🇶🇦', BH:'🇧🇭',
  OM:'🇴🇲', IQ:'🇮🇶', SY:'🇸🇾', LB:'🇱🇧', YE:'🇾🇪', LY:'🇱🇾', SD:'🇸🇩', MA:'🇲🇦', TN:'🇹🇳', DZ:'🇩🇿',
};
const flagFor = (c: Country) => (c.code && CODE_FLAG[c.code.toUpperCase()]) || '🌍';

const C = {
  gold:    '#C59341',
  goldLt:  '#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:  'rgba(197,147,65,0.08)',
  goldBdr: 'rgba(197,147,65,0.22)',
  navy:    '#0D1E3A',
  navy2:   '#142a4e',
  navy3:   '#0a1730',
  bg:      '#F5EDD8',
  card:    '#FFFFFF',
  text:    '#1B2038',
  sub:     '#6B7280',
  dim:     '#9CA3AF',
  border:  '#EDE3CE',
  shadow:  '0 2px 16px rgba(0,0,0,0.06)',
  sub2:    '#A1B1CC',
} as const;

const FONT = "'Cairo','Tajawal',sans-serif";
const SP  = [0.16, 1, 0.3, 1] as const;
const POP = [0.34, 1.56, 0.64, 1] as const;

const SUBJECTS = ['رياضيات','علوم','لغة عربية','لغة إنجليزية','فيزياء','كيمياء','أحياء','تاريخ','جغرافيا','تربية إسلامية'];

const TRUST_LINES = [
  'متابعة يومية لولي الأمر: حضور، درجات، وتقارير واضحة.',
  'حصص مباشرة تفاعلية مع تسجيل للمراجعة.',
  'مساعد ذكي يوجّه الطالب بالتلميح لا بالإجابة الجاهزة.',
  'نقاط ودوري وتحديات تحفّز الالتزام دون تشتيت.',
];

const AUDIENCE = [
  {
    key: 'parent',
    title: 'ولي الأمر',
    desc: 'تابع حضور أبنائك ودرجاتهم وتواصل مع المعلمين من بوابة واحدة.',
    img: '/landing/path-parent.jpg',
    size: '800×600',
  },
  {
    key: 'student',
    title: 'الطالب',
    desc: 'تعلّم بحصص مباشرة، واجبات، نقاط، ودوري يحفّزك كل يوم.',
    img: '/landing/path-student.jpg',
    size: '800×600',
  },
  {
    key: 'teacher',
    title: 'المعلم',
    desc: 'أدِر دوراتك وحصصك وامتحاناتك وطلبات الطوارئ بسهولة.',
    img: '/landing/path-teacher.jpg',
    size: '800×600',
  },
];

const PROOF = [
  { title: 'بث مباشر واضح', desc: 'حصص تفاعلية مع إمكانية الرجوع للمراجعة حسب إعداد الدورة.' },
  { title: 'متابعة الأسرة', desc: 'تقارير وحضور ودرجات تصل لولي الأمر في مكان واحد.' },
  { title: 'تحفيز ذكي', desc: 'نقاط ودوري وتحديات تبني عادة الدراسة دون فوضى.' },
];

const STEPS = [
  { num: '01', title: 'احجز مكانك',  desc: 'أرسل بياناتك عبر النموذج في دقيقتين.' },
  { num: '02', title: 'تواصل معنا',  desc: 'نحدد المستوى والمادة والموعد المناسب.' },
  { num: '03', title: 'ابدأ التعلّم', desc: 'انضم لحصتك المباشرة وانطلق نحو التفوق.' },
];

const STATS_MIN = { students: 50, teachers: 5, countries: 3 };

/* ── Helpers ─────────────────────────────────── */
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div className="fixed top-0 left-0 right-0 z-[9999] origin-left"
      style={{ height: 2, scaleX: scrollYProgress,
        background: `linear-gradient(90deg,${C.navy},${C.gold},${C.goldLt},${C.gold},${C.navy})` }} />
  );
}

function MagBtn({ children, style = {}, onClick, className = '' }: {
  children: ReactNode; style?: CSSProperties; onClick?: () => void; className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 16 });
  const y = useSpring(my, { stiffness: 180, damping: 16 });
  return (
    <motion.button ref={ref} type="button" className={className} onClick={onClick}
      style={{ ...style, x, y, background: style.background ?? C.goldGrad, border: style.border ?? 'none', cursor: 'pointer' }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left - r.width / 2) * 0.12);
        my.set((e.clientY - r.top - r.height / 2) * 0.12);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}>
      {children}
    </motion.button>
  );
}

/** Image with labeled placeholder until the designed asset is uploaded. */
function AssetImg({
  src, alt, sizeLabel, style, className, ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { sizeLabel: string }) {
  const [ok, setOk] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', background: '#1a2a44', ...style }}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          {...rest}
          onLoad={() => setOk(true)}
          onError={() => setFailed(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            opacity: ok ? 1 : 0, transition: 'opacity .4s ease',
          }}
        />
      )}
      {(!ok || failed) && (
        <div style={{
          position: failed || !ok ? 'absolute' : 'relative',
          inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, textAlign: 'center',
          background: 'linear-gradient(145deg,#12233f 0%,#1b3358 50%,#0d1e3a 100%)',
          border: `1px dashed rgba(197,147,65,0.35)`,
        }}>
          <span style={{ color: C.goldLt, fontWeight: 800, fontSize: 13 }}>{alt}</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, direction: 'ltr' }}>{sizeLabel}</span>
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>{src}</span>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub, light = false }: {
  eyebrow: string; title: string; sub?: string; light?: boolean;
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 560, marginInline: 'auto' }}>
      <span style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: 999,
        background: light ? 'rgba(197,147,65,0.12)' : C.goldBg,
        border: `1px solid ${C.goldBdr}`, color: C.gold, fontSize: 12, fontWeight: 700, marginBottom: 12,
      }}>{eyebrow}</span>
      <h2 style={{
        margin: 0, fontSize: 'clamp(1.45rem,3vw,2.1rem)', fontWeight: 900,
        color: light ? '#fff' : C.text, letterSpacing: '-0.02em',
      }}>{title}</h2>
      {sub && (
        <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.7, color: light ? C.sub2 : C.sub }}>{sub}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
export default function LandingPage() {
  useLenis();
  const [countries, setCountries] = useState<Country[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [navCountryId, setNavCountryId] = useState<number | ''>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [source, setSource] = useState<'book_now' | 'free_class'>('book_now');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    country_id: '', student_name: '', phone: '', school: '', region: '', subjects: [] as string[],
  });

  useEffect(() => {
    api.get('/public/countries').then(({ data }) => {
      const list: Country[] = data.countries ?? [];
      setCountries(list);
      if (list[0]) setNavCountryId(list[0].id);
    }).catch(() => {});
    api.get('/public/faqs').then(({ data }) => setFaqs(data.faqs ?? [])).catch(() => {});
    api.get('/public/stats').then(({ data }) => setPublicStats(data.stats ?? null)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!navCountryId) return;
    const q = `?country_id=${navCountryId}`;
    api.get(`/public/banners${q}`).then(({ data }) => setBanners(data.banners ?? [])).catch(() => {});
    api.get(`/public/social${q}`).then(({ data }) => setSocial(data.links ?? [])).catch(() => {});
  }, [navCountryId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const openModal = (src: 'book_now' | 'free_class') => {
    setSource(src); setSuccess('');
    setForm({
      country_id: String(navCountryId || countries[0]?.id || ''),
      student_name: '', phone: '', school: '', region: '', subjects: [],
    });
    setModalOpen(true);
  };

  const toggleSubject = (s: string) =>
    setForm(f => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
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
    ({ facebook: 'f', instagram: 'ig', twitter: 'x', youtube: 'YT', tiktok: 'TK', whatsapp: 'WA', telegram: 'TG', linkedin: 'in' }[p.toLowerCase()] ?? p[0]?.toUpperCase());

  const selectedCountry = countries.find(c => c.id === navCountryId);
  const showLiveStats = !!publicStats && (
    publicStats.students >= STATS_MIN.students ||
    publicStats.teachers >= STATS_MIN.teachers ||
    publicStats.countries >= STATS_MIN.countries
  );

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: FONT }} dir="rtl">
      <ProgressBar />

      {/* ════════ NAV ════════ */}
      <nav style={{
        position: 'fixed', top: 0, insetInline: 0, zIndex: 50,
        background: scrolled ? 'rgba(13,30,58,0.96)' : C.navy,
        backdropFilter: scrolled ? 'blur(12px)' : undefined,
        boxShadow: scrolled ? '0 4px 28px rgba(13,30,58,0.45)' : 'none',
        transition: 'box-shadow 0.35s ease, background 0.35s ease',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BrandLogo size={44} style={{ borderRadius: 10 }} />
            <div style={{ position: 'relative' }}>
              <select
                value={navCountryId}
                onChange={e => setNavCountryId(e.target.value ? Number(e.target.value) : '')}
                aria-label="اختيار الدولة"
                style={{
                  background: 'rgba(255,255,255,0.06)', color: '#fff', border: `1px solid ${C.goldBdr}`,
                  borderRadius: 999, padding: '8px 36px 8px 28px', fontSize: 12.5, fontWeight: 700,
                  fontFamily: FONT, cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 120,
                }}
              >
                {countries.length === 0 && <option value="">لا دول</option>}
                {countries.map(c => (
                  <option key={c.id} value={c.id} style={{ background: C.navy, color: '#fff' }}>
                    {flagFor(c)} {c.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.gold, fontSize: 12, pointerEvents: 'none' }}>
                {selectedCountry ? flagFor(selectedCountry) : '🌍'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {([['المميزات', '#audience'], ['كيف نبدأ؟', '#steps'], ['الأسئلة', '#faqs']] as const).map(([l, h]) => (
              <a key={h} href={h}
                style={{ fontSize: 13.5, fontWeight: 600, color: C.sub2, textDecoration: 'none' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#fff')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = C.sub2)}
              >{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" style={{
              background: C.goldGrad, borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 13.5,
              fontFamily: FONT, padding: '10px 20px', textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(197,147,65,0.4)',
            }}>تسجيل الدخول</Link>
            <button type="button" className="md:hidden" onClick={() => setMenuOpen(m => !m)}
              aria-label="القائمة"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 22, height: 2, background: '#fff', borderRadius: 2,
                  ...(menuOpen ? { transform: i === 0 ? 'rotate(45deg) translate(5px,5px)' : i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'scaleX(0)' } : {}),
                }} />
              ))}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(197,147,65,0.15)' }}>
              <div style={{ padding: '8px 0 16px', display: 'flex', flexDirection: 'column' }}>
                {([['المميزات', '#audience'], ['كيف نبدأ؟', '#steps'], ['الأسئلة', '#faqs']] as const).map(([l, h]) => (
                  <a key={h} href={h} onClick={() => setMenuOpen(false)}
                    style={{ padding: '12px 24px', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>{l}</a>
                ))}
                <div style={{ padding: '8px 24px' }}>
                  <button type="button" onClick={() => { setMenuOpen(false); openModal('book_now'); }}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.goldBdr}`, background: 'transparent', color: C.goldLt, fontWeight: 800, fontFamily: FONT, cursor: 'pointer' }}>
                    احجز مكانك
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ════════ HERO — مزيج خلفية صف + واجهة ════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'flex-end',
        overflow: 'hidden', paddingTop: 68,
      }}>
        <AssetImg
          src={isMobile ? '/landing/hero-bg-mobile.jpg' : '/landing/hero-bg.jpg'}
          alt="هيرو — صف وطلاب"
          sizeLabel={isMobile ? '1080×1920' : '1920×1080'}
          style={{ position: 'absolute', inset: 0 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(10,23,48,0.88) 0%, rgba(13,30,58,0.72) 42%, rgba(13,30,58,0.45) 70%, rgba(13,30,58,0.55) 100%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, margin: '0 auto',
          padding: isMobile ? '48px 20px 56px' : '64px 32px 72px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr',
          gap: isMobile ? 36 : 48, alignItems: 'end',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SP }}
          >
            <div style={{ marginBottom: 18 }}>
              <BrandLogo size={isMobile ? 72 : 96} style={{
                filter: 'drop-shadow(0 8px 28px rgba(197,147,65,0.35))',
              }} />
            </div>
            <h1 style={{
              margin: '0 0 14px', fontSize: 'clamp(2rem,4.2vw,3.4rem)', fontWeight: 900,
              lineHeight: 1.15, color: '#fff', letterSpacing: '-0.03em', maxWidth: 520,
            }}>
              تعلّم بثقة.<br />
              <span style={{
                background: C.goldGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>تابع بوضوح.</span>
            </h1>
            <p style={{
              margin: '0 0 28px', fontSize: 15.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)',
              maxWidth: 440, fontWeight: 400,
            }}>
              حصص مباشرة، متابعة لولي الأمر، ومساعد ذكي — في منصة عربية واحدة.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <MagBtn
                style={{ color: '#fff', padding: '14px 32px', fontSize: 15, fontWeight: 800, fontFamily: FONT, borderRadius: 14 }}
                onClick={() => openModal('book_now')}
              >احجز مكانك الآن</MagBtn>
              <button type="button" onClick={() => openModal('free_class')}
                style={{
                  padding: '14px 28px', fontSize: 15, fontWeight: 700, fontFamily: FONT, borderRadius: 14,
                  border: '1.5px solid rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.06)',
                  color: '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)',
                }}>اطلب حصة مجانية</button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: SP, delay: 0.15 }}
            style={{ position: 'relative' }}
          >
            <div style={{
              position: 'absolute', inset: '-8% -6%', borderRadius: '40% 60% 50% 50%',
              background: 'radial-gradient(circle, rgba(197,147,65,0.28) 0%, transparent 68%)',
              pointerEvents: 'none',
            }} />
            <AssetImg
              src="/landing/hero-ui.png"
              alt="واجهة منصة الياقوت"
              sizeLabel="1200×750"
              style={{
                width: '100%', aspectRatio: '16 / 10', borderRadius: 18,
                boxShadow: '0 28px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(197,147,65,0.25)',
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ════════ TRUST ════════ */}
      <section style={{ background: C.bg, padding: '28px 24px 8px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 10,
          }}>
            {TRUST_LINES.map((t, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '14px 16px', background: C.card, borderRadius: 14,
                border: `1px solid ${C.border}`, boxShadow: C.shadow,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: C.gold,
                  marginTop: 7, flexShrink: 0,
                }} />
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: C.text, fontWeight: 600 }}>{t}</p>
              </div>
            ))}
          </div>

          {showLiveStats && publicStats && (
            <div style={{
              marginTop: 16, display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
              gap: 10,
            }}>
              {[
                { v: publicStats.students, l: 'طالب مسجّل' },
                { v: publicStats.teachers, l: 'معلم' },
                { v: publicStats.countries, l: 'دولة نشطة' },
                { v: publicStats.courses, l: 'دورة نشطة' },
              ].map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '16px 8px', background: C.card,
                  borderRadius: 14, border: `1px solid ${C.border}`,
                }}>
                  <p style={{
                    margin: 0, fontSize: 22, fontWeight: 900,
                    background: C.goldGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.v}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: C.sub, fontWeight: 600 }}>{s.l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ AUDIENCE PATHS ════════ */}
      <section id="audience" style={{ background: C.bg, padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionTitle
            eyebrow="لمن الياقوت؟"
            title="ثلاث بوابات… هدف واحد"
            sub="اختر دورك — المنصة مصممة لكل طرف بما يحتاجه فعلاً."
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {AUDIENCE.map((a, i) => (
              <motion.div key={a.key}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.08, ease: SP }}
                style={{ background: C.card, borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: C.shadow }}
              >
                <AssetImg src={a.img} alt={a.title} sizeLabel={a.size} style={{ width: '100%', aspectRatio: '4 / 3' }} />
                <div style={{ padding: '18px 18px 20px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: C.text }}>{a.title}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.sub }}>{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ PRODUCT PROOF ════════ */}
      <section id="features" style={{ background: C.navy, padding: '64px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionTitle
            light
            eyebrow="داخل المنصة"
            title="ما يحدث فعلاً بعد التسجيل"
            sub="بث، متابعة، وتحفيز — بلا قائمة ميزات مزدحمة."
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
            gap: 28, alignItems: 'center',
          }}>
            <AssetImg
              src="/landing/product-proof.jpg"
              alt="إثبات المنتج"
              sizeLabel="1440×900"
              style={{ width: '100%', aspectRatio: '16 / 10', borderRadius: 18 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PROOF.map((p, i) => (
                <div key={i} style={{
                  padding: '16px 18px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,147,65,0.18)',
                }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 15.5, fontWeight: 800, color: '#fff' }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.sub2 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ BANNERS ════════ */}
      {banners.length > 0 && (
        <section style={{ background: C.bg, padding: '32px 24px 8px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {banners.map(b => (
              <a key={b.id} href={b.link_url || '#'}
                style={{ display: 'block', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, textDecoration: 'none' }}>
                {b.image_url ? (
                  <img src={b.image_url} alt={b.title} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ padding: 24, background: C.card, color: C.text, fontWeight: 800, textAlign: 'center' }}>{b.title}</div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ════════ STEPS ════════ */}
      <section id="steps" style={{ background: C.bg, padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <SectionTitle eyebrow="كيف نبدأ؟" title="ثلاث خطوات فقط" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 6px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', border: `2px solid ${C.gold}`,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: C.gold, marginBottom: 14, fontSize: 16,
                }}>{s.num}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: C.text }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.sub }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <MagBtn
              style={{ background: C.navy, color: '#fff', padding: '14px 36px', borderRadius: 14, fontWeight: 800, fontSize: 15, fontFamily: FONT }}
              onClick={() => openModal('book_now')}
            >ابدأ رحلتك الآن</MagBtn>
          </div>
        </div>
      </section>

      {/* ════════ FAQs ════════ */}
      <section id="faqs" style={{ background: C.bg, padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionTitle eyebrow="لديك سؤال؟" title="الأسئلة الشائعة" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.length === 0 && (
              <p style={{ textAlign: 'center', color: C.sub, fontSize: 14 }}>لا توجد أسئلة شائعة حالياً.</p>
            )}
            {faqs.map((faq, i) => (
              <div key={faq.id} style={{
                background: C.card, borderRadius: 14, overflow: 'hidden',
                border: `1px solid ${openFaq === i ? C.goldBdr : C.border}`,
              }}>
                <button type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 18px', textAlign: 'right', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: FONT,
                  }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{faq.question}</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginInlineStart: 12,
                    display: 'grid', placeItems: 'center', fontSize: 18,
                    background: openFaq === i ? C.goldGrad : 'transparent',
                    border: `1.5px solid ${openFaq === i ? C.gold : C.border}`,
                    color: openFaq === i ? '#fff' : C.gold,
                  }}>+</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <p style={{ padding: '0 18px 16px', margin: 0, fontSize: 13.5, lineHeight: 1.8, color: C.sub }}>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section style={{ background: C.bg, padding: '0 24px 64px' }}>
        <div style={{
          maxWidth: 960, margin: '0 auto', borderRadius: 24, padding: isMobile ? '36px 20px' : '48px 40px',
          textAlign: 'center', background: `linear-gradient(135deg,${C.gold},#E9C988,${C.goldLt})`,
        }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: C.navy }}>
            جاهز للانطلاق؟
          </h2>
          <p style={{ margin: '0 0 22px', fontSize: 14.5, color: 'rgba(13,30,58,0.65)' }}>
            اطلب حصتك التجريبية المجانية — وسنتواصل معك لتحديد الموعد.
          </p>
          <MagBtn
            style={{ background: C.navy, color: '#fff', padding: '14px 36px', borderRadius: 14, fontWeight: 800, fontSize: 15, fontFamily: FONT }}
            onClick={() => openModal('free_class')}
          >اطلب حصتك المجانية</MagBtn>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ background: C.navy, padding: '44px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 28 }}>
            <BrandLogo size={44} style={{ borderRadius: 10 }} />
            {social.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {social.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center',
                      border: `1px solid ${C.goldBdr}`, color: 'rgba(255,255,255,0.55)', fontSize: 11,
                      fontWeight: 800, textDecoration: 'none',
                    }}>{socialIcon(s.platform)}</a>
                ))}
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid rgba(197,147,65,0.15)', paddingTop: 20 }}>
            <p style={{ margin: 0, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} منصة الياقوت لخدمات التعليم — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>

      {/* ════════ LEAD MODAL ════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9990, backdropFilter: 'blur(18px)', background: 'rgba(13,30,58,0.82)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
            <motion.div
              style={{
                width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
                background: C.card, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow,
              }}
              initial={{ scale: 0.9, opacity: 0, y: 28 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ duration: 0.32, ease: POP }} dir="rtl"
            >
              <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: C.text }}>
                    {source === 'book_now' ? 'احجز مكانك' : 'الحصة المجانية'}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: C.sub }}>أكمل بياناتك وسنتواصل معك قريباً</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: 26, color: C.dim, cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ padding: 22 }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '28px 0' }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{success}</p>
                    <button type="button" onClick={() => setModalOpen(false)}
                      style={{ marginTop: 18, padding: '11px 28px', borderRadius: 12, background: C.goldGrad, border: 'none', color: '#fff', fontWeight: 800, fontFamily: FONT, cursor: 'pointer' }}>
                      إغلاق
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'الاسم الكامل *', key: 'student_name', type: 'text', ph: 'اسم الطالب الكامل', req: true },
                      { label: 'رقم الهاتف *', key: 'phone', type: 'tel', ph: '07xxxxxxxx', req: true, ltr: true },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>{f.label}</label>
                        <input type={f.type} required={f.req}
                          value={form[f.key as keyof typeof form] as string}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.ph} dir={f.ltr ? 'ltr' : undefined}
                          style={{
                            width: '100%', height: 44, borderRadius: 12, padding: '0 14px',
                            border: `1.5px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: FONT,
                            outline: 'none', boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}
                    {countries.length > 0 && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>الدولة *</label>
                        <select required value={form.country_id}
                          onChange={e => setForm(p => ({ ...p, country_id: e.target.value }))}
                          style={{
                            width: '100%', height: 44, borderRadius: 12, padding: '0 14px',
                            border: `1.5px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: FONT,
                            background: '#fff', boxSizing: 'border-box',
                          }}>
                          <option value="">اختر الدولة</option>
                          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { label: 'المدرسة', key: 'school', ph: 'اسم المدرسة' },
                        { label: 'المنطقة', key: 'region', ph: 'المنطقة السكنية' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>{f.label}</label>
                          <input type="text"
                            value={form[f.key as keyof typeof form] as string}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.ph}
                            style={{
                              width: '100%', height: 44, borderRadius: 12, padding: '0 12px',
                              border: `1.5px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: FONT,
                              outline: 'none', boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 8 }}>المواد المطلوبة</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {SUBJECTS.map(s => (
                          <button type="button" key={s} onClick={() => toggleSubject(s)}
                            style={{
                              padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: 'none',
                              cursor: 'pointer', fontFamily: FONT,
                              ...(form.subjects.includes(s)
                                ? { background: C.goldGrad, color: '#fff' }
                                : { background: '#F3F4F6', color: C.sub }),
                            }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={submitting}
                      style={{
                        padding: 13, borderRadius: 13, background: C.goldGrad, border: 'none', color: '#fff',
                        fontWeight: 800, fontSize: 14, cursor: submitting ? 'wait' : 'pointer', fontFamily: FONT,
                        opacity: submitting ? 0.75 : 1, marginTop: 4,
                      }}>
                      {submitting ? 'جاري الإرسال...' : (source === 'book_now' ? 'احجز الآن' : 'اطلب الحصة المجانية')}
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
