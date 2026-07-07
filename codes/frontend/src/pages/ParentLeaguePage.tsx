import { useState, useEffect } from 'react';
import ParentLayout from '../components/ParentLayout';

const C = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', goldBdr: 'rgba(197,147,65,0.22)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  purple: '#8B5CF6', purpleBg: 'rgba(139,92,246,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
};

type LeaderEntry = {
  rank: number;
  name: string;
  pts: number;
  badge: string;
  level: string;
  trend: string;
  isMe?: boolean;
};

const LEADERBOARD: LeaderEntry[] = [
  { rank: 1,  name: 'أحمد محمد الشمري', pts: 12400, badge: '💎', level: 'سفير الياقوت',   trend: '+250' },
  { rank: 2,  name: 'سارة الزهراني',     pts: 10800, badge: '🏆', level: 'أبطال التعليم', trend: '+180' },
  { rank: 3,  name: 'محمد القحطاني',     pts: 9600,  badge: '🥇', level: 'نجوم الآباء',   trend: '+320' },
  { rank: 4,  name: 'نورة العمري',       pts: 8200,  badge: '⭐', level: 'ولي أمر متميز', trend: '+90'  },
  { rank: 5,  name: 'خالد الغامدي',      pts: 7100,  badge: '⭐', level: 'ولي أمر متميز', trend: '+140' },
  { rank: 15, name: 'أنت',              pts: 5420,  badge: '🌟', level: 'ولي أمر متميز', trend: '+75', isMe: true },
];

type BadgeEntry = {
  emoji: string;
  name: string;
  desc: string;
  pts: number;
  earned: boolean;
};

const MY_BADGES: BadgeEntry[] = [
  { emoji: '👁️', name: 'ولي أمر متابع',  desc: 'تتبعت نتائج 10 اختبارات',          pts: 100,  earned: true  },
  { emoji: '💡', name: 'داعم التعلم',    desc: 'شاهدت 5 توصيات ذكية',               pts: 250,  earned: true  },
  { emoji: '⭐', name: 'شريك النجاح',   desc: 'حضرت جلسة إرشاد واحدة',             pts: 500,  earned: true  },
  { emoji: '📚', name: 'أكاديمي الأسرة', desc: 'أكملت 3 دورات في أكاديمية الآباء', pts: 750,  earned: false },
  { emoji: '🏅', name: 'قائد الأسرة',   desc: 'حققت أهداف 3 أشهر متتالية',         pts: 1000, earned: false },
  { emoji: '💎', name: 'سفير الياقوت',  desc: 'بلغت 10,000 نقطة',                  pts: 2000, earned: false },
];

type ChallengeEntry = {
  name: string;
  pts: number;
  progress: number;
  total: number;
};

const CHALLENGES: ChallengeEntry[] = [
  { name: 'متابع الواجبات الأسبوعية', pts: 50,  progress: 3, total: 5  },
  { name: 'قارئ التوصيات الذكية',     pts: 30,  progress: 7, total: 10 },
  { name: 'حضور جلسة إرشاد شهرية',   pts: 100, progress: 0, total: 1  },
];

const HOW_TO_EARN = [
  { action: 'تتبع نتائج الاختبارات', pts: 10 },
  { action: 'مشاهدة توصية ذكية', pts: 5 },
  { action: 'حضور جلسة إرشاد', pts: 100 },
  { action: 'إكمال دورة في أكاديمية الآباء', pts: 250 },
  { action: 'تحقيق هدف شهري', pts: 150 },
  { action: 'مراسلة معلم', pts: 20 },
  { action: 'الدخول اليومي للمنصة', pts: 3 },
];

const MY_PTS = 5420;
const NEXT_LEVEL_PTS = 7500;
const MY_RANK = 15;

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(135deg,#C59341,#D4A65A)' }} />
        <h1 style={{ color: '#1B2038', fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      </div>
      <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>{sub}</p>
    </div>
  );
}

const RANK_STYLES: Record<number, { grad: string; medal: string }> = {
  1: { grad: 'linear-gradient(135deg,#FFD700,#FFA500)', medal: '🥇' },
  2: { grad: 'linear-gradient(135deg,#C0C0C0,#A0A0A0)', medal: '🥈' },
  3: { grad: 'linear-gradient(135deg,#CD7F32,#B87333)', medal: '🥉' },
};

function TopThreeCard({ entry, stacked }: { entry: LeaderEntry; stacked?: boolean }) {
  const style = RANK_STYLES[entry.rank];
  return (
    <div style={{
      borderRadius: 16, padding: 18, background: style.grad,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', textAlign: 'center',
      flex: stacked ? 'none' : 1, minWidth: 0, position: 'relative',
    }}>
      <div style={{ fontSize: 36, marginBottom: 4 }}>{style.medal}</div>
      <p style={{ color: '#fff', fontWeight: 900, fontSize: 14, margin: '0 0 4px' }}>{entry.name}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, margin: '0 0 8px' }}>{entry.level}</p>
      <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 8, padding: '5px 12px', display: 'inline-block' }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{entry.pts.toLocaleString('ar-SA')}</span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, marginRight: 3 }}>نقطة</span>
      </div>
      <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
        {entry.trend} هذا الأسبوع
      </div>
    </div>
  );
}

export default function ParentLeaguePage() {
  const [_tab, _setTab] = useState('weekly');
  const pct = Math.min((MY_PTS / NEXT_LEVEL_PTS) * 100, 100);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif" }}>
        <PageHeader title="أولومبياد ولادي 🏅" sub="تنافس مع أولياء الأمور وارتقِ في المراتب بمتابعة أبنائك" />

        {/* My Stats Banner */}
        <div style={{
          background: C.navy, borderRadius: 20, padding: isMobile ? '20px' : '22px 26px',
          marginBottom: 22, boxShadow: '0 6px 28px rgba(13,30,58,0.25)',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 14 : 24,
        }}>
          {!isMobile && <div style={{ fontSize: 60, lineHeight: 1 }}>🌟</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: 20, margin: 0 }}>ولي أمر متميز</p>
              <span style={{ background: C.goldGrad, color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 6, padding: '2px 8px' }}>
                المركز #{MY_RANK}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '0 0 12px' }}>
              <span style={{ color: C.goldL, fontWeight: 800, fontSize: 16 }}>{MY_PTS.toLocaleString('ar-SA')}</span> نقطة
              &nbsp;·&nbsp; يتبقى <span style={{ color: C.goldL, fontWeight: 700 }}>{(NEXT_LEVEL_PTS - MY_PTS).toLocaleString('ar-SA')}</span> نقطة للمستوى التالي
            </p>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 4,
                background: C.goldGrad, transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>ولي أمر متميز</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>نجوم الآباء → {NEXT_LEVEL_PTS.toLocaleString('ar-SA')}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: C.goldL, fontSize: 40, fontWeight: 900, margin: 0, lineHeight: 1 }}>#{MY_RANK}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '4px 0 0' }}>ترتيبك العام</p>
          </div>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 18, alignItems: isMobile ? 'stretch' : 'flex-start' }}>

          {/* LEFT: Leaderboard */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: '0 0 16px' }}>قائمة المتصدرين</h2>

              {/* Top 3 */}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10, marginBottom: 20 }}>
                {LEADERBOARD.filter(e => e.rank <= 3).map(e => (
                  <TopThreeCard key={e.rank} entry={e} stacked={isMobile} />
                ))}
              </div>

              {/* Ranks 4-5 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {LEADERBOARD.filter(e => e.rank > 3 && !e.isMe).map((e) => (
                  <div key={e.rank} style={{
                    display: 'flex', alignItems: 'center', padding: '11px 14px',
                    borderRadius: 10, marginBottom: 4,
                    background: 'transparent', transition: 'background 0.15s',
                    borderBottom: `1px solid ${C.border}`,
                  }}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLDivElement).style.background = C.goldBg; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <span style={{ color: C.dim, fontWeight: 800, fontSize: 15, width: 28, flexShrink: 0 }}>#{e.rank}</span>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: C.goldBg, border: `2px solid ${C.goldBdr}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: C.gold, fontWeight: 900, fontSize: 13, marginLeft: 10,
                    }}>
                      {e.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: 0 }}>{e.name}</p>
                      <span style={{
                        background: C.goldBg, color: C.gold, fontSize: 10,
                        fontWeight: 700, borderRadius: 5, padding: '1px 7px',
                      }}>{e.level}</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: C.text, fontWeight: 800, fontSize: 14, margin: 0 }}>{e.pts.toLocaleString('ar-SA')}</p>
                      <p style={{ color: C.green, fontSize: 11, margin: '2px 0 0', textAlign: 'center' }}>{e.trend}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ color: C.dim, fontSize: 11 }}>· · ·</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* My Row */}
              {LEADERBOARD.filter(e => e.isMe).map(e => (
                <div key="me" style={{
                  display: 'flex', alignItems: 'center', padding: '12px 14px',
                  borderRadius: 12, background: C.goldBg, border: `1.5px solid ${C.goldBdr}`,
                }}>
                  <span style={{ color: C.gold, fontWeight: 900, fontSize: 15, width: 28, flexShrink: 0 }}>#{e.rank}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: C.goldGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 14, marginLeft: 10,
                    boxShadow: '0 2px 8px rgba(197,147,65,0.4)',
                  }}>أ</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <p style={{ color: C.gold, fontWeight: 800, fontSize: 13, margin: 0 }}>{e.name}</p>
                      <span style={{ background: C.goldGrad, color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 5, padding: '1px 6px' }}>أنت</span>
                    </div>
                    <span style={{ background: C.goldBg, color: C.gold, fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '1px 7px' }}>{e.level}</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ color: C.gold, fontWeight: 900, fontSize: 15, margin: 0 }}>{e.pts.toLocaleString('ar-SA')}</p>
                    <p style={{ color: C.green, fontSize: 11, margin: '2px 0 0', textAlign: 'center' }}>{e.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Challenges + Badges */}
          <div style={{ width: isMobile ? '100%' : 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Weekly Challenges */}
            <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 18 }}>🎯</span> تحديات الأسبوع
              </h2>
              {CHALLENGES.map((ch, i) => {
                const pct = ch.total > 0 ? (ch.progress / ch.total) * 100 : 0;
                return (
                  <div key={i} style={{ marginBottom: i < CHALLENGES.length - 1 ? 16 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{ch.name}</span>
                      <span style={{ color: C.gold, fontSize: 11, fontWeight: 800 }}>+{ch.pts} نقطة</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.goldBg, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: C.goldGrad, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ color: C.sub, fontSize: 11, whiteSpace: 'nowrap' }}>{ch.progress}/{ch.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* My Badges */}
            <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow }}>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 18 }}>🏅</span> شاراتي
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                {MY_BADGES.map((b, i) => (
                  <div key={i} title={b.earned ? b.desc : `${b.desc} (${b.pts} نقطة)`} style={{
                    borderRadius: 12, padding: '12px 8px', textAlign: 'center',
                    background: b.earned ? C.goldBg : '#F5F5F5',
                    border: `1.5px solid ${b.earned ? C.goldBdr : C.border}`,
                    cursor: 'default', position: 'relative', transition: 'transform 0.15s',
                    opacity: b.earned ? 1 : 0.6,
                  }}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)'; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                  >
                    <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 4, filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
                    {!b.earned && (
                      <div style={{
                        position: 'absolute', top: 6, left: 6,
                        width: 16, height: 16, borderRadius: '50%',
                        background: C.dim, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="9" height="9" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                    <p style={{ color: b.earned ? C.gold : C.dim, fontSize: 10, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{b.name}</p>
                    {!b.earned && (
                      <p style={{ color: C.dim, fontSize: 9, margin: '3px 0 0' }}>{b.pts} نقطة</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How to earn points */}
        <div style={{ background: C.card, borderRadius: 16, padding: 20, boxShadow: C.shadow, marginTop: 18 }}>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 18 }}>💡</span> كيف تكسب النقاط؟
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            {HOW_TO_EARN.map((item, i) => (
              <div key={i} style={{
                borderRadius: 10, padding: '10px 14px',
                background: C.goldBg, border: `1px solid ${C.goldBdr}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: C.text, fontSize: 12 }}>{item.action}</span>
                <span style={{
                  background: C.goldGrad, color: '#fff', fontSize: 11, fontWeight: 800,
                  borderRadius: 6, padding: '2px 8px', flexShrink: 0, marginRight: 6,
                }}>+{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
