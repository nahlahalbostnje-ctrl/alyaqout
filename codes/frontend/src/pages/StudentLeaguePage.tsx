import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentBottomNav from '../components/StudentBottomNav';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchLeagues, joinLeague, fetchLeagueDetail, clearActiveLeague,
  type League,
} from '../features/student/leagueSlice';

// ── Design tokens (same as StudentDashboardPage) ─────────────────────────────
const C = {
  bg: '#F2EDE4', card: '#FFFFFF', navy: '#0D1535', navy2: '#1B2038',
  gold: '#C9952A', goldL: '#DDAD50', goldGrad: 'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg: 'rgba(201,149,42,0.09)', goldBdr: 'rgba(201,149,42,0.25)',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: 'rgba(0,0,0,0.07)',
  shadow: '0 2px 14px rgba(0,0,0,0.07)',
  red: '#EF4444', blue: '#2563EB', green: '#16A34A', purple: '#7C3AED',
};
const SW = 195;
const BH = 60;
const font = { fontFamily: "'Cairo', sans-serif" };

// ── Static mock data (fallback when API returns empty) ──────────────────────
const MOCK_LEAGUES: League[] = [
  { id:1, name:'دوري الرياضيات المتقدم', type:'group', status:'active',  i_joined:true,  participants_count:248, max_participants:500, starts_at:'2026-06-01', ends_at:'2026-06-30' },
  { id:2, name:'تحدي اللغة الإنجليزية', type:'1v1',   status:'active',  i_joined:false, participants_count:86,  max_participants:100, starts_at:'2026-06-15', ends_at:'2026-06-25' },
  { id:3, name:'بطولة العلوم الفصلية',   type:'group', status:'pending', i_joined:false, participants_count:12,  max_participants:200, starts_at:'2026-07-01', ends_at:'2026-07-31' },
  { id:4, name:'دوري الياقوت الكبير',    type:'group', status:'ended',   i_joined:true,  participants_count:500, max_participants:500, starts_at:'2026-05-01', ends_at:'2026-05-31' },
];

const MOCK_LEADERBOARD = [
  { rank:1, name:'أحمد سالم',     score:5820, is_me:false, student_id:1 },
  { rank:2, name:'سارة محمد',     score:5210, is_me:false, student_id:2 },
  { rank:3, name:'محمد خالد',     score:4980, is_me:false, student_id:3 },
  { rank:4, name:'نورة العتيبي',  score:4760, is_me:false, student_id:4 },
  { rank:5, name:'أنت',           score:4450, is_me:true,  student_id:5 },
  { rank:6, name:'عمر الشمري',    score:4200, is_me:false, student_id:6 },
  { rank:7, name:'ريم الزهراني',  score:3980, is_me:false, student_id:7 },
  { rank:8, name:'فهد الغامدي',   score:3720, is_me:false, student_id:8 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const medal: Record<number,string> = { 1:'🥇', 2:'🥈', 3:'🥉' };
const medalColor: Record<number,string> = { 1:'#F0D060', 2:'#B0BEC5', 3:'#CD7F32' };

function fDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day:'numeric', month:'long' });
}

function StatusBadge({ s }: { s: League['status'] }) {
  const map = { active:['جارٍ الآن','#10B981'], pending:['قريباً','#F59E0B'], ended:['منتهٍ','#9CA3AF'] };
  const [label, color] = map[s] ?? ['—','#9CA3AF'];
  return <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:`${color}18`, color, border:`1px solid ${color}30` }}>{label}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentLeaguePage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { leagues, activeLeague, loading } = useAppSelector(s => s.league);
  const [joiningId, setJoiningId] = useState<number|null>(null);
  const [joinError, setJoinError] = useState<string|null>(null);
  const [tab, setTab]             = useState<'leagues'|'board'>('leagues');

  useEffect(() => {
    dispatch(fetchLeagues());
    return () => { dispatch(clearActiveLeague()); };
  }, [dispatch]);

  const displayLeagues = leagues.length > 0 ? leagues : MOCK_LEAGUES;

  const handleJoin = async (leagueId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJoiningId(leagueId); setJoinError(null);
    const res = await dispatch(joinLeague(leagueId));
    if (joinLeague.rejected.match(res)) setJoinError(res.payload as string ?? 'تعذّر الانضمام');
    setJoiningId(null);
  };

  const handleOpen = (leagueId: number) => dispatch(fetchLeagueDetail(leagueId));

  const myEntry  = MOCK_LEADERBOARD.find(e => e.is_me);
  const top3     = MOCK_LEADERBOARD.slice(0,3);
  const rest     = MOCK_LEADERBOARD.slice(3);
  const cardS    = { background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, ...font, direction:'rtl' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:SW, flexShrink:0, background:C.card, borderLeft:`1px solid ${C.border}`, height:'100vh', position:'sticky', top:0, overflowY:'auto', scrollbarWidth:'none', display:'flex', flexDirection:'column', paddingBottom:BH+10 }}>
        {/* Back */}
        <div style={{ padding:'16px 14px 0' }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:12, background:'linear-gradient(160deg,#162144,#0D1535)', border:`1px solid ${C.goldBdr}`, color:C.goldL, fontWeight:700, fontSize:12, cursor:'pointer', width:'100%', ...font }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            العودة للرئيسية
          </button>
        </div>

        {/* My Stats */}
        <div style={{ margin:'14px 10px 0', padding:'16px 12px', background:'linear-gradient(160deg,#162144,#0D1535)', borderRadius:16, border:'1px solid rgba(201,149,42,0.3)', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:6 }}>🏆</div>
          <p style={{ color:'#fff', fontWeight:800, fontSize:13 }}>مركزك الحالي</p>
          <p style={{ color:C.goldL, fontWeight:900, fontSize:28, lineHeight:1.2, marginTop:4 }}>#{myEntry?.rank ?? 5}</p>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>من {MOCK_LEADERBOARD.length} مشارك</p>
          <div style={{ marginTop:12, padding:'8px', borderRadius:10, background:'rgba(201,149,42,0.15)', border:'1px solid rgba(201,149,42,0.25)' }}>
            <p style={{ color:C.goldL, fontWeight:900, fontSize:18 }}>{myEntry?.score?.toLocaleString() ?? '4,450'}</p>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>نقطة</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:4 }}>
          {[
            { tab:'leagues' as const, icon:'🎯', label:'الدوريات المتاحة' },
            { tab:'board'   as const, icon:'🏅', label:'ترتيب المتنافسين' },
          ].map(item => (
            <button key={item.tab} onClick={()=>setTab(item.tab)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, border:'none', cursor:'pointer', textAlign:'right', fontSize:12, fontWeight:600, transition:'all 0.15s', ...font,
                background: tab===item.tab ? C.goldGrad : 'transparent',
                color:      tab===item.tab ? '#1B2038'  : C.sub,
              }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex:1, overflowY:'auto', paddingBottom:BH+20 }}>

        {/* Hero Banner */}
        <div style={{ background:'linear-gradient(135deg,#0D1535 0%,#1B2038 60%,#162144 100%)', padding:'28px 24px 32px', position:'relative', overflow:'hidden' }}>
          {/* Decorative circles */}
          {[...Array(4)].map((_,i)=>(
            <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(201,149,42,${0.08-i*0.015})`,
              width:120+i*80, height:120+i*80, top:'50%', right:'-20px',
              transform:'translateY(-50%)', pointerEvents:'none' }} />
          ))}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 4px 16px rgba(201,149,42,0.4)' }}>🏆</div>
              <div>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:600, marginBottom:2 }}>منصة الياقوت</p>
                <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>دوري الياقوت</h1>
              </div>
            </div>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, maxWidth:380 }}>تنافس مع أفضل الطلاب واكسب نقاط XP لترقية مستواك في الدوري</p>

            {/* Quick Stats */}
            <div style={{ display:'flex', gap:12, marginTop:18, flexWrap:'wrap' }}>
              {[
                { icon:'👥', val:'248', label:'مشارك' },
                { icon:'🎯', val:String(displayLeagues.filter(l=>l.status==='active').length), label:'دوري نشط' },
                { icon:'⭐', val:`#${myEntry?.rank ?? 5}`, label:'مركزك' },
              ].map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize:18 }}>{s.icon}</span>
                  <div>
                    <p style={{ color:'#fff', fontWeight:900, fontSize:16, lineHeight:1 }}>{s.val}</p>
                    <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding:'20px 20px 0' }}>

          {/* Error */}
          {joinError && (
            <div style={{ marginBottom:12, padding:'10px 14px', borderRadius:12, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:C.red, fontSize:13 }}>
              {joinError}
              <button onClick={()=>setJoinError(null)} style={{ marginRight:10, background:'none', border:'none', cursor:'pointer', color:C.red, fontSize:16 }}>×</button>
            </div>
          )}

          {/* ── TAB: Leagues ── */}
          {tab==='leagues' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <h2 style={{ color:C.text, fontWeight:900, fontSize:16 }}>الدوريات المتاحة</h2>
                <span style={{ color:C.gold, fontSize:12, fontWeight:600 }}>{displayLeagues.length} دوري</span>
              </div>

              {loading && (
                <div style={{ textAlign:'center', padding:40 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid ${C.goldBg}`, borderTopColor:C.gold, animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
                </div>
              )}

              <div style={{ display:'grid', gap:12 }}>
                {displayLeagues.map(lg => (
                  <div key={lg.id}
                    onClick={()=>handleOpen(lg.id)}
                    style={{ ...cardS, cursor:'pointer', borderRight: lg.i_joined ? `4px solid ${C.gold}` : `4px solid transparent`,
                      transition:'box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')}
                    onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>

                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                          <StatusBadge s={lg.status} />
                          <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                            background: lg.type==='1v1' ? 'rgba(239,68,68,0.1)' : C.goldBg,
                            color:      lg.type==='1v1' ? C.red : C.gold }}>
                            {lg.type==='1v1' ? '⚔️ 1v1' : '👥 جماعي'}
                          </span>
                          {lg.i_joined && <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'rgba(16,185,129,0.1)', color:'#10B981' }}>✓ مشارك</span>}
                        </div>
                        <h3 style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:6 }}>{lg.name}</h3>
                        <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                          <span style={{ color:C.sub, fontSize:12 }}>👥 {lg.participants_count}{lg.max_participants ? ` / ${lg.max_participants}` : ''} مشارك</span>
                          {lg.starts_at && <span style={{ color:C.sub, fontSize:12 }}>📅 {fDate(lg.starts_at)}</span>}
                          {lg.ends_at   && <span style={{ color:C.sub, fontSize:12 }}>🏁 {fDate(lg.ends_at)}</span>}
                        </div>
                      </div>

                      {/* Progress bar if joined */}
                      {lg.max_participants && (
                        <div style={{ width:56, textAlign:'center', flexShrink:0 }}>
                          <div style={{ fontSize:10, color:C.sub, marginBottom:4 }}>
                            {Math.round(lg.participants_count/lg.max_participants*100)}%
                          </div>
                          <div style={{ height:4, borderRadius:2, background:'rgba(0,0,0,0.07)' }}>
                            <div style={{ width:`${Math.min(lg.participants_count/lg.max_participants*100,100)}%`, height:'100%', borderRadius:2, background:C.goldGrad }}/>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
                      <button onClick={e=>{e.stopPropagation();handleOpen(lg.id);}}
                        style={{ fontSize:12, fontWeight:700, color:C.gold, background:'none', border:'none', cursor:'pointer', ...font, display:'flex', alignItems:'center', gap:4 }}>
                        <span>عرض الترتيب</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                      </button>

                      {!lg.i_joined && lg.status !== 'ended' ? (
                        <button onClick={e=>handleJoin(lg.id,e)} disabled={joiningId===lg.id}
                          style={{ padding:'8px 20px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:12, border:'none', cursor:'pointer', boxShadow:`0 3px 12px rgba(201,149,42,0.35)`, opacity:joiningId===lg.id?0.7:1, ...font }}>
                          {joiningId===lg.id ? '⏳ جاري...' : '⚡ انضم الآن'}
                        </button>
                      ) : lg.i_joined ? (
                        <span style={{ fontSize:12, fontWeight:700, color:'#10B981', display:'flex', alignItems:'center', gap:4 }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          مسجّل
                        </span>
                      ) : (
                        <span style={{ fontSize:12, color:C.dim }}>منتهٍ</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── TAB: Leaderboard ── */}
          {tab==='board' && (
            <>
              <h2 style={{ color:C.text, fontWeight:900, fontSize:16, marginBottom:14 }}>ترتيب المتنافسين</h2>

              {/* Podium Top 3 */}
              <div style={{ ...cardS, marginBottom:14, padding:'20px', background:'linear-gradient(160deg,#0D1535,#1B2038)' }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, textAlign:'center', marginBottom:16 }}>المراكز الثلاثة الأولى</p>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:12 }}>
                  {/* 2nd */}
                  <div style={{ textAlign:'center', flex:1 }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(176,190,197,0.15)', border:`2px solid ${medalColor[2]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 6px' }}>👤</div>
                    <p style={{ color:'#B0BEC5', fontWeight:800, fontSize:11, marginBottom:2, lineHeight:1.3 }}>{top3[1]?.name}</p>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>{top3[1]?.score?.toLocaleString()} نقطة</p>
                    <div style={{ height:40, background:'rgba(176,190,197,0.1)', borderRadius:'8px 8px 0 0', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🥈</div>
                  </div>
                  {/* 1st */}
                  <div style={{ textAlign:'center', flex:1, marginBottom:12 }}>
                    <div style={{ width:62, height:62, borderRadius:'50%', background:'rgba(240,208,96,0.15)', border:`2px solid ${medalColor[1]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 6px', boxShadow:'0 0 20px rgba(240,208,96,0.3)' }}>👤</div>
                    <p style={{ color:'#F0D060', fontWeight:900, fontSize:13, marginBottom:2, lineHeight:1.3 }}>{top3[0]?.name}</p>
                    <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>{top3[0]?.score?.toLocaleString()} نقطة</p>
                    <div style={{ height:56, background:'rgba(240,208,96,0.1)', borderRadius:'8px 8px 0 0', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🥇</div>
                  </div>
                  {/* 3rd */}
                  <div style={{ textAlign:'center', flex:1 }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(205,127,50,0.15)', border:`2px solid ${medalColor[3]}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 6px' }}>👤</div>
                    <p style={{ color:'#CD7F32', fontWeight:800, fontSize:11, marginBottom:2, lineHeight:1.3 }}>{top3[2]?.name}</p>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>{top3[2]?.score?.toLocaleString()} نقطة</p>
                    <div style={{ height:28, background:'rgba(205,127,50,0.1)', borderRadius:'8px 8px 0 0', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🥉</div>
                  </div>
                </div>
              </div>

              {/* Full list */}
              <div style={cardS}>
                <p style={{ color:C.sub, fontSize:12, fontWeight:600, marginBottom:12 }}>الترتيب الكامل</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {rest.map(entry => (
                    <div key={entry.student_id} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:14,
                      background: entry.is_me ? C.goldBg : '#F9FAFB',
                      border: entry.is_me ? `1.5px solid ${C.goldBdr}` : `1px solid ${C.border}`,
                    }}>
                      <div style={{ width:32, height:32, borderRadius:10, background: entry.is_me ? C.goldGrad : 'rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontWeight:900, fontSize:13, color: entry.is_me ? '#1B2038' : C.sub }}>#{entry.rank}</span>
                      </div>
                      <p style={{ flex:1, fontWeight:700, fontSize:13, color: entry.is_me ? C.gold : C.text }}>
                        {entry.name}
                        {entry.is_me && <span style={{ fontSize:10, color:C.sub, marginRight:6 }}>(أنت)</span>}
                      </p>
                      <div style={{ textAlign:'left' }}>
                        <p style={{ fontWeight:900, fontSize:14, color: entry.is_me ? C.gold : C.text }}>{entry.score.toLocaleString()}</p>
                        <p style={{ fontSize:10, color:C.dim }}>نقطة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      {/* ── Detail Modal ── */}
      {activeLeague && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,21,53,0.7)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(6px)' }}
          onClick={()=>dispatch(clearActiveLeague())}>
          <div style={{ width:'100%', maxWidth:500, maxHeight:'85vh', borderRadius:24, background:C.card, border:`1px solid ${C.border}`, boxShadow:'0 8px 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column', overflow:'hidden' }}
            onClick={e=>e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ padding:'20px 22px', borderBottom:`1px solid ${C.border}`, background:'linear-gradient(135deg,#0D1535,#1B2038)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                <div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                    <StatusBadge s={activeLeague.league.status} />
                    <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                      background: activeLeague.league.type==='1v1' ? 'rgba(239,68,68,0.15)' : 'rgba(201,149,42,0.15)',
                      color:      activeLeague.league.type==='1v1' ? C.red : C.goldL }}>
                      {activeLeague.league.type==='1v1' ? '⚔️ 1v1' : '👥 جماعي'}
                    </span>
                  </div>
                  <h2 style={{ color:'#fff', fontWeight:900, fontSize:17 }}>{activeLeague.league.name}</h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:4 }}>
                    {fDate(activeLeague.league.starts_at)} — {fDate(activeLeague.league.ends_at)}
                  </p>
                </div>
                <button onClick={()=>dispatch(clearActiveLeague())}
                  style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14 }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>👥 {activeLeague.league.participants_count} مشارك{activeLeague.league.max_participants ? ` / ${activeLeague.league.max_participants}` : ''}</span>
                {!activeLeague.league.i_joined && activeLeague.league.status !== 'ended' && (
                  <button onClick={()=>handleJoin(activeLeague.league.id, { stopPropagation:()=>{} } as any)}
                    disabled={joiningId===activeLeague.league.id}
                    style={{ marginRight:'auto', padding:'8px 18px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:12, border:'none', cursor:'pointer', ...font, opacity:joiningId===activeLeague.league.id?0.7:1 }}>
                    {joiningId===activeLeague.league.id ? '⏳ جاري...' : '⚡ انضم الآن'}
                  </button>
                )}
                {activeLeague.league.i_joined && (
                  <span style={{ marginRight:'auto', fontSize:12, fontWeight:700, color:'#10B981', padding:'6px 14px', borderRadius:10, background:'rgba(16,185,129,0.1)' }}>✓ مشارك</span>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{ overflowY:'auto', flex:1, padding:'14px 18px' }}>
              {activeLeague.leaderboard.length === 0 ? (
                <div style={{ textAlign:'center', padding:40 }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>🏁</div>
                  <p style={{ color:C.sub, fontSize:14 }}>لا يوجد مشاركون بعد</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {activeLeague.leaderboard.map(entry => (
                    <div key={entry.student_id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:14,
                      background: entry.is_me ? C.goldBg : '#F9FAFB',
                      border: entry.is_me ? `1.5px solid ${C.goldBdr}` : `1px solid ${C.border}` }}>
                      <div style={{ width:32, textAlign:'center', flexShrink:0 }}>
                        {medal[entry.rank] ? <span style={{ fontSize:20 }}>{medal[entry.rank]}</span>
                          : <span style={{ fontWeight:900, fontSize:12, color:C.dim }}>#{entry.rank}</span>}
                      </div>
                      <p style={{ flex:1, fontWeight:700, fontSize:13, color: entry.is_me ? C.gold : C.text }}>
                        {entry.name}
                        {entry.is_me && <span style={{ fontSize:10, color:C.sub, marginRight:6 }}>(أنت)</span>}
                      </p>
                      <div style={{ textAlign:'left' }}>
                        <p style={{ fontWeight:900, fontSize:14, color: entry.is_me ? C.gold : C.text }}>{entry.score}</p>
                        <p style={{ fontSize:10, color:C.dim }}>نقطة</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <StudentBottomNav cur="/student/league" />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
