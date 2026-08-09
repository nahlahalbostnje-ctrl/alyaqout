import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import api from '../services/axios';
import { useLenis } from '../hooks/useLenis';
import BrandLogo from '../components/BrandLogo';
import { C as ThemeC, brand } from '../theme/palette';
import { enterVisitorMode } from '../features/visitor/visitorMode';

/* ── Types ──────────────────────────────────── */
interface Country { id: number; name: string; code?: string }
interface Faq { id: number; question: string; answer: string }
interface SocialLink { id: number; platform: string; url: string }
interface Banner { id: number; title: string; image_url: string | null; link_url: string | null }
interface PublicStats { students: number; teachers: number; countries: number; courses: number }
interface PubCourse {
  id: number; title: string; thumbnail: string | null; teacher_name?: string;
  grade_name?: string; lessons_count: number; type: string; rating: number | null;
}
interface PubTeacher { id: number; name: string; subjects: string[]; courses_count: number }
interface PubLive {
  id: number; title: string; status: string; scheduled_at: string | null;
  teacher_name?: string; subject_name?: string;
}
interface PubRank { rank: number; name: string; points: number; level: number }
interface PubChallenge { id: number; title: string; description?: string | null; category?: string | null }

const CODE_FLAG: Record<string, string> = {
  PS: '🇵🇸', JO: '🇯🇴', EG: '🇪🇬', SA: '🇸🇦', AE: '🇦🇪', KW: '🇰🇼', QA: '🇶🇦', BH: '🇧🇭',
  OM: '🇴🇲', IQ: '🇮🇶', SY: '🇸🇾', LB: '🇱🇧', YE: '🇾🇪', LY: '🇱🇾', SD: '🇸🇩', MA: '🇲🇦', TN: '🇹🇳', DZ: '🇩🇿',
};
const flagFor = (c: Country) => (c.code && CODE_FLAG[c.code.toUpperCase()]) || '🌍';

const C = { ...ThemeC, goldLt: ThemeC.goldL, sub2: ThemeC.dim };
const FONT = "'Cairo','Tajawal',sans-serif";
const SP = [0.16, 1, 0.3, 1] as const;
const STATS_MIN = { students: 50, teachers: 5, countries: 3 };

const NAV_LINKS = [
  ['الرئيسية', '#top'],
  ['المميزات', '#features'],
  ['الدورات', '#courses'],
  ['المعلمون', '#teachers'],
  ['التحديات والجوائز', '#challenges'],
  ['عن الياقوت', '#about'],
] as const;

const WHY = [
  { icon: '🎥', t: 'الحصص المباشرة', d: 'تعلم بشكل تفاعلي مع المعلمين.' },
  { icon: '🤖', t: 'المعلم الذكي', d: 'مساعد ذكي يساعد الطالب أثناء الدراسة.' },
  { icon: '📚', t: 'المكتبة التعليمية', d: 'مصادر وملفات تعليمية منظمة.' },
  { icon: '📝', t: 'بنك الامتحانات', d: 'اختبارات وأسئلة وسنوات سابقة.' },
  { icon: '🏆', t: 'التحديات والجوائز', d: 'تعلم، نافس، اجمع النقاط واربح.' },
  { icon: '📊', t: 'المتابعة الأكاديمية', d: 'تابع تقدمك ومستواك باستمرار.' },
];

const AUDIENCE = [
  { icon: '👨‍🎓', t: 'الطالب', d: 'دورات، حصص، واجبات، امتحانات، نقاط، تحديات.', cta: 'بوابة الطالب', to: '/register' },
  { icon: '👨‍👩‍👧', t: 'ولي الأمر', d: 'متابعة المستوى والحضور والواجبات والاشتراكات والفواتير.', cta: 'بوابة ولي الأمر', to: '/register' },
  { icon: '👨‍🏫', t: 'المعلم', d: 'إدارة الدورات والحصص والمحتوى والطلاب.', cta: 'بوابة المعلم', to: '/login' },
  { icon: '👁', t: 'الزائر', d: 'استكشف المنصة قبل إنشاء حساب.', cta: 'استكشف كزائر', to: '/explore' },
];

const STEPS = [
  { n: '01', t: 'أنشئ حسابك' },
  { n: '02', t: 'اختر مسارك' },
  { n: '03', t: 'ابدأ الدروس والحصص' },
  { n: '04', t: 'تابع تقدمك' },
  { n: '05', t: 'حقق النقاط والجوائز' },
];

const GAME = [
  { icon: '⭐', t: 'النقاط', d: 'اكسب نقاطاً من الحضور والواجبات والإنجازات.' },
  { icon: '🏅', t: 'المستويات', d: 'ارتقِ بمستواك مع كل تقدم حقيقي.' },
  { icon: '🔥', t: 'سلسلة الأيام', d: 'حافظ على التزامك اليومي في الدراسة.' },
  { icon: '🏆', t: 'لوحة المتصدرين', d: 'نافس زملاءك بشفافية وعدالة.' },
  { icon: '🎁', t: 'المكافآت', d: 'حوّل إنجازك إلى جوائز وفق نظام المنصة.' },
];

const SUBJECTS = ['رياضيات', 'علوم', 'لغة عربية', 'لغة إنجليزية', 'فيزياء', 'كيمياء'];

const FALLBACK_FAQS: Faq[] = [
  { id: -1, question: 'هل التسجيل مجاني؟', answer: 'طلب إنشاء الحساب مجاني. الاشتراك والباقات تُدار عبر الإدارة حسب باقتك.' },
  { id: -2, question: 'هل يمكن الدخول كزائر؟', answer: 'نعم. استخدم «دخول كزائر» لاستكشاف الدورات والمعلمين والحصص دون حساب.' },
  { id: -3, question: 'هل يوجد حساب لولي الأمر؟', answer: 'نعم. لولي الأمر بوابة مستقلة لمتابعة الأبناء والاشتراكات والفواتير.' },
  { id: -4, question: 'كيف تعمل الاشتراكات؟', answer: 'الاشتراك يُفعَّل إدارياً. تظهر حالته وتواريخه في حساب الطالب وولي الأمر.' },
  { id: -5, question: 'أين أجد الفواتير؟', answer: 'في بوابة ولي الأمر ضمن «الاشتراك والفواتير» — بدون دفع إلكتروني حالياً.' },
  { id: -6, question: 'كيف أتواصل مع الإدارة؟', answer: 'بعد التسجيل عبر قنوات التواصل داخل المنصة، أو اترك بياناتك عبر نموذج الطلب.' },
];

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] origin-left"
      style={{
        height: 2, scaleX: scrollYProgress,
        background: `linear-gradient(90deg,${C.bg},${C.primary},${brand.gold},${C.primary},${C.bg})`,
      }}
    />
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 640, marginInline: 'auto' }}>
      <h2 style={{
        margin: 0, fontSize: 'clamp(1.45rem,3vw,2.15rem)', fontWeight: 900,
        color: C.text, letterSpacing: '-0.02em',
      }}>{title}</h2>
      {sub && <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.75, color: C.sub }}>{sub}</p>}
    </div>
  );
}

function Fade({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: SP }}
    >
      {children}
    </motion.div>
  );
}

function pad(style?: CSSProperties): CSSProperties {
  return { maxWidth: 1200, margin: '0 auto', padding: '64px 20px', ...style };
}

function btnPrimary(extra?: CSSProperties): CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
    background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 14,
    fontFamily: FONT, textDecoration: 'none', boxShadow: '0 6px 20px rgba(59,130,160,0.3)',
    ...extra,
  };
}

function btnGhost(extra?: CSSProperties): CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 18px', borderRadius: 14, cursor: 'pointer',
    background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800, fontSize: 14,
    fontFamily: FONT, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)',
    ...extra,
  };
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p style={{
      margin: 0, padding: '22px 16px', textAlign: 'center', color: C.sub, fontSize: 13.5,
      background: C.card, borderRadius: 16, border: `1px dashed ${C.border}`,
    }}>{children}</p>
  );
}

function HeroMock() {
  const floats = [
    { t: '🎥 حصة مباشرة الآن', top: '8%', right: '-4%', delay: 0 },
    { t: '🏆 +50 نقطة', top: '28%', left: '-6%', delay: 0.2 },
    { t: '📚 دورة جديدة', bottom: '28%', right: '-8%', delay: 0.35 },
    { t: '🎯 هدف اليوم مكتمل', bottom: '10%', left: '-2%', delay: 0.5 },
    { t: '📈 مستوى الطالب', top: '48%', right: '6%', delay: 0.15 },
  ];
  return (
    <div style={{ position: 'relative', minHeight: 340 }}>
      <div style={{
        background: 'linear-gradient(160deg,#FFFFFF 0%,#F0F6F9 100%)',
        borderRadius: 22, border: `1px solid ${C.border}`, boxShadow: C.shadowLg,
        padding: 16, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['#E07A7A', '#C9A227', '#6FAF8A'].map(c => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ marginInlineStart: 8, fontSize: 11, fontWeight: 700, color: C.sub }}>لوحة الطالب</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
          <div style={{ background: C.bg, borderRadius: 14, padding: 12, border: `1px solid ${C.border}` }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 800, color: C.navy }}>اليوم</p>
            {['حضور الحصة', 'واجب الرياضيات', 'مراجعة'].map((x, i) => (
              <div key={x} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 11, color: C.sub }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 5, background: i < 2 ? C.greenBg : C.goldBg,
                  color: i < 2 ? C.green : C.primary, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900,
                }}>{i < 2 ? '✓' : '○'}</span>
                {x}
              </div>
            ))}
          </div>
          <div style={{ background: `linear-gradient(135deg,${C.navy},${C.primary})`, borderRadius: 14, padding: 14, color: '#fff' }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, opacity: 0.75 }}>حصة مباشرة</p>
            <p style={{ margin: '0 0 10px', fontWeight: 900, fontSize: 15 }}>الرياضيات — الهندسة</p>
            <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '35%' }} animate={{ width: '72%' }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse' }}
                style={{ height: '100%', background: brand.gold }}
              />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 11, opacity: 0.8 }}>التقدم الدراسي هذا الأسبوع</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 10 }}>
          {[['نقاط', '—'], ['دورات', '—'], ['حضور', '—']].map(([k]) => (
            <div key={k} style={{ background: C.bg, borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 10, color: C.dim }}>{k}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 900, color: C.primary }}>حيّ</p>
            </div>
          ))}
        </div>
      </div>
      {floats.map((f, i) => (
        <motion.div
          key={f.t}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{ delay: f.delay, duration: 3.2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: f.top, bottom: f.bottom, left: f.left, right: f.right,
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '8px 12px', fontSize: 12, fontWeight: 800, color: C.navy,
            boxShadow: '0 8px 24px rgba(36,55,70,0.12)', whiteSpace: 'nowrap',
          }}
        >
          {f.t}
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  useLenis();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [courses, setCourses] = useState<PubCourse[]>([]);
  const [teachers, setTeachers] = useState<PubTeacher[]>([]);
  const [lives, setLives] = useState<PubLive[]>([]);
  const [board, setBoard] = useState<PubRank[]>([]);
  const [challenges, setChallenges] = useState<PubChallenge[]>([]);
  const [navCountryId, setNavCountryId] = useState<number | ''>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [source, setSource] = useState<'book_now' | 'free_class' | 'try_free'>('book_now');
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
    const q = navCountryId ? `?country_id=${navCountryId}&limit=6` : '?limit=6';
    const q10 = navCountryId ? `?country_id=${navCountryId}&limit=10` : '?limit=10';
    const bq = navCountryId ? `?country_id=${navCountryId}` : '';
    api.get(`/public/banners${bq}`).then(({ data }) => setBanners(data.banners ?? [])).catch(() => {});
    api.get(`/public/social${bq}`).then(({ data }) => setSocial(data.links ?? [])).catch(() => {});
    api.get(`/public/courses${q}`).then(({ data }) => setCourses(data.courses ?? [])).catch(() => {});
    api.get(`/public/teachers${q}`).then(({ data }) => setTeachers(data.teachers ?? [])).catch(() => {});
    api.get(`/public/live-classes${q}`).then(({ data }) => setLives(data.live_classes ?? [])).catch(() => {});
    api.get(`/public/leaderboard${q10}`).then(({ data }) => setBoard(data.leaderboard ?? [])).catch(() => {});
    api.get(`/public/challenges${q}`).then(({ data }) => setChallenges(data.challenges ?? [])).catch(() => {});
  }, [navCountryId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const goVisitor = () => {
    enterVisitorMode();
    navigate('/explore');
  };

  const openModal = (src: 'book_now' | 'free_class' | 'try_free') => {
    setSource(src);
    setSuccess('');
    setForm({
      country_id: String(navCountryId || countries[0]?.id || ''),
      student_name: '', phone: '', school: '', region: '', subjects: [],
    });
    setModalOpen(true);
  };

  const toggleSubject = (s: string) =>
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s],
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/leads', {
        ...form,
        country_id: Number(form.country_id),
        source: source === 'try_free' ? 'try_free' : source,
      });
      setSuccess(data.message);
    } catch {
      setSuccess('حدث خطأ، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCountry = countries.find(c => c.id === navCountryId);
  const showLiveStats = !!publicStats && (
    publicStats.students >= STATS_MIN.students
    || publicStats.teachers >= STATS_MIN.teachers
    || publicStats.countries >= STATS_MIN.countries
  );
  const faqList = faqs.length > 0 ? faqs : FALLBACK_FAQS;
  const socialIcon = (p: string) =>
    ({ facebook: 'f', instagram: 'ig', twitter: 'x', youtube: 'YT', tiktok: 'TK', whatsapp: 'WA' }[p.toLowerCase()] ?? p[0]?.toUpperCase());

  const navText = scrolled ? C.sub : 'rgba(255,255,255,0.9)';

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: FONT, background: C.bg }} dir="rtl" id="top">
      <ProgressBar />

      {/* HEADER */}
      <nav style={{
        position: 'fixed', top: 0, insetInline: 0, zIndex: 50,
        background: scrolled ? 'rgba(247,249,250,0.97)' : 'linear-gradient(180deg,rgba(47,106,132,0.95),rgba(59,130,160,0.55))',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 4px 20px rgba(36,55,70,0.08)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
        transition: 'background .3s ease',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70, gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <BrandLogo size={42} style={{ borderRadius: 10, flexShrink: 0 }} />
            {!isMobile && (
              <div>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: scrolled ? C.text : '#fff', whiteSpace: 'nowrap' }}>
                  منصة الياقوت لخدمات التعليم
                </p>
              </div>
            )}
            <select
              value={navCountryId}
              onChange={e => setNavCountryId(e.target.value ? Number(e.target.value) : '')}
              aria-label="اختيار الدولة"
              style={{
                background: scrolled ? C.card : 'rgba(255,255,255,0.14)',
                color: scrolled ? C.text : '#fff',
                border: `1px solid ${scrolled ? C.border : 'rgba(255,255,255,0.28)'}`,
                borderRadius: 999, padding: '7px 12px', fontSize: 12, fontWeight: 700,
                fontFamily: FONT, cursor: 'pointer', outline: 'none', maxWidth: 120,
              }}
            >
              {countries.map(c => (
                <option key={c.id} value={c.id} style={{ color: C.text, background: '#fff' }}>
                  {flagFor(c)} {c.name}
                </option>
              ))}
            </select>
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {NAV_LINKS.map(([l, h]) => (
                <a key={h} href={h} style={{ fontSize: 13, fontWeight: 600, color: navText, textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isMobile && (
              <>
                <Link to="/login" style={{
                  ...btnGhost({ padding: '8px 12px', fontSize: 12.5 }),
                  ...(scrolled ? { background: C.card, color: C.text, border: `1px solid ${C.border}` } : {}),
                }}>تسجيل الدخول</Link>
                <Link to="/register" style={btnPrimary({ padding: '8px 12px', fontSize: 12.5 })}>إنشاء حساب</Link>
                <button type="button" onClick={goVisitor} style={{
                  ...btnGhost({ padding: '8px 12px', fontSize: 12.5, background: scrolled ? 'rgba(197,147,65,0.12)' : 'rgba(255,255,255,0.18)', color: scrolled ? brand.gold : '#fff', border: `1px solid ${scrolled ? 'rgba(197,147,65,0.35)' : 'rgba(255,255,255,0.4)'}` }),
                }}>👁 دخول كزائر</button>
              </>
            )}
            {isMobile && (
              <button type="button" aria-label="القائمة" onClick={() => setMenuOpen(m => !m)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                <div style={{ width: 22, height: 2, background: scrolled ? C.text : '#fff', marginBottom: 5, borderRadius: 2 }} />
                <div style={{ width: 22, height: 2, background: scrolled ? C.text : '#fff', marginBottom: 5, borderRadius: 2 }} />
                <div style={{ width: 22, height: 2, background: scrolled ? C.text : '#fff', borderRadius: 2 }} />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', background: C.card, borderTop: `1px solid ${C.border}` }}>
              <div style={{ padding: '8px 0 16px', display: 'flex', flexDirection: 'column' }}>
                {NAV_LINKS.map(([l, h]) => (
                  <a key={h} href={h} onClick={() => setMenuOpen(false)}
                    style={{ padding: '12px 20px', color: C.text, textDecoration: 'none', fontWeight: 600 }}>{l}</a>
                ))}
                <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to="/login" onClick={() => setMenuOpen(false)} style={btnGhost({ background: C.bg, color: C.text, border: `1px solid ${C.border}` })}>تسجيل الدخول</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} style={btnPrimary()}>إنشاء حساب</Link>
                  <button type="button" onClick={() => { setMenuOpen(false); goVisitor(); }} style={btnPrimary({ background: brand.goldGrad })}>👁 دخول كزائر</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '100vh', paddingTop: 70, overflow: 'hidden',
        background: 'linear-gradient(135deg,#1E3A4C 0%,#2F6A84 42%,#3B82A0 78%,#78B7C9 100%)',
      }}>
        <div style={{
          ...pad({ paddingTop: isMobile ? 40 : 56, paddingBottom: isMobile ? 48 : 64 }),
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr',
          gap: isMobile ? 40 : 48, alignItems: 'center',
        }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: SP }}>
            <BrandLogo size={isMobile ? 64 : 84} style={{ marginBottom: 16, filter: 'drop-shadow(0 8px 24px rgba(197,147,65,0.35))' }} />
            <h1 style={{
              margin: '0 0 14px', fontSize: 'clamp(2.1rem,4.5vw,3.5rem)', fontWeight: 900,
              lineHeight: 1.15, color: '#fff', letterSpacing: '-0.03em',
            }}>
              تعلّم بثقة.<br />
              <span style={{ color: brand.goldL }}>تابع بوضوح.</span>
            </h1>
            <p style={{ margin: '0 0 26px', fontSize: 15.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.78)', maxWidth: 480 }}>
              منصة تعليمية متكاملة تجمع بين الحصص المباشرة، الدورات، المتابعة الأكاديمية، الذكاء الاصطناعي، التحديات والجوائز في مكان واحد.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/register" style={btnPrimary({ padding: '14px 22px', fontSize: 15 })}>🔵 ابدأ رحلتك الآن</Link>
              <button type="button" onClick={goVisitor} style={btnGhost({ padding: '14px 22px', fontSize: 15 })}>👁 دخول كزائر</button>
              <button type="button" onClick={() => openModal('try_free')} style={btnGhost({ padding: '14px 22px', fontSize: 15, background: 'rgba(197,147,65,0.2)', borderColor: 'rgba(197,147,65,0.5)' })}>
                🎁 جرّب مجاناً
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: SP }}>
            <HeroMock />
          </motion.div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ background: '#fff', borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          ...pad({ paddingTop: 28, paddingBottom: 28 }),
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18,
        }}>
          {(showLiveStats && publicStats
            ? [
                publicStats.teachers > 0 ? `+${publicStats.teachers} معلماً` : null,
                publicStats.courses > 0 ? `+${publicStats.courses} دورة` : null,
                'حصص مباشرة تفاعلية',
                'مكتبة تعليمية',
                'متابعة أكاديمية',
              ]
            : ['حصص مباشرة تفاعلية', 'مكتبة تعليمية', 'متابعة أكاديمية', 'معلم ذكي', 'تحديات وجوائز']
          ).filter(Boolean).map(label => (
            <span key={String(label)} style={{
              padding: '10px 16px', borderRadius: 999, background: C.goldBg, color: C.primary,
              fontWeight: 800, fontSize: 13, border: `1px solid ${C.goldBdr}`,
            }}>{label}</span>
          ))}
        </div>
      </section>

      {banners.length > 0 && (
        <section style={pad({ paddingTop: 24, paddingBottom: 8 })}>
          <div style={{ display: 'grid', gap: 12 }}>
            {banners.slice(0, 2).map(b => (
              <a key={b.id} href={b.link_url || '#'} style={{ display: 'block', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                {b.image_url
                  ? <img src={b.image_url} alt={b.title} loading="lazy" style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }} />
                  : <div style={{ padding: 20, background: C.goldBg, fontWeight: 800, color: C.primary }}>{b.title}</div>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* WHY */}
      <section id="features" style={pad()}>
        <Fade><SectionTitle title="أكثر من منصة تعليمية" sub="تجربة تعليمية متكاملة تساعد الطالب على التعلم والمتابعة والمنافسة وتحقيق أهدافه." /></Fade>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {WHY.map((w, i) => (
            <Fade key={w.t} delay={i * 0.05}>
              <div style={{ background: C.card, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, height: '100%' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{w.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 900, color: C.text }}>{w.t}</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: C.sub }}>{w.d}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* AUDIENCE */}
      <section id="audience" style={{ ...pad(), background: '#fff' }}>
        <Fade><SectionTitle title="تجربة مختلفة لكل مستخدم" /></Fade>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 14 }}>
          {AUDIENCE.map((a, i) => (
            <Fade key={a.t} delay={i * 0.05}>
              <div style={{ background: C.bg, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 16 }}>{a.t}</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: C.sub, lineHeight: 1.7, flex: 1 }}>{a.d}</p>
                {a.to === '/explore'
                  ? <button type="button" onClick={goVisitor} style={btnPrimary({ width: '100%' })}>{a.cta}</button>
                  : <Link to={a.to} style={btnPrimary({ width: '100%' })}>{a.cta}</Link>}
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" style={pad()}>
        <Fade><SectionTitle title="اكتشف دوراتك القادمة" /></Fade>
        {courses.length === 0 ? (
          <EmptyNote>لا توجد دورات معروضة حالياً حسب بيانات المنصة.</EmptyNote>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
            {courses.map(c => (
              <div key={c.id} style={{ background: C.card, borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                <div style={{
                  height: 130,
                  background: c.thumbnail ? `center/cover url(${c.thumbnail})` : `linear-gradient(135deg,${C.primary},${C.primarySoft})`,
                }} />
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 900 }}>{c.title}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 12.5, color: C.sub }}>
                    {c.teacher_name || '—'} · {c.grade_name || '—'} · {c.lessons_count} دروس
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, background: C.goldBg, padding: '3px 8px', borderRadius: 999 }}>
                      {c.type === 'live' ? 'مباشرة' : 'مسجّلة'}
                    </span>
                    {c.rating != null && <span style={{ fontSize: 12, color: brand.gold, fontWeight: 700 }}>★ {c.rating}</span>}
                  </div>
                  <button type="button" onClick={goVisitor} style={btnPrimary({ width: '100%', padding: '10px' })}>استكشاف</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button type="button" onClick={goVisitor} style={btnGhost({ background: C.card, color: C.primary, border: `1px solid ${C.goldBdr}` })}>
            عرض جميع الدورات
          </button>
        </div>
      </section>

      {/* LIVE */}
      <section id="live" style={{ ...pad(), background: '#fff' }}>
        <Fade><SectionTitle title="🔴 حصص مباشرة" /></Fade>
        {lives.length === 0 ? (
          <EmptyNote>لا توجد حصص مباشرة حالياً، يمكنك استعراض جدول الحصص القادمة لاحقاً أو الدخول كزائر.</EmptyNote>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {lives.map(lc => (
              <div key={lc.id} style={{ background: C.bg, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>{lc.subject_name || lc.title}</h3>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                    background: lc.status === 'live' ? C.redBg : C.amberBg,
                    color: lc.status === 'live' ? C.red : C.amber,
                  }}>{lc.status === 'live' ? 'مباشر الآن' : 'قادمة'}</span>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 12.5, color: C.sub }}>
                  {lc.teacher_name || '—'}
                  {lc.scheduled_at ? ` · ${new Date(lc.scheduled_at).toLocaleString('ar')}` : ''}
                </p>
                <button type="button" onClick={goVisitor} style={btnPrimary({ width: '100%', padding: '10px' })}>دخول الحصة</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TEACHERS */}
      <section id="teachers" style={pad()}>
        <Fade><SectionTitle title="تعلّم على يد معلمين مميزين" /></Fade>
        {teachers.length === 0 ? (
          <EmptyNote>لا يوجد معلمون معروضون حالياً.</EmptyNote>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 14 }}>
            {teachers.map(t => (
              <div key={t.id} style={{ background: C.card, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, background: C.goldBg, color: C.primary,
                  display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, marginBottom: 12,
                }}>{t.name.slice(0, 1)}</div>
                <h3 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 15 }}>{t.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>
                  {(t.subjects?.length ? t.subjects.join(' · ') : 'تخصص قيد التحديث')} · {t.courses_count} دورات
                </p>
                <button type="button" onClick={goVisitor} style={btnGhost({ width: '100%', background: C.bg, color: C.primary, border: `1px solid ${C.border}` })}>
                  عرض الملف
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HOW */}
      <section id="steps" style={{ ...pad(), background: '#fff' }}>
        <Fade><SectionTitle title="كيف تعمل الياقوت؟" /></Fade>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <Fade key={s.n} delay={i * 0.06}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  minWidth: 150, background: C.bg, borderRadius: 16, padding: '16px 14px',
                  border: `1px solid ${C.border}`, textAlign: 'center',
                }}>
                  <p style={{ margin: '0 0 6px', color: brand.gold, fontWeight: 900, fontSize: 18 }}>{s.n}</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 13.5, color: C.text }}>{s.t}</p>
                </div>
                {i < STEPS.length - 1 && !isMobile && <span style={{ color: C.dim, fontSize: 20 }}>↓</span>}
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* GAMIFICATION */}
      <section id="gamification" style={pad()}>
        <Fade><SectionTitle title="تعلّم... نافس... واربح 🏆" sub="يحصل الطالب على نقاط من الحضور والواجبات والإنجازات، ويرتقي بالمستويات ويظهر في لوحة المتصدرين وفق بيانات حقيقية." /></Fade>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
          {GAME.map(g => (
            <div key={g.t} style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{g.icon}</div>
              <p style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 14 }}>{g.t}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEADERBOARD */}
      <section id="leaderboard" style={{ ...pad(), background: '#fff' }}>
        <Fade><SectionTitle title="لوحة المتصدرين" /></Fade>
        {board.length === 0 ? (
          <EmptyNote>لا توجد بيانات متصدرين حالياً.</EmptyNote>
        ) : (
          <div style={{ maxWidth: 640, margin: '0 auto', background: C.bg, borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {board.map(r => (
              <div key={r.rank} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, background: r.rank <= 3 ? 'rgba(197,147,65,0.15)' : C.card,
                  color: r.rank <= 3 ? brand.gold : C.primary, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12,
                }}>{r.rank}</span>
                <span style={{ flex: 1, fontWeight: 700 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: C.sub }}>المستوى {r.level}</span>
                <span style={{ fontWeight: 900, color: brand.gold }}>{r.points}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button type="button" onClick={goVisitor} style={btnPrimary()}>عرض لوحة المتصدرين</button>
        </div>
      </section>

      {/* CHALLENGES */}
      <section id="challenges" style={pad()}>
        <Fade><SectionTitle title="تعلّمك له قيمة 🎁" sub="التحديات والمسابقات والجوائز من بيانات المنصة الفعلية." /></Fade>
        {challenges.length === 0 ? (
          <EmptyNote>لا توجد تحديات معروضة حالياً.</EmptyNote>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {challenges.map(ch => (
              <div key={ch.id} style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
                <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 15 }}>{ch.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{ch.description || ch.category || 'تحدٍّ تعليمي'}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI */}
      <section id="ai" style={{ ...pad(), background: '#fff' }}>
        <Fade><SectionTitle title="🤖 معلمك الذكي معك دائماً" /></Fade>
        <div style={{
          maxWidth: 560, margin: '0 auto', background: C.bg, borderRadius: 20, padding: 20,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ background: C.card, borderRadius: 14, padding: 12, marginBottom: 10, border: `1px solid ${C.border}` }}>
            <p style={{ margin: 0, fontSize: 12, color: C.dim, marginBottom: 4 }}>الطالب</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>اشرح لي قانون فيثاغورس.</p>
          </div>
          <div style={{ background: C.goldBg, borderRadius: 14, padding: 12, border: `1px solid ${C.goldBdr}` }}>
            <p style={{ margin: 0, fontSize: 12, color: C.primary, marginBottom: 4, fontWeight: 700 }}>المعلم الذكي</p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>بالتأكيد، لنبدأ بمثال بسيط...</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button type="button" onClick={goVisitor} style={btnPrimary()}>جرّب المعلم الذكي</button>
          </div>
        </div>
      </section>

      {/* STUDY */}
      <section id="study" style={pad()}>
        <Fade>
          <SectionTitle
            title="🧠 غرفة المذاكرة 24/7"
            sub="مساحة للدراسة والتركيز وطلب المساعدة والتواصل مع الزملاء. عدد المتواجدين يظهر فقط إن كان النظام يحسبه فعلياً."
          />
        </Fade>
        <div style={{
          maxWidth: 720, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10,
        }}>
          {['الدراسة', 'التركيز', 'طلب المساعدة', 'التواصل'].map(x => (
            <div key={x} style={{
              background: C.card, borderRadius: 14, padding: 16, textAlign: 'center',
              border: `1px solid ${C.border}`, fontWeight: 800, color: C.navy,
            }}>{x}</div>
          ))}
        </div>
      </section>

      {/* PARENT */}
      <section id="parent" style={{ ...pad(), background: '#fff' }}>
        <Fade>
          <SectionTitle
            title="ولي الأمر شريك في نجاح ابنك"
            sub="تابع الأداء والدورات والواجبات والحضور والتقارير والتنبيهات، إضافة إلى الاشتراكات والفواتير كإدارة مستحقات — دون بوابة دفع إلكتروني حالياً."
          />
        </Fade>
        <div style={{
          maxWidth: 800, margin: '0 auto', background: `linear-gradient(145deg,${C.navy},${C.primary})`,
          borderRadius: 22, padding: 24, color: '#fff',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 18 }}>
            {['📈 الأداء', '📚 الدورات', '📝 الواجبات', '🎥 الحضور', '📊 التقارير', '🔔 التنبيهات', '🧾 الاشتراكات والفواتير'].map(x => (
              <div key={x} style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 10px',
                textAlign: 'center', fontSize: 12.5, fontWeight: 700,
              }}>{x}</div>
            ))}
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.85, lineHeight: 1.7, textAlign: 'center' }}>
            الاشتراك الحالي · قيمة الاشتراك · تواريخ البداية والنهاية · الفواتير · المبالغ المستحقة · حالة الفاتورة
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link to="/register" style={btnPrimary({ background: '#fff', color: C.navy })}>اكتشف بوابة ولي الأمر</Link>
          </div>
        </div>
      </section>

      {/* CERTIFICATES */}
      <section id="certificates" style={pad()}>
        <Fade><SectionTitle title="إنجازك يستحق أن يُوثّق" sub="يحصل الطالب على شهاداته وفق شروط النظام." /></Fade>
        <div style={{
          maxWidth: 420, margin: '0 auto', background: C.card, borderRadius: 18, padding: 24,
          border: `1px solid ${C.border}`, textAlign: 'center', boxShadow: C.shadow,
        }}>
          <div style={{
            border: `2px solid ${brand.gold}`, borderRadius: 12, padding: 24, marginBottom: 16,
            background: 'linear-gradient(180deg,#fff,rgba(197,147,65,0.06))',
          }}>
            <p style={{ margin: '0 0 8px', color: brand.gold, fontWeight: 900, fontSize: 12 }}>شهادة إنجاز</p>
            <p style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 18, color: C.navy }}>منصة الياقوت</p>
            <p style={{ margin: 0, fontSize: 13, color: C.sub }}>توثيق إتمام المسار وفق معايير المنصة</p>
          </div>
          <button type="button" onClick={goVisitor} style={btnPrimary()}>شاهد الشهادات</button>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...pad(), background: '#fff' }}>
        <Fade>
          <SectionTitle
            title="عن الياقوت"
            sub="منصة عربية للتعليم المتكامل: حصص مباشرة، متابعة أسرية، تحفيز ذكي، ومسار واضح للطالب وولي الأمر والمعلم."
          />
        </Fade>
      </section>

      {/* FAQ */}
      <section id="faqs" style={pad()}>
        <Fade><SectionTitle title="الأسئلة الشائعة" /></Fade>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqList.map(f => (
            <div key={f.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <button type="button" onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                style={{
                  width: '100%', textAlign: 'right', padding: '14px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: FONT, fontWeight: 800, fontSize: 14, color: C.text,
                  display: 'flex', justifyContent: 'space-between', gap: 12,
                }}>
                <span>{f.question}</span>
                <span style={{ color: C.primary }}>{openFaq === f.id ? '−' : '+'}</span>
              </button>
              {openFaq === f.id && (
                <p style={{ margin: 0, padding: '0 16px 14px', fontSize: 13.5, lineHeight: 1.75, color: C.sub }}>{f.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        background: 'linear-gradient(135deg,#2F6A84,#3B82A0 50%,#78B7C9)',
        padding: '64px 20px', textAlign: 'center', color: '#fff',
      }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900 }}>مستعد تبدأ رحلتك؟</h2>
        <p style={{ margin: '0 0 22px', fontSize: 15, opacity: 0.85, maxWidth: 480, marginInline: 'auto', lineHeight: 1.7 }}>
          تعلّم بطريقة مختلفة، تابع تقدمك، وحقق أهدافك مع الياقوت.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={btnPrimary({ background: '#fff', color: C.navy })}>ابدأ الآن</Link>
          <button type="button" onClick={goVisitor} style={btnGhost()}>استكشف كزائر</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.navy, color: 'rgba(255,255,255,0.75)', padding: '48px 20px 28px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 28, marginBottom: 28,
        }}>
          <div>
            <BrandLogo size={40} style={{ marginBottom: 12 }} />
            <p style={{ margin: '0 0 10px', fontWeight: 900, color: '#fff' }}>منصة الياقوت</p>
            <a href="#about" style={footLink}>عن الياقوت</a>
            <a href="#features" style={footLink}>المميزات</a>
            <Link to="/register" style={footLink}>تواصل معنا</Link>
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontWeight: 900, color: '#fff' }}>الطلاب</p>
            <a href="#courses" style={footLink}>الدورات</a>
            <a href="#live" style={footLink}>الحصص المباشرة</a>
            <button type="button" onClick={goVisitor} style={{ ...footLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block', width: '100%', textAlign: 'right' }}>المكتبة</button>
            <button type="button" onClick={goVisitor} style={{ ...footLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block', width: '100%', textAlign: 'right' }}>بنك الامتحانات</button>
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontWeight: 900, color: '#fff' }}>ولي الأمر</p>
            <a href="#parent" style={footLink}>بوابة ولي الأمر</a>
            <a href="#parent" style={footLink}>الاشتراكات</a>
            <a href="#parent" style={footLink}>الفواتير</a>
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontWeight: 900, color: '#fff' }}>المساعدة</p>
            <a href="#faqs" style={footLink}>الأسئلة الشائعة</a>
            <Link to="/register" style={footLink}>الدعم الفني</Link>
            <span style={{ ...footLink, opacity: 0.5 }}>سياسة الخصوصية</span>
            <span style={{ ...footLink, opacity: 0.5 }}>الشروط والأحكام</span>
          </div>
          <div>
            <p style={{ margin: '0 0 10px', fontWeight: 900, color: '#fff' }}>تابعنا</p>
            {social.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12.5, opacity: 0.6 }}>روابط التواصل حسب الدولة بعد اختيارها أعلاه.</p>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {social.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                    width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                    display: 'grid', placeItems: 'center', color: '#fff', textDecoration: 'none', fontSize: 11, fontWeight: 800,
                  }}>{socialIcon(s.platform)}</a>
                ))}
              </div>
            )}
          </div>
        </div>
        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, opacity: 0.45 }}>
          © {new Date().getFullYear()} منصة الياقوت لخدمات التعليم
          {selectedCountry ? ` — ${selectedCountry.name}` : ''}
        </p>
      </footer>

      {/* LEAD MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9990, backdropFilter: 'blur(14px)', background: 'rgba(36,55,70,0.78)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            <motion.div
              style={{
                width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
                background: C.card, borderRadius: 22, border: `1px solid ${C.border}`,
              }}
              initial={{ scale: 0.94, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
              dir="rtl"
            >
              <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: 17 }}>
                    {source === 'try_free' ? 'جرّب مجاناً' : source === 'free_class' ? 'حصة مجانية' : 'احجز مكانك'}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: C.sub }}>أكمل بياناتك وسنتواصل معك</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: C.dim }}>×</button>
              </div>
              <div style={{ padding: 20 }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <p style={{ fontWeight: 700 }}>{success}</p>
                    <button type="button" onClick={() => setModalOpen(false)} style={btnPrimary({ marginTop: 14 })}>إغلاق</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input required placeholder="الاسم الكامل" value={form.student_name}
                      onChange={e => setForm(p => ({ ...p, student_name: e.target.value }))} style={inputStyle} />
                    <input required placeholder="رقم الجوال" dir="ltr" value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
                    <select required value={form.country_id} onChange={e => setForm(p => ({ ...p, country_id: e.target.value }))} style={inputStyle}>
                      <option value="">اختر الدولة</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input placeholder="المدرسة" value={form.school} onChange={e => setForm(p => ({ ...p, school: e.target.value }))} style={inputStyle} />
                      <input placeholder="المنطقة" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {SUBJECTS.map(s => (
                        <button type="button" key={s} onClick={() => toggleSubject(s)} style={{
                          padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 700,
                          background: form.subjects.includes(s) ? C.goldGrad : C.bg, color: form.subjects.includes(s) ? '#fff' : C.sub,
                        }}>{s}</button>
                      ))}
                    </div>
                    <button type="submit" disabled={submitting} style={btnPrimary({ opacity: submitting ? 0.7 : 1 })}>
                      {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
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

const footLink: CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
  fontSize: 13, marginBottom: 8, fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: '100%', height: 44, borderRadius: 12, padding: '0 14px',
  border: `1.5px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: FONT,
  outline: 'none', boxSizing: 'border-box', background: '#fff',
};
