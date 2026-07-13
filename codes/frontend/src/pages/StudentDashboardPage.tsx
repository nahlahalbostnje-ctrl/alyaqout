import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentDashboard } from '../features/student/studentSlice';
import { fetchMyPoints, fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#F2EDE4',
  card:     '#FFFFFF',
  navy:     '#0D1535',
  navy2:    '#1B2038',
  gold:     '#C9952A',
  goldL:    '#DDAD50',
  goldGrad: 'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:   'rgba(201,149,42,0.09)',
  goldBdr:  'rgba(201,149,42,0.25)',
  text:     '#1B2038',
  sub:      '#6B7280',
  dim:      '#9CA3AF',
  border:   'rgba(0,0,0,0.07)',
  shadow:   '0 2px 14px rgba(0,0,0,0.07)',
  red:      '#EF4444',
  blue:     '#2563EB',
  green:    '#16A34A',
  purple:   '#7C3AED',
};
// ─── Feature flag: set false to hide daily-tasks card & rely on WhatsApp reminders ──
// The WhatsApp reminder is sent via NotificationService::sendWhatsApp() on the backend
// (triggered by a scheduled job) to inform students of pending tasks.
const SHOW_DAILY_TASKS_CARD = true;

// ─── WarriorShield ───────────────────────────────────────────────────────────
function WarriorShield({ level }: { level:number }) {
  return (
    <div style={{ position:'relative', width:100, height:110, margin:'0 auto 8px' }}>
      <svg width="100" height="110" viewBox="0 0 100 110" style={{ position:'absolute', inset:0 }}>
        <defs>
          <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D060"/><stop offset="100%" stopColor="#C9952A"/>
          </linearGradient>
          <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a"/><stop offset="100%" stopColor="#0D1535"/>
          </linearGradient>
          <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#90CAF9"/><stop offset="100%" stopColor="#1565C0"/>
          </linearGradient>
        </defs>
        {[-35,-20,-5].map((a,i) => (
          <ellipse key={`l${i}`} cx={18+i*4} cy={55+i*12} rx={7} ry={12}
            fill="url(#wg)" opacity={0.85} transform={`rotate(${a} ${18+i*4} ${55+i*12})`}/>
        ))}
        {[35,20,5].map((a,i) => (
          <ellipse key={`r${i}`} cx={82-i*4} cy={55+i*12} rx={7} ry={12}
            fill="url(#wg)" opacity={0.85} transform={`rotate(${a} ${82-i*4} ${55+i*12})`}/>
        ))}
        <path d="M50,8 L84,22 L84,60 Q84,82 50,95 Q16,82 16,60 L16,22 Z"
          fill="url(#sg)" stroke="url(#wg)" strokeWidth="3.5"/>
        <path d="M50,14 L79,26 L79,60 Q79,78 50,89 Q21,78 21,60 L21,26 Z"
          fill="none" stroke="rgba(240,208,96,0.2)" strokeWidth="1"/>
        <polygon points="50,28 68,44 50,72 32,44" fill="url(#gg)"/>
        <polygon points="50,28 68,44 50,50 32,44" fill="#BBDEFB" opacity="0.65"/>
        <polygon points="50,72 68,44 50,56" fill="#0D47A1"/>
        <polygon points="50,72 32,44 50,56" fill="#1565C0"/>
        <polygon points="50,28 56,36 50,33" fill="white" opacity="0.45"/>
        <path d="M33,92 Q50,102 67,92" stroke="url(#wg)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', top:2, right:2, width:26, height:26, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#1B2038', fontWeight:900, fontSize:11, border:'2px solid #fff', boxShadow:'0 2px 8px rgba(201,149,42,0.6)', zIndex:2 }}>
        {level}
      </div>
    </div>
  );
}

const SecH = ({ title, sub }: { title:string; sub?:string }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{title}</p>
    {sub && <p style={{ color:C.gold, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>{sub}</p>}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { student, upcoming, courses, dashStats, subscription } = useAppSelector(s => s.student);
  const { totalPoints, leaderboard, history } = useAppSelector(s => s.gamification);
  const user = useAppSelector(s => s.auth.user);

  // Responsive: detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { dispatch(fetchStudentDashboard()); dispatch(fetchMyPoints()); dispatch(fetchLeaderboard()); }, [dispatch]);

  const firstName = student?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? '...';
  const pts    = dashStats?.total_points ?? totalPoints ?? 0;
  const level  = dashStats?.level ?? Math.floor(pts / 500) + 1;
  const xpIn   = dashStats?.xp_in_level ?? (pts % 500);
  const xpNext = dashStats?.xp_for_next ?? 500;
  const live   = upcoming.find(c => c.status === 'live') ?? null;
  const nextClass = upcoming.find(c => c.status === 'scheduled') ?? upcoming[0] ?? null;
  const leagueTop = [...leaderboard].sort((a, b) => a.rank - b.rank).slice(0, 3);
  const recentHistory = history.slice(0, 3);
  const pendingHw = dashStats?.pending_homework ?? 0;
  const upcomingExams = dashStats?.upcoming_exams ?? 0;
  const daysLeft = subscription?.days_remaining;
  type Rec = { color: string; bg: string; icon: string; label: string; title: string; desc: string; contactLabel: string; contactTo: string };
  const recs: Rec[] = [];
  if (pendingHw > 0) {
    recs.push({
      color: '#2563EB', bg: 'rgba(37,99,235,0.07)',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      label: 'واجب متأخر', title: 'واجبات بانتظار التسليم',
      desc: `لديك ${pendingHw} واجب${pendingHw > 1 ? 'ات' : ''} لم يُسلَّم — راجع مع أستاذك`,
      contactLabel: 'تواصل مع الأستاذ', contactTo: '/student/teacher-contact',
    });
  }
  if (upcomingExams > 0) {
    recs.push({
      color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      label: 'امتحان قادم', title: 'امتحانات قادمة',
      desc: `لديك ${upcomingExams} امتحان${upcomingExams > 1 ? 'ات' : ''} قادم${upcomingExams > 1 ? 'ة' : ''} — استعد جيداً`,
      contactLabel: 'عرض الامتحانات', contactTo: '/student/exams',
    });
  }
  if (daysLeft != null && daysLeft <= 14) {
    recs.push({
      color: '#C9952A', bg: 'rgba(201,149,42,0.07)',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      label: 'اشتراك', title: 'اشتراكك ينتهي قريباً',
      desc: `يتبقى ${daysLeft} يوم — تواصل مع الإدارة لتجديد اشتراكك`,
      contactLabel: 'تواصل مع الإدارة', contactTo: '/student/messages',
    });
  }

  const card: CSSProperties = {
    background:C.card, borderRadius:18, padding:'14px 16px',
    boxShadow:C.shadow, border:`1px solid ${C.border}`,
  };

  const infoCols    = isMobile ? '1fr' : 'repeat(3,1fr)';
  const statsCols   = isMobile ? '1fr' : 'repeat(3,1fr)';

  return (
    <StudentLayout>
    <div dir="rtl" style={{ fontFamily:"'Cairo',sans-serif" }}>

        <div style={{ padding: isMobile ? '14px 12px 0' : '18px 20px 0' }}>

          {/* ── Welcome + Warrior Level Card ── */}
          <div style={{ background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:20, padding: isMobile ? '16px' : '18px 22px', marginBottom:12, border:'1px solid rgba(201,149,42,0.3)', boxShadow:'0 6px 20px rgba(13,21,53,0.45)', display:'flex', alignItems:'center', gap:16, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <WarriorShield level={level} />
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:18 }}>👋</span>
                <h1 style={{ color:'#fff', fontWeight:900, fontSize: isMobile ? 16 : 19, margin:0 }}>مرحباً {firstName}</h1>
              </div>
              <p style={{ color:C.goldL, fontSize:11.5, marginTop:2, marginBottom:8 }}>المحارب الياقوتي — المستوى {level}</p>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9.5, color:'rgba(255,255,255,0.45)', marginBottom:4 }}>
                <span>{xpIn.toLocaleString()}</span><span>{xpNext.toLocaleString()} XP</span>
              </div>
              <div style={{ height:5, background:'rgba(255,255,255,0.12)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(xpIn/xpNext)*100)}%`, background:'linear-gradient(90deg,#3B82F6,#1D4ED8)', borderRadius:3 }}/>
              </div>
            </div>
          </div>

          {/* Daily Tasks reminder — hidden when SHOW_DAILY_TASKS_CARD = false */}
          {SHOW_DAILY_TASKS_CARD && (
            <div style={{ display:'flex', alignItems:'center', gap:12, background:C.goldBg, border:`1px solid ${C.goldBdr}`, borderRadius:14, padding:'10px 16px', marginBottom:12 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>✨</span>
              <p style={{ flex:1, color:C.text, fontSize:12, fontWeight:600, margin:0 }}>أكمل مهامك اليومية واربح مكافآت رائعة</p>
              <button onClick={()=>navigate('/student/homework')} style={{ flexShrink:0, padding:'7px 16px', borderRadius:9, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11.5, border:'none', cursor:'pointer' }}>
                عرض المهام
              </button>
            </div>
          )}

          {/* ── Current Class Card ── */}
          <div style={{ background:'linear-gradient(135deg,#0F1E5A 0%,#0D1535 100%)', borderRadius:22, padding:'16px 18px 14px', marginBottom:12, position:'relative', overflow:'hidden', boxShadow:'0 10px 32px rgba(13,21,53,0.55)' }}>
            <div style={{ position:'absolute', insetInlineEnd:-20, top:'50%', transform:'translateY(-55%)', opacity:0.06, fontSize:90, lineHeight:1 }}>🖥️</div>

            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600 }}>الحصة الحالية</span>
            </div>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <h2 style={{ color:'#fff', fontWeight:900, fontSize: isMobile ? 20 : 24, lineHeight:1.2, margin:'0 0 4px' }}>
                  {live?.title ?? 'لا توجد حصة مجدولة الآن'}
                </h2>
                <p style={{ color:C.goldL, fontSize:12, fontWeight:600 }}>
                  {live ? `الأستاذ ${live.teacher?.name}` : 'تحقق من جدولك لاحقاً'}
                </p>
              </div>
            </div>

            <button
              onClick={()=>live?navigate(`/live/${live.agora_channel??'demo'}?classId=${live.id}`):navigate('/student/live-classes')}
              style={{ width:'100%', padding:'12px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:900, fontSize:14, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 5px 20px rgba(201,149,42,0.5)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              دخول الحصة الآن
            </button>
          </div>

          {/* ── Smart Recommendations ── */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:4, height:18, borderRadius:2, background:C.goldGrad }}/>
              <p style={{ color:C.text, fontWeight:800, fontSize:13 }}>توصيات ذكية</p>
            </div>
            {recs.length === 0 ? (
              <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'16px 0', background:C.card, borderRadius:14, border:`1px solid ${C.border}` }}>لا توجد توصيات حالياً</p>
            ) : (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(recs.length, 3)},1fr)`, gap:8 }}>
              {recs.map((rec, i) => (
                <div key={i} style={{ background:rec.bg, border:`1px solid ${rec.color}22`, borderRadius:14, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:rec.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={rec.icon}/>
                      </svg>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <span style={{ background:`${rec.color}20`, color:rec.color, fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>{rec.label}</span>
                      <p style={{ color:C.text, fontWeight:700, fontSize:12, marginTop:2 }}>{rec.title}</p>
                    </div>
                  </div>
                  <p style={{ color:C.sub, fontSize:11, lineHeight:1.55, margin:0 }}>{rec.desc}</p>
                  <button onClick={()=>navigate(rec.contactTo)} style={{ width:'100%', padding:'7px', borderRadius:9, background:rec.color, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                    {rec.contactLabel}
                  </button>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* ── 3 Info Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:infoCols, gap:10, marginBottom:12 }}>

            {/* Next Class */}
            <div style={{ ...card }}>
              <SecH title="الحصة القادمة" />
              {nextClass ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B2038" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ color:C.gold, fontWeight:700, fontSize:12.5 }}>{nextClass.course?.title}</p>
                      <p style={{ color:C.sub, fontSize:10.5 }}>أ. {nextClass.teacher?.name}</p>
                    </div>
                  </div>
                  <p style={{ color:C.sub, fontSize:11, marginBottom:8 }}>
                    {new Date(nextClass.scheduled_at).toLocaleString('ar-EG',{weekday:'short',hour:'2-digit',minute:'2-digit'})}
                  </p>
                </>
              ) : (
                <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'10px 0' }}>لا توجد حصص قادمة</p>
              )}
              <button onClick={()=>navigate('/student/live-classes')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer', minHeight:36 }}>
                عرض الجدول الكامل
              </button>
            </div>

            {/* Challenges */}
            <div style={{ ...card }}>
              <SecH title="تحديات اليوم" sub="🎯" />
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
                {recentHistory.length === 0 ? (
                  <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'10px 0' }}>لا توجد تحديات حالياً</p>
                ) : recentHistory.map((ch,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,#1B2038,#2D3561)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0 }}>⭐</div>
                      <span style={{ color:C.text, fontSize:10.5 }}>{ch.label || ch.description || ch.action}</span>
                    </div>
                    <span style={{ color:C.green, fontSize:10.5, fontWeight:700, flexShrink:0 }}>+{ch.points} XP</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate('/student/challenges')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer', minHeight:36 }}>
                عرض جميع التحديات
              </button>
            </div>

            {/* Achievements */}
            <div style={{ ...card }}>
              <SecH title="إنجازاتك" />
              <div style={{ textAlign:'center', marginBottom:6 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 5px', fontSize:22, boxShadow:'0 4px 14px rgba(201,149,42,0.4)' }}>⭐</div>
                <p style={{ color:C.text, fontWeight:700, fontSize:12 }}>المستوى {level}</p>
              </div>
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:9.5, color:C.dim, marginBottom:3 }}>
                  <span>التقدم</span><span>{Math.min(100, Math.round((xpIn/xpNext)*100))}%</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:`${C.gold}1A` }}>
                  <div style={{ height:'100%', width:`${Math.min(100,(xpIn/xpNext)*100)}%`, borderRadius:3, background:C.goldGrad }}/>
                </div>
              </div>
              <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:11, cursor:'pointer', minHeight:36 }}>
                عرض الإنجازات
              </button>
            </div>
          </div>

          {/* ── 3 Stats Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:statsCols, gap:10, marginBottom:10 }}>

            {/* Development */}
            <div style={{ ...card }}>
              <SecH title="مستوى التطور" />
              {courses.length === 0 ? (
                <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'16px 0' }}>لا توجد بيانات مواد بعد</p>
              ) : (
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    {courses.slice(0, 5).map(c => (
                      <div key={c.id} style={{ marginBottom:6 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                          <span style={{ color:C.sub, fontSize:9.5 }}>{c.category?.name ?? c.title}</span>
                          <span style={{ color:C.gold, fontSize:9.5, fontWeight:700 }}>{c.is_free ? 'مجاني' : `${c.price}`}</span>
                        </div>
                        <div style={{ height:4, borderRadius:3, background:`${C.gold}18` }}>
                          <div style={{ height:'100%', width:'100%', borderRadius:3, background:C.gold }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={()=>navigate('/student/report')} style={{ width:'100%', marginTop:8, padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                عرض التقرير الكامل
              </button>
            </div>

            {/* League */}
            <div style={{ ...card }}>
              <SecH title="ترتيب الصف" />
              {leagueTop.length === 0 ? (
                <p style={{ color:C.sub, fontSize:12, textAlign:'center', padding:'16px 0' }}>لا يوجد ترتيب بعد</p>
              ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
                {leagueTop.map(p => (
                  <div key={p.rank} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:10, background: p.rank===1 ? C.goldBg : 'transparent' }}>
                    <span style={{ width:20, textAlign:'center', color: p.rank===1?C.gold:C.sub, fontSize:11, fontWeight:800 }}>#{p.rank}</span>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:C.goldGrad, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, flexShrink:0 }}>
                      {p.name.charAt(0)}
                    </div>
                    <span style={{ flex:1, color:C.text, fontSize:10.5, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                    <span style={{ color:C.sub, fontSize:9.5, fontWeight:700 }}>{p.points.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              )}
              <button onClick={()=>navigate('/student/league')} style={{ width:'100%', padding:'8px', borderRadius:10, background:'linear-gradient(135deg,#162144,#0D1535)', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                عرض الترتيب الكامل
              </button>
            </div>

            {/* Points */}
            <div style={{ ...card, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <SecH title="نقاطي" />
              <div style={{ width:52, height:52, borderRadius:'50%', background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', margin:'2px 0 10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
              <span style={{ color:C.text, fontWeight:900, fontSize:26, lineHeight:1, marginBottom:2 }}>{pts.toLocaleString()}</span>
              <p style={{ color:C.sub, fontSize:11, marginBottom:12 }}>نقطة</p>
              <button onClick={()=>navigate('/student/points')} style={{ width:'100%', padding:'8px', borderRadius:10, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:11, border:'none', cursor:'pointer', minHeight:36 }}>
                متجر المكافآت
              </button>
            </div>
          </div>

        </div>
    </div>
    </StudentLayout>
  );
}
