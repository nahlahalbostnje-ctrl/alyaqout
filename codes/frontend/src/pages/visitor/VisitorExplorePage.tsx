import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import BrandLogo from '../../components/BrandLogo';
import VisitorGateDialog from '../../components/visitor/VisitorGateDialog';
import { enterVisitorMode, exitVisitorMode, isVisitorMode } from '../../features/visitor/visitorMode';
import { C, brand } from '../../theme/palette';

const FONT = "'Cairo','Tajawal',sans-serif";

type Course = {
  id: number; title: string; thumbnail: string | null; teacher_name?: string;
  grade_name?: string; lessons_count: number; type: string; rating: number | null;
};
type Teacher = { id: number; name: string; subjects: string[]; courses_count: number };
type LiveClass = {
  id: number; title: string; status: string; scheduled_at: string | null;
  teacher_name?: string; subject_name?: string;
};
type Rank = { rank: number; name: string; points: number; level: number };
type Challenge = { id: number; title: string; description?: string | null; category?: string | null };

const shell: CSSProperties = {
  minHeight: '100vh', background: C.bg, fontFamily: FONT, direction: 'rtl', color: C.text,
};

function Section({ id, title, sub, children }: {
  id?: string; title: string; sub?: string; children: ReactNode;
}) {
  return (
    <section id={id} style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 8px' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900 }}>{title}</h2>
      {sub && <p style={{ margin: '0 0 18px', color: C.sub, fontSize: 14 }}>{sub}</p>}
      {children}
    </section>
  );
}

function Card({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      style={{
        background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
        padding: 16, boxShadow: C.shadow, cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );
}

export default function VisitorExplorePage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [lives, setLives] = useState<LiveClass[]>([]);
  const [board, setBoard] = useState<Rank[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<{ teachers: number; courses: number } | null>(null);

  useEffect(() => {
    enterVisitorMode();
    setReady(true);
    Promise.all([
      api.get('/public/courses?limit=6').then(r => setCourses(r.data.courses ?? [])).catch(() => {}),
      api.get('/public/teachers?limit=6').then(r => setTeachers(r.data.teachers ?? [])).catch(() => {}),
      api.get('/public/live-classes?limit=6').then(r => setLives(r.data.live_classes ?? [])).catch(() => {}),
      api.get('/public/leaderboard?limit=10').then(r => setBoard(r.data.leaderboard ?? [])).catch(() => {}),
      api.get('/public/challenges?limit=6').then(r => setChallenges(r.data.challenges ?? [])).catch(() => {}),
      api.get('/public/stats').then(r => setStats(r.data.stats ?? null)).catch(() => {}),
    ]);
  }, []);

  if (!ready) return null;
  if (!isVisitorMode()) return <Navigate to="/" replace />;

  const lock = () => setGateOpen(true);
  const leave = () => {
    exitVisitorMode();
    navigate('/');
  };

  return (
    <div style={shell}>
      <VisitorGateDialog open={gateOpen} onContinue={() => setGateOpen(false)} />

      <header style={{
        position: 'sticky', top: 0, zIndex: 40, background: 'rgba(247,249,250,0.96)',
        backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={40} />
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>وضع الزائر</p>
              <p style={{ margin: 0, fontSize: 11, color: C.sub }}>استكشف المنصة دون حساب</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/register" style={btnPrimary}>إنشاء حساب</Link>
            <Link to="/login" style={btnGhost}>تسجيل الدخول</Link>
            <button type="button" onClick={leave} style={btnGhost}>العودة للرئيسية</button>
          </div>
        </div>
      </header>

      <div style={{
        background: 'linear-gradient(135deg,#2F6A84,#3B82A0)', color: '#fff',
        padding: '28px 20px', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, opacity: 0.85, fontWeight: 700 }}>👁 دخول كزائر</p>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900 }}>
          استكشف منصة الياقوت
        </h1>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.8, maxWidth: 520, marginInline: 'auto', lineHeight: 1.7 }}>
          يمكنك مشاهدة الدورات والمعلمين والحصص والتحديات. الخدمات التي تتطلب حساباً ستظهر لك تنبيهاً عند المحاولة.
        </p>
        {stats && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 24, marginTop: 18, flexWrap: 'wrap',
            fontSize: 13, fontWeight: 700,
          }}>
            {stats.teachers > 0 && <span>+{stats.teachers} معلماً</span>}
            {stats.courses > 0 && <span>+{stats.courses} دورة</span>}
          </div>
        )}
      </div>

      <Section title="الدورات" sub="نماذج من الدورات المتاحة في المنصة">
        {courses.length === 0 ? (
          <Empty>لا توجد دورات معروضة حالياً</Empty>
        ) : (
          <Grid>
            {courses.map(c => (
              <Card key={c.id} onClick={lock}>
                <div style={{
                  height: 110, borderRadius: 12, marginBottom: 12,
                  background: c.thumbnail
                    ? `center/cover url(${c.thumbnail})`
                    : `linear-gradient(135deg,${C.primary},${C.primarySoft})`,
                }} />
                <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 14 }}>{c.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: C.sub }}>
                  {c.teacher_name || '—'} · {c.grade_name || '—'} · {c.lessons_count} دروس
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                  <Badge>{c.type === 'live' ? 'مباشرة' : 'مسجّلة'}</Badge>
                  {c.rating != null && <span style={{ fontSize: 12, color: brand.gold }}>★ {c.rating}</span>}
                  <span style={{ marginInlineStart: 'auto', fontSize: 12, fontWeight: 700, color: C.primary }}>استكشاف</span>
                </div>
              </Card>
            ))}
          </Grid>
        )}
      </Section>

      <Section title="المعلمون" sub="تعرّف على الكادر التعليمي">
        {teachers.length === 0 ? (
          <Empty>لا يوجد معلمون معروضون حالياً</Empty>
        ) : (
          <Grid>
            {teachers.map(t => (
              <Card key={t.id} onClick={lock}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 10,
                  background: C.goldBg, color: C.primary, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                }}>
                  {t.name.slice(0, 1)}
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: 800 }}>{t.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: C.sub }}>
                  {(t.subjects?.length ? t.subjects.join(' · ') : 'بدون تخصص معلن')} · {t.courses_count} دورات
                </p>
                <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 700, color: C.primary }}>عرض الملف</p>
              </Card>
            ))}
          </Grid>
        )}
      </Section>

      <Section title="حصص مباشرة" sub="الحصص الحالية والقادمة">
        {lives.length === 0 ? (
          <Empty>لا توجد حصص مباشرة حالياً، يمكنك استعراض المنصة والعودة لاحقاً.</Empty>
        ) : (
          <Grid>
            {lives.map(lc => (
              <Card key={lc.id} onClick={lock}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>{lc.subject_name || lc.title}</p>
                  <Badge tone={lc.status === 'live' ? 'live' : 'soon'}>
                    {lc.status === 'live' ? 'مباشر الآن' : 'قادمة'}
                  </Badge>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.sub }}>
                  {lc.teacher_name || '—'}
                  {lc.scheduled_at ? ` · ${new Date(lc.scheduled_at).toLocaleString('ar')}` : ''}
                </p>
                <p style={{ margin: '12px 0 0', fontSize: 12, fontWeight: 700, color: C.primary }}>دخول الحصة</p>
              </Card>
            ))}
          </Grid>
        )}
      </Section>

      <Section title="التحديات" sub="نماذج من تحديات المنصة">
        {challenges.length === 0 ? (
          <Empty>لا توجد تحديات معروضة حالياً</Empty>
        ) : (
          <Grid>
            {challenges.map(ch => (
              <Card key={ch.id} onClick={lock}>
                <p style={{ margin: '0 0 6px', fontWeight: 800 }}>{ch.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                  {ch.description || ch.category || 'تحدٍّ تعليمي'}
                </p>
              </Card>
            ))}
          </Grid>
        )}
      </Section>

      <Section title="لوحة المتصدرين" sub="أفضل الطلاب حسب النقاط الفعلية">
        {board.length === 0 ? (
          <Empty>لا توجد بيانات متصدرين حالياً</Empty>
        ) : (
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {board.map(r => (
              <div key={r.rank} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, background: C.goldBg,
                  color: C.primary, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12,
                }}>{r.rank}</span>
                <span style={{ flex: 1, fontWeight: 700 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: C.sub }}>المستوى {r.level}</span>
                <span style={{ fontWeight: 800, color: brand.gold }}>{r.points}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="خدمات تتطلب حساباً" sub="جرّب الضغط لمعرفة ما يحدث كزائر">
        <Grid>
          {[
            { t: 'المعلم الذكي', d: 'محادثة ومساعدة دراسية' },
            { t: 'غرفة المذاكرة 24/7', d: 'دراسة جماعية وطلب مساعدة' },
            { t: 'المكتبة التعليمية', d: 'ملفات ومصادر منظّمة' },
            { t: 'الاشتراك والفواتير', d: 'متابعة الاشتراك والمستحقات' },
          ].map(item => (
            <Card key={item.t} onClick={lock}>
              <p style={{ margin: '0 0 4px', fontWeight: 800 }}>{item.t}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.sub }}>{item.d}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <div style={{ maxWidth: 1100, margin: '24px auto 48px', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg,#2F6A84,#3B82A0)', borderRadius: 20,
          padding: '28px 24px', textAlign: 'center', color: '#fff',
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900 }}>جاهز تبدأ فعلياً؟</h3>
          <p style={{ margin: '0 0 16px', opacity: 0.85, fontSize: 14 }}>أنشئ حسابك للوصول الكامل إلى خدمات الياقوت.</p>
          <Link to="/register" style={{ ...btnPrimary, display: 'inline-block', background: '#fff', color: C.navy }}>
            إنشاء حساب
          </Link>
        </div>
      </div>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
      gap: 14,
    }}>
      {children}
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p style={{
      margin: 0, padding: '20px 16px', background: C.card, borderRadius: 14,
      border: `1px dashed ${C.border}`, color: C.sub, fontSize: 13, textAlign: 'center',
    }}>{children}</p>
  );
}

function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'live' | 'soon' }) {
  const styles = {
    default: { bg: C.goldBg, color: C.primary },
    live: { bg: 'rgba(224,122,122,0.15)', color: C.red },
    soon: { bg: C.amberBg, color: C.amber },
  }[tone];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 800, background: styles.bg, color: styles.color,
    }}>{children}</span>
  );
}

const btnPrimary: CSSProperties = {
  padding: '10px 16px', borderRadius: 12, textDecoration: 'none',
  background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 13,
  fontFamily: FONT, border: 'none', cursor: 'pointer',
};

const btnGhost: CSSProperties = {
  padding: '10px 14px', borderRadius: 12, textDecoration: 'none',
  background: C.card, color: C.text, fontWeight: 700, fontSize: 13,
  fontFamily: FONT, border: `1px solid ${C.border}`, cursor: 'pointer',
};
