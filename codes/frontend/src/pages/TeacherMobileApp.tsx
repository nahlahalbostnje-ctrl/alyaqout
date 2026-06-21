import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherDashboard, updateTeacherClassStatus } from '../features/teacher/teacherSlice';
import { fetchTeacherExams, fetchTeacherHomework } from '../features/teacher/examSlice';
import { logout } from '../features/auth/authSlice';

// ─── Design Tokens ─────────────────────────────────────────────────────────
const T = {
  // Content area — light cream
  bg:        '#F5EFE0',
  card:      '#FFFFFF',
  card2:     '#FDF6EC',
  text:      '#0D1535',
  sub:       'rgba(13,21,53,0.58)',
  dim:       'rgba(13,21,53,0.35)',
  border:    'rgba(201,149,42,0.22)',
  goldBdr:   'rgba(201,149,42,0.45)',
  goldBg:    'rgba(201,149,42,0.09)',
  // Sidebar — dark navy (same as student portal)
  sidebar:   '#0D1535',
  sText:     '#FFFFFF',
  sSub:      'rgba(255,255,255,0.55)',
  sBorder:   'rgba(255,255,255,0.1)',
  // Accent gold
  gold:      '#C9952A',
  goldL:     '#DDAD50',
  goldGrad:  'linear-gradient(135deg,#C9952A,#DDAD50)',
  // Status colors
  green:     '#16A34A',
  orange:    '#D97706',
  red:       '#DC2626',
  blue:      '#2563EB',
};

type Screen = 'home'|'schedule'|'homework'|'exams'|'reports'|'ai'|'messages'|'live'|'students';

const NAV_ITEMS: { icon:string; label:string; screen:Screen }[] = [
  { icon:'🏠', label:'الرئيسية',         screen:'home'     },
  { icon:'📅', label:'جدول الحصص',       screen:'schedule' },
  { icon:'📚', label:'الواجبات',          screen:'homework' },
  { icon:'📝', label:'الامتحانات',        screen:'exams'    },
  { icon:'📊', label:'التقارير',          screen:'reports'  },
  { icon:'✉️', label:'الرسائل',           screen:'messages' },
  { icon:'🤖', label:'المساعد الذكي',     screen:'ai'       },
  { icon:'👥', label:'إدارة الطلاب',     screen:'students' },
  { icon:'📹', label:'غرفة البث',         screen:'live'     },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const card = (extra?: Record<string, unknown>) => ({
  background: T.card,
  borderRadius: 16,
  padding: '20px 22px',
  border: `1px solid ${T.border}`,
  ...extra,
});

function Ring({ pct, size = 80, color = T.gold }: { pct: number; size?: number; color?: string }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(13,21,53,0.1)" strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color, fontWeight: 900, fontSize: size > 90 ? 18 : 14 }}>{pct}%</span>
      </div>
    </div>
  );
}

function Badge({ n, color = T.red }: { n: number; color?: string }) {
  if (!n) return null;
  return (
    <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: color, color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{n}</span>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, teacher, pendingTotal, onLogout }: {
  active: Screen;
  onNav: (s: Screen) => void;
  teacher: { id: number; name: string } | null;
  pendingTotal: number;
  onLogout: () => void;
}) {
  return (
    <div style={{ width: 240, background: T.sidebar, borderLeft: `1px solid rgba(255,255,255,0.08)`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.sBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 14px rgba(201,149,42,0.4)' }}>👨‍🏫</div>
          <div>
            <p style={{ color: T.sText, fontWeight: 800, fontSize: 13.5 }}>أ. {teacher?.name ?? '...'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ color: T.goldL, fontSize: 11, fontWeight: 600 }}>English</span>
              <span style={{ background: T.goldGrad, color: T.sidebar, fontSize: 9, fontWeight: 800, padding: '1px 7px', borderRadius: 20 }}>رتبة المعلم ★</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, padding: '7px 12px', background: 'rgba(201,149,42,0.15)', borderRadius: 10, border: `1px solid rgba(201,149,42,0.3)` }}>
          <span style={{ fontSize: 14 }}>💰</span>
          <span style={{ color: T.goldL, fontWeight: 900, fontSize: 16 }}>8,420</span>
          <span style={{ color: T.sSub, fontSize: 10, marginRight: 'auto' }}>نقطة</span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', scrollbarWidth: 'none' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.screen;
          const badge = item.screen === 'homework' || item.screen === 'exams' ? pendingTotal : 0;
          return (
            <button key={item.screen} onClick={() => onNav(item.screen)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, marginBottom: 3, background: isActive ? T.goldGrad : 'transparent', border: `1px solid ${isActive ? T.gold : 'transparent'}`, cursor: 'pointer', textAlign: 'right', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ color: isActive ? T.sidebar : T.sSub, fontWeight: isActive ? 800 : 500, fontSize: 13, flex: 1 }}>{item.label}</span>
              {!isActive && badge > 0 && <Badge n={badge}/>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '14px 10px', borderTop: `1px solid ${T.sBorder}` }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.28)', color: '#FF8080', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🚪</span> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

// ─── Section title ──────────────────────────────────────────────────────────
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ color: T.text, fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      {sub && <p style={{ color: T.sub, fontSize: 13, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════════════════

// HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({ stats, upcoming, teacher, recentSubmissions }: {
  stats: { total_courses:number; total_live_classes:number; pending_homework_subs:number; pending_exam_subs:number; active_homeworks:number; active_exams:number; today_attendance:number } | null;
  upcoming: { id:number; title:string; scheduled_at:string; status:string; course:{id:number;title:string} }[];
  teacher: { id:number; name:string } | null;
  recentSubmissions: { id:number; student_name:string; homework:string; submitted_at:string }[];
}) {
  const kpis = [
    { label: 'الكورسات النشطة',       val: stats?.total_courses ?? '—',           icon: '📚', color: T.blue  },
    { label: 'حضور اليوم',            val: stats?.today_attendance ?? '—',         icon: '✅', color: T.green },
    { label: 'واجبات معلّقة',          val: stats?.pending_homework_subs ?? '—',   icon: '📋', color: T.orange},
    { label: 'امتحانات تحتاج تصحيح', val: stats?.pending_exam_subs ?? '—',        icon: '📝', color: T.red   },
    { label: 'واجبات نشطة',           val: stats?.active_homeworks ?? '—',         icon: '🗂️', color: T.gold  },
    { label: 'حصص مجدولة',            val: stats?.total_live_classes ?? '—',       icon: '📅', color: '#A78BFA'},
  ];

  return (
    <div>
      <SectionTitle title={`مرحباً، أ. ${teacher?.name?.split(' ')[0] ?? '...'} 👋`} sub="هذا ملخص نشاط اليوم"/>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...card(), display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${k.color}18`, border: `1px solid ${k.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{k.icon}</div>
            <div>
              <p style={{ color: T.text, fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{k.val}</p>
              <p style={{ color: T.sub, fontSize: 11.5, marginTop: 5 }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Alerts */}
        <div style={card()}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>مدائل معلّم — تنبيهات الطلاب</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'متفوقون',        n: stats?.today_attendance ?? 18, color: T.green  },
              { label: 'يحتاجون متابعة', n: stats?.pending_homework_subs ?? 24, color: T.orange },
              { label: 'تدخل عاجل',      n: stats?.pending_exam_subs ?? 7,  color: T.red   },
            ].map((a, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px 8px', borderRadius: 12, background: `${a.color}10`, border: `1px solid ${a.color}30` }}>
                <p style={{ color: a.color, fontWeight: 900, fontSize: 32, lineHeight: 1 }}>{a.n}</p>
                <p style={{ color: T.sub, fontSize: 10.5, marginTop: 6, lineHeight: 1.4 }}>{a.label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Ring pct={92} size={90} color={T.gold}/>
            <div>
              <p style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>جودة الصف</p>
              <p style={{ color: T.sub, fontSize: 11.5, marginTop: 3 }}>مرتفعة هذا الشهر</p>
            </div>
          </div>
        </div>

        {/* Recent submissions */}
        <div style={card()}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>آخر التسليمات</p>
          {recentSubmissions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              <p style={{ color: T.sub, fontSize: 13 }}>لا توجد تسليمات جديدة</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSubmissions.slice(0, 5).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentSubmissions.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎓</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: T.text, fontWeight: 600, fontSize: 13 }}>{s.student_name}</p>
                  <p style={{ color: T.sub, fontSize: 11.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.homework}</p>
                </div>
                <span style={{ color: T.dim, fontSize: 10.5, flexShrink: 0 }}>{new Date(s.submitted_at).toLocaleDateString('ar-EG')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming classes */}
        <div style={{ ...card(), gridColumn: '1/-1' }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>الحصص القادمة</p>
          {upcoming.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: T.sub, fontSize: 13 }}>لا توجد حصص مجدولة</p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
            {upcoming.slice(0, 6).map((cls, i) => {
              const t = new Date(cls.scheduled_at);
              const isLive = cls.status === 'live';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: isLive ? `linear-gradient(135deg,${T.goldBg},#FFF8E8)` : T.card2, border: `1px solid ${isLive ? T.gold : T.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: isLive ? T.goldGrad : T.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{isLive ? '📹' : '📚'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{cls.course?.title}</p>
                    <p style={{ color: isLive ? T.gold : T.sub, fontSize: 11 }}>{t.toLocaleString('ar-EG', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {isLive && <span style={{ color: T.red, fontSize: 11, fontWeight: 700 }}>🔴 مباشر</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// SCHEDULE ────────────────────────────────────────────────────────────────────
function ScheduleScreen({ upcoming, onStart }: {
  upcoming: { id:number; title:string; scheduled_at:string; status:string; course:{title:string} }[];
  onStart: (id: number) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  const [selDay, setSelDay] = useState(0);
  const today = days[selDay];
  const filtered = upcoming.filter(u => new Date(u.scheduled_at).toDateString() === today.toDateString());

  return (
    <div>
      <SectionTitle title="جدول الحصص" sub="جدول حصصك للأسبوع الحالي"/>
      {/* Day picker */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        {days.map((d, i) => (
          <button key={i} onClick={() => setSelDay(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 18px', borderRadius: 14, border: `1px solid ${i === selDay ? T.gold : T.border}`, background: i === selDay ? T.goldGrad : T.card, cursor: 'pointer', minWidth: 64 }}>
            <span style={{ color: i === selDay ? '#071220' : T.dim, fontSize: 10, fontWeight: 600 }}>{d.toLocaleDateString('ar-EG', { weekday: 'short' })}</span>
            <span style={{ color: i === selDay ? '#071220' : T.text, fontWeight: 900, fontSize: 20 }}>{d.getDate()}</span>
          </button>
        ))}
      </div>

      <p style={{ color: T.sub, fontSize: 13, marginBottom: 14 }}>{today.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

      {filtered.length === 0 ? (
        <div style={{ ...card(), textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <p style={{ color: T.sub, fontSize: 14 }}>لا توجد حصص في هذا اليوم</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((cls, i) => {
            const t = new Date(cls.scheduled_at);
            const isLive = cls.status === 'live';
            return (
              <div key={i} style={{ ...card({ display: 'flex', alignItems: 'center', gap: 16, background: isLive ? `linear-gradient(135deg,${T.goldBg},#FFF8E8)` : T.card, border: `1px solid ${isLive ? T.gold : T.border}` }) }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: isLive ? T.goldGrad : T.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{isLive ? '📹' : '📚'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{cls.course?.title}</p>
                  <p style={{ color: isLive ? T.gold : T.sub, fontSize: 12.5, marginTop: 3 }}>{t.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} — {cls.title}</p>
                </div>
                {isLive && <span style={{ background: 'rgba(239,68,68,0.15)', color: T.red, border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🔴 مباشر الآن</span>}
                <button onClick={() => onStart(cls.id)} style={{ padding: '11px 28px', borderRadius: 12, background: T.goldGrad, border: 'none', color: T.sidebar, fontWeight: 800, fontSize: 13.5, cursor: 'pointer', flexShrink: 0 }}>
                  {isLive ? 'دخول' : 'بدء'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{ ...card({ marginTop: 20 }) }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>كل الحصص القادمة</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
            {upcoming.map((cls, i) => {
              const t = new Date(cls.scheduled_at);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: T.card2, border: `1px solid ${T.border}` }}>
                  <div>
                    <p style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{cls.course?.title}</p>
                    <p style={{ color: T.sub, fontSize: 11 }}>{t.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })} — {t.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div style={{ marginRight: 'auto', padding: '3px 10px', borderRadius: 20, background: cls.status === 'live' ? 'rgba(239,68,68,0.15)' : T.goldBg, border: `1px solid ${cls.status === 'live' ? T.red : T.gold}` }}>
                    <span style={{ color: cls.status === 'live' ? T.red : T.gold, fontSize: 10, fontWeight: 700 }}>{cls.status === 'live' ? '🔴 مباشر' : 'مجدول'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// HOMEWORK ────────────────────────────────────────────────────────────────────
function HomeworkScreen({ homeworks }: { homeworks: { id:number; title:string; due_date:string; course:{title:string}|null; status:string; submissions_count:number }[] }) {
  const [tab, setTab] = useState<'pending'|'done'>('pending');
  const filtered = homeworks.filter(h => tab === 'pending' ? (h.status === 'pending' || h.status === 'approved') : (h.status === 'expired' || h.status === 'completed'));

  return (
    <div>
      <SectionTitle title="الواجبات" sub="إدارة واجبات طلابك"/>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['pending','جديدة / نشطة'],['done','منتهية']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 28px', borderRadius: 12, background: tab === k ? T.goldGrad : T.card, border: `1px solid ${tab === k ? T.gold : T.border}`, color: tab === k ? '#071220' : T.sub, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...card({ textAlign: 'center', padding: '60px' }) }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📚</div>
          <p style={{ color: T.sub, fontSize: 14 }}>لا توجد واجبات {tab === 'pending' ? 'نشطة' : 'منتهية'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {filtered.map((hw, i) => (
            <div key={i} style={card()}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📋</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{hw.title}</p>
                  <p style={{ color: T.gold, fontSize: 12, marginTop: 3 }}>{hw.course?.title ?? '—'}</p>
                  <p style={{ color: T.sub, fontSize: 11.5, marginTop: 2 }}>آخر موعد: {new Date(hw.due_date).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: T.sub, fontSize: 12 }}>التسليمات: <strong style={{ color: T.text }}>{hw.submissions_count}</strong></span>
                <button style={{ padding: '9px 20px', borderRadius: 10, background: T.goldGrad, border: 'none', color: T.sidebar, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>عرض التفاصيل</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// EXAMS ───────────────────────────────────────────────────────────────────────
function ExamsScreen({ exams }: { exams: { id:number; title:string; starts_at?:string; duration?:number; course:{title:string}|null; status:string; submissions_count:number; questions_count:number }[] }) {
  const [tab, setTab] = useState<'upcoming'|'done'>('upcoming');
  const filtered = exams.filter(e => tab === 'upcoming' ? (e.status === 'approved' || e.status === 'pending') : (e.status === 'completed' || e.status === 'rejected'));

  return (
    <div>
      <SectionTitle title="الامتحانات" sub="إنشاء وإدارة امتحانات طلابك"/>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['upcoming','القادمة'],['done','المنتهية']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 28px', borderRadius: 12, background: tab === k ? T.goldGrad : T.card, border: `1px solid ${tab === k ? T.gold : T.border}`, color: tab === k ? '#071220' : T.sub, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...card({ textAlign: 'center', padding: '60px' }) }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📝</div>
          <p style={{ color: T.sub, fontSize: 14 }}>لا توجد امتحانات {tab === 'upcoming' ? 'قادمة' : 'منتهية'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {filtered.map((exam, i) => (
            <div key={i} style={card()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: `2px solid ${T.gold}` }}>📐</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{exam.title}</p>
                  {exam.starts_at && <p style={{ color: T.sub, fontSize: 12, marginTop: 3 }}>{new Date(exam.starts_at).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
                  {exam.duration && <p style={{ color: T.dim, fontSize: 11, marginTop: 2 }}>المدة: {exam.duration} دقيقة</p>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: T.card2, borderRadius: 10, padding: '8px 12px', border: `1px solid ${T.border}` }}>
                  <p style={{ color: T.dim, fontSize: 10 }}>الأسئلة</p>
                  <p style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{exam.questions_count}</p>
                </div>
                <div style={{ background: T.card2, borderRadius: 10, padding: '8px 12px', border: `1px solid ${T.border}` }}>
                  <p style={{ color: T.dim, fontSize: 10 }}>التسليمات</p>
                  <p style={{ color: T.text, fontWeight: 700, fontSize: 18 }}>{exam.submissions_count}</p>
                </div>
              </div>
              <button style={{ width: '100%', padding: '11px', borderRadius: 11, background: T.goldGrad, border: 'none', color: T.sidebar, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>إدارة الامتحان</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// REPORTS ─────────────────────────────────────────────────────────────────────
function ReportsScreen() {
  const [cls, setCls] = useState<'A' | 'B'>('A');
  const data = {
    A: [{ sub: 'English', pct: 92, label: 'ممتاز', c: T.green }, { sub: 'Math', pct: 78, label: 'جيداً', c: T.orange }, { sub: 'Science', pct: 77, label: 'مقبول', c: T.orange }],
    B: [{ sub: 'English', pct: 92, label: 'ممتاز', c: T.green }, { sub: 'Math',  pct: 92, label: 'ممتاز', c: T.green  }, { sub: 'Science', pct: 92, label: 'ممتاز', c: T.green }],
  };
  return (
    <div>
      <SectionTitle title="التقارير" sub="تقارير أداء الصفوف والطلاب"/>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {(['A', 'B'] as const).map(c => (
          <button key={c} onClick={() => setCls(c)} style={{ padding: '10px 32px', borderRadius: 12, background: cls === c ? T.goldGrad : T.card, border: `1px solid ${cls === c ? T.gold : T.border}`, color: cls === c ? '#071220' : T.sub, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>الصف {c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Subject rings */}
        <div style={{ ...card({ gridColumn: '1/-1' }) }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 18 }}>أداء المواد — الصف {cls}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {data[cls].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px', background: T.card2, borderRadius: 14, border: `1px solid ${T.border}` }}>
                <Ring pct={item.pct} size={100} color={item.c}/>
                <p style={{ color: T.text, fontWeight: 800, fontSize: 15 }}>{item.sub}</p>
                <span style={{ color: item.c, fontSize: 12, fontWeight: 700, background: `${item.c}15`, padding: '4px 16px', borderRadius: 20, border: `1px solid ${item.c}30` }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div style={{ ...card(), display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎓</div>
          <p style={{ color: T.text, fontWeight: 800, fontSize: 16 }}>تحليل ذكي للطلاب</p>
          <p style={{ color: T.sub, fontSize: 12.5, lineHeight: 1.7 }}>احصل على رأي ذكاء اصطناعي لتحسين أداء الطلاب في هذا الصف</p>
          <button style={{ padding: '13px 24px', borderRadius: 12, background: T.goldGrad, border: 'none', color: T.sidebar, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>تشغيل التحليل</button>
        </div>

        <div style={{ ...card(), display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📤</div>
          <p style={{ color: T.text, fontWeight: 800, fontSize: 16 }}>تصدير تقرير شامل</p>
          <p style={{ color: T.sub, fontSize: 12.5, lineHeight: 1.7 }}>تصدير تقرير أداء الصف كاملاً بصيغة PDF أو Excel</p>
          <button style={{ padding: '13px 24px', borderRadius: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: T.blue, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>تصدير التقرير</button>
        </div>
      </div>
    </div>
  );
}

// AI ASSISTANT ────────────────────────────────────────────────────────────────
function AIScreen({ teacher }: { teacher: { name: string } | null }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const quick = [
    { icon: '📖', label: 'تحضير درس' },
    { icon: '📊', label: 'تلخيص محتوى' },
    { icon: '📋', label: 'توليد أسئلة امتحان' },
    { icon: '🎯', label: 'خطة تعليمية' },
    { icon: '💡', label: 'نشاط تفاعلي' },
    { icon: '📈', label: 'تحليل أداء الصف' },
    { icon: '🗓️', label: 'جدول مراجعة' },
    { icon: '📝', label: 'نموذج واجب' },
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { default: api } = await import('../services/axios');
      const { data } = await api.post('/student/chatbot', { message: userMsg, history: [] });
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، لم أتمكن من الرد الآن. تأكد من تفعيل المساعد في الإعدادات.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 100px)' }}>
      {/* Left: chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Welcome */}
        <div style={{ ...card({ background: `linear-gradient(135deg,${T.goldBg},#FFF8E8)`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }) }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0, boxShadow: '0 6px 20px rgba(212,160,23,0.4)' }}>🤖</div>
          <div>
            <p style={{ color: T.text, fontWeight: 900, fontSize: 16 }}>مرحباً أ. {teacher?.name?.split(' ')[0] ?? '...'}</p>
            <p style={{ color: T.sub, fontSize: 12.5, marginTop: 3 }}>مساعد المعلم الذكي — اسألني أي شيء يتعلق بالتعليم</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 14, scrollbarWidth: 'none' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.dim, fontSize: 13 }}>ابدأ محادثتك بكتابة سؤال أو اختر اقتراحاً من اليمين</div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end' }}>
              <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: 14, background: m.role === 'user' ? T.card2 : T.goldGrad, border: `1px solid ${m.role === 'user' ? T.border : 'transparent'}` }}>
                <p style={{ color: m.role === 'user' ? T.text : '#071220', fontSize: 13.5, lineHeight: 1.7 }}>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ padding: '10px 16px', borderRadius: 14, background: T.card2, border: `1px solid ${T.border}`, color: T.dim, fontSize: 12 }}>يكتب...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)} placeholder="اكتب سؤالك هنا…" dir="rtl"
            style={{ flex: 1, padding: '13px 18px', borderRadius: 14, background: T.card2, border: `1px solid ${T.border}`, color: T.text, fontSize: 13.5, outline: 'none', fontFamily: "'Cairo',sans-serif" }}/>
          <button onClick={() => sendMessage(input)} disabled={loading} style={{ padding: '0 22px', borderRadius: 14, background: T.goldGrad, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.sidebar} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>

      {/* Right: quick suggestions */}
      <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>اقتراحات سريعة</p>
        {quick.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q.label)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'right' }}>
            <span style={{ fontSize: 20 }}>{q.icon}</span>
            <span style={{ color: T.sub, fontSize: 12.5 }}>{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// MESSAGES ────────────────────────────────────────────────────────────────────
function MessagesScreen() {
  const [tab, setTab] = useState<'all' | 'admin'>('all');
  const [activeChat, setActiveChat] = useState(0);
  const convs = [
    { name: 'Students', last: 'الرسائل والتعامل مع حمد', time: '10:30 AM', unread: 2, icon: '👥' },
    { name: 'Parents',  last: 'رابيعة عواب المدم في القفص', time: '06:15 AM', unread: 2, icon: '👨‍👩‍👦' },
    { name: 'Administration', last: 'يدفنون مواضع الأوصوصي', time: '06:15 AM', unread: 0, icon: '🏫' },
    { name: 'الطلاب', last: 'ريبعة أن لأصلحه سرجوم؟', time: 'أمس', unread: 1, icon: '🎓' },
  ];
  const shown = tab === 'admin' ? convs.filter(c => c.name === 'Administration') : convs;

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 100px)' }}>
      {/* Conversation list */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['all', 'الكل'], ['admin', 'الإدارة']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as 'all' | 'admin')} style={{ flex: 1, padding: '9px', borderRadius: 10, background: tab === k ? T.goldGrad : T.card, border: `1px solid ${tab === k ? T.gold : T.border}`, color: tab === k ? '#071220' : T.sub, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <div style={{ ...card({ padding: 0, overflow: 'hidden', flex: 1 }) }}>
          {shown.map((c, i) => (
            <div key={i} onClick={() => setActiveChat(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < shown.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer', background: activeChat === i ? T.goldBg : 'transparent', borderRight: activeChat === i ? `3px solid ${T.gold}` : '3px solid transparent' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.card2, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, position: 'relative' }}>
                {c.icon}
                {c.unread > 0 && <div style={{ position: 'absolute', top: -3, right: -3, width: 18, height: 18, borderRadius: '50%', background: T.red, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{c.name}</p>
                  <span style={{ color: T.dim, fontSize: 10 }}>{c.time}</span>
                </div>
                <p style={{ color: T.sub, fontSize: 11.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, ...card({ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }) }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24 }}>{shown[activeChat]?.icon}</div>
          <p style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{shown[activeChat]?.name}</p>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: T.dim, fontSize: 13 }}>اختر محادثة لعرضها</p>
        </div>
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10 }}>
          <input placeholder="اكتب رسالتك هنا…" dir="rtl" style={{ flex: 1, padding: '11px 16px', borderRadius: 12, background: T.card2, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', fontFamily: "'Cairo',sans-serif" }}/>
          <button style={{ padding: '0 20px', borderRadius: 12, background: T.goldGrad, border: 'none', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.sidebar} strokeWidth="2.2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// LIVE ROOM ───────────────────────────────────────────────────────────────────
function LiveRoomScreen({ liveNow, onEnd }: { liveNow: { id: number; title: string; agora_channel: string | null } | null; onEnd: () => void }) {
  const [micOn, setMicOn]   = useState(true);
  const [camOn, setCamOn]   = useState(true);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      <SectionTitle title="غرفة البث المباشر" sub={liveNow?.title ?? 'لا توجد حصة مباشرة حالياً'}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Video */}
        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(160deg,#0A1E45,#071220)', position: 'relative', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}` }}>
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', items: 'center', gap: 8 }}>
            <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.red }}/>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{fmt(elapsed)}</span>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '5px 14px' }}>
            <span style={{ color: '#fff', fontSize: 12 }}>👥 {Math.floor(Math.random() * 30) + 10}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: T.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, margin: '0 auto 14px', border: `3px solid ${T.gold}`, boxShadow: '0 0 40px rgba(212,160,23,0.4)' }}>👨‍🏫</div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{liveNow?.title ?? 'English - 5th A'}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>غرفة البث المباشر</p>
          </div>
        </div>

        {/* Controls + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={card()}>
            <p style={{ color: T.gold, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>التحكم في البث</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: micOn ? '🎤' : '🔇', label: 'المايكروفون', active: micOn, toggle: () => setMicOn(m => !m) },
                { icon: camOn ? '📷' : '📵', label: 'الكاميرا',    active: camOn, toggle: () => setCamOn(c => !c) },
                { icon: '🖥️', label: 'مشاركة الشاشة', active: false, toggle: () => {} },
              ].map((ctrl, i) => (
                <button key={i} onClick={ctrl.toggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, background: ctrl.active ? T.goldBg : T.card2, border: `1px solid ${ctrl.active ? T.goldBdr : T.border}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{ctrl.icon}</span>
                  <span style={{ color: ctrl.active ? T.gold : T.sub, fontWeight: ctrl.active ? 700 : 400, fontSize: 13 }}>{ctrl.label}</span>
                  <span style={{ marginRight: 'auto', fontSize: 10, color: ctrl.active ? T.green : T.dim }}>{ctrl.active ? '✓ تشغيل' : '✗ إيقاف'}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={onEnd} style={{ padding: '14px', borderRadius: 14, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: T.red, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📵</span> إنهاء البث
          </button>

          <div style={card()}>
            <p style={{ color: T.sub, fontSize: 12, marginBottom: 8 }}>الحصة الحالية</p>
            <p style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{liveNow?.title ?? '—'}</p>
            <p style={{ color: T.dim, fontSize: 11, marginTop: 4 }}>قناة: {liveNow?.agora_channel ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// STUDENTS ────────────────────────────────────────────────────────────────────
function StudentsScreen() {
  const [search, setSearch] = useState('');
  const students = [
    { name: 'أحمد الحمي',     spec: 'الصف A', pct: 95, qpct: 92, color: '#3B82F6' },
    { name: 'عاطفة علي',      spec: 'الصف B', pct: 95, qpct: 92, color: '#7C3AED' },
    { name: 'حاكم المطار',    spec: 'الصف A', pct: 95, qpct: 92, color: '#0E7490' },
    { name: 'Sarah Johnson',  spec: 'الصف B', pct: 92, qpct: 92, color: '#16A34A' },
    { name: 'حمد لبطان',      spec: 'الصف A', pct: 93, qpct: 92, color: '#C9952A' },
    { name: 'نورة العتيبي',   spec: 'الصف B', pct: 88, qpct: 85, color: '#DB2777' },
    { name: 'خالد المنصوري',  spec: 'الصف A', pct: 90, qpct: 88, color: '#0891B2' },
    { name: 'ليلى الزهراني',  spec: 'الصف B', pct: 97, qpct: 96, color: '#16A34A' },
  ].filter(s => !search || s.name.includes(search));

  return (
    <div>
      <SectionTitle title="إدارة الطلاب" sub="عرض أداء طلابك ومتابعتهم"/>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: T.card, border: `1px solid ${T.border}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن طالب…" dir="rtl" style={{ background: 'none', border: 'none', color: T.text, fontSize: 13.5, outline: 'none', flex: 1, fontFamily: "'Cairo',sans-serif" }}/>
        </div>
        <button style={{ padding: '0 20px', borderRadius: 14, background: T.card, border: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          <span style={{ color: T.gold, fontSize: 12.5, fontWeight: 600 }}>فلتر</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
        {students.map((s, i) => (
          <div key={i} style={{ ...card({ display: 'flex', alignItems: 'center', gap: 14 }) }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: `linear-gradient(135deg,${s.color},${s.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: T.text, fontWeight: 700, fontSize: 13.5 }}>{s.name}</p>
              <p style={{ color: T.sub, fontSize: 11.5, marginTop: 3 }}>{s.spec}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Ring pct={s.pct} size={52} color={s.pct >= 90 ? T.green : T.orange}/>
              <Ring pct={s.qpct} size={52} color={T.gold}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function TeacherMobileApp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { teacher, upcoming, stats, liveNow, recentSubmissions } = useAppSelector(s => s.teacher);
  const { exams, homeworks } = useAppSelector(s => s.teacherExams);
  const [screen, setScreen] = useState<Screen>('home');

  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchTeacherExams());
    dispatch(fetchTeacherHomework());
  }, [dispatch]);

  const pendingTotal = (stats?.pending_homework_subs ?? 0) + (stats?.pending_exam_subs ?? 0);

  const handleLogout = () => { dispatch(logout()); navigate('/login', { replace: true }); };

  const handleStart = async (classId: number) => {
    const cls = upcoming.find(u => u.id === classId);
    if (!cls) return;
    if (cls.status === 'live' && cls.agora_channel) {
      navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
    } else {
      await dispatch(updateTeacherClassStatus(classId));
      dispatch(fetchTeacherDashboard());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', background: T.bg, fontFamily: "'Cairo',sans-serif", direction: 'rtl' }}>
      {/* Sidebar (right in RTL) */}
      <Sidebar active={screen} onNav={setScreen} teacher={teacher} pendingTotal={pendingTotal} onLogout={handleLogout}/>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', scrollbarWidth: 'thin', scrollbarColor: `${T.border} transparent` }}>
        {screen === 'home' && (
          <HomeScreen stats={stats} upcoming={upcoming} teacher={teacher} recentSubmissions={recentSubmissions}/>
        )}
        {screen === 'schedule' && (
          <ScheduleScreen upcoming={upcoming} onStart={handleStart}/>
        )}
        {screen === 'homework' && (
          <HomeworkScreen homeworks={homeworks}/>
        )}
        {screen === 'exams' && (
          <ExamsScreen exams={exams}/>
        )}
        {screen === 'reports' && <ReportsScreen/>}
        {screen === 'ai' && <AIScreen teacher={teacher}/>}
        {screen === 'messages' && <MessagesScreen/>}
        {screen === 'live' && (
          <LiveRoomScreen liveNow={liveNow} onEnd={() => setScreen('home')}/>
        )}
        {screen === 'students' && <StudentsScreen/>}
      </main>
    </div>
  );
}
