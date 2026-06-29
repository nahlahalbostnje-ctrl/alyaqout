import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)', red:'#EF4444', blue:'#2563EB', green:'#16A34A',
};
const BH = 60;
const font = { fontFamily:"'Cairo', sans-serif" };

const SUBJECTS = ['الرياضيات','اللغة العنجليزية','العلوم','اللغة العربية','التربية الإسلامية'];

const OPPONENTS = [
  { name:'أحمد سالم',   grade:'الصف الخامس', pts:5820, wins:24, avatar:'👦', online:true  },
  { name:'سارة محمد',   grade:'الصف الخامس', pts:5210, wins:19, avatar:'👩', online:true  },
  { name:'محمد خالد',   grade:'الصف السادس', pts:4980, wins:17, avatar:'🧒', online:false },
  { name:'نورة العتيبي',grade:'الصف الخامس', pts:4760, wins:14, avatar:'👧', online:true  },
  { name:'عمر الشمري',  grade:'الصف الرابع', pts:4200, wins:11, avatar:'👦', online:false },
];

const MY_MATCHES = [
  { opp:'أحمد سالم', subject:'الرياضيات',        result:'فوز',  myPts:85, oppPts:70, date:'أمس' },
  { opp:'سارة محمد', subject:'اللغة الإنجليزية', result:'خسارة',myPts:60, oppPts:90, date:'منذ يومين' },
  { opp:'محمد خالد', subject:'العلوم',            result:'فوز',  myPts:95, oppPts:80, date:'الأسبوع الماضي' },
];

export default function StudentPeerLeaguePage() {
  const navigate  = useNavigate();
  const [tab, setTab]         = useState<'challenge'|'history'>('challenge');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [selected, setSelected] = useState<number|null>(null);
  const [challenged, setChallenged] = useState(false);

  const handleChallenge = () => {
    if (selected === null) return;
    setChallenged(true);
    setTimeout(()=>setChallenged(false), 3000);
  };

  const cardS = { background:C.card, borderRadius:18, padding:'18px', boxShadow:C.shadow, border:`1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, ...font, direction:'rtl' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1E1B4B 0%,#1B2038 60%,#1E3A8A 100%)', padding:'28px 24px 32px', position:'relative', overflow:'hidden' }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(201,149,42,${0.08-i*0.02})`, width:120+i*100, height:120+i*100, top:'50%', right:'-20px', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>←</button>
          <div style={{ width:52, height:52, borderRadius:14, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0, boxShadow:'0 4px 16px rgba(201,149,42,0.4)' }}>⚔️</div>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>دوري الزملاء</h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, marginTop:4 }}>تحدّى زملاءك في مسابقات 1v1 واكسب نقاط XP</p>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:'flex', gap:12, marginTop:18, maxWidth:800, margin:'18px auto 0', flexWrap:'wrap' }}>
          {[{v:'3', l:'انتصارات'},{v:'1', l:'خسائر'},{v:'300', l:'XP مكتسبة'}].map((s,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div><p style={{ color:'#fff', fontWeight:900, fontSize:18, lineHeight:1 }}>{s.v}</p><p style={{ color:'rgba(255,255,255,0.45)', fontSize:10 }}>{s.l}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:C.card }}>
        {[{k:'challenge',l:'تحدّى زميلاً'},{k:'history',l:'سجل المباريات'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as any)}
            style={{ flex:1, padding:'14px', border:'none', background:'none', cursor:'pointer', fontWeight:700, fontSize:13, ...font,
              color: tab===t.k ? C.gold : C.sub,
              borderBottom: tab===t.k ? `2px solid ${C.gold}` : '2px solid transparent' }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ flex:1, padding:'20px', maxWidth:800, margin:'0 auto', width:'100%', boxSizing:'border-box', paddingBottom:BH+20 }}>

        {challenged && (
          <div style={{ marginBottom:14, padding:'14px 18px', borderRadius:14, background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)', display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:22 }}>🎯</span>
            <p style={{ color:C.green, fontWeight:700, fontSize:14 }}>تم إرسال التحدي! سيُعلَمك الزميل بالقبول</p>
          </div>
        )}

        {tab==='challenge' && (
          <>
            {/* Subject picker */}
            <div style={{ ...cardS, marginBottom:14 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:12 }}>اختر المادة</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {SUBJECTS.map(s=>(
                  <button key={s} onClick={()=>setSubject(s)}
                    style={{ padding:'8px 16px', borderRadius:12, border:`1.5px solid ${subject===s ? C.gold : C.border}`, background:subject===s ? C.goldBg : 'transparent', color:subject===s ? C.gold : C.sub, fontWeight:700, fontSize:12, cursor:'pointer', ...font }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Opponents */}
            <div style={{ ...cardS, marginBottom:14 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:12 }}>اختر خصمك</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {OPPONENTS.map((o,i)=>(
                  <div key={i} onClick={()=>setSelected(i)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, cursor:'pointer', transition:'all 0.15s',
                      border:`2px solid ${selected===i ? C.gold : C.border}`,
                      background:selected===i ? C.goldBg : '#F9FAFB' }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{o.avatar}</div>
                      <div style={{ position:'absolute', bottom:0, left:0, width:12, height:12, borderRadius:'50%', background:o.online ? C.green : C.dim, border:'2px solid #fff' }}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:C.text, fontWeight:700, fontSize:14 }}>{o.name}</p>
                      <p style={{ color:C.dim, fontSize:11 }}>{o.grade}</p>
                    </div>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ color:C.gold, fontWeight:900, fontSize:14 }}>{o.pts.toLocaleString()}</p>
                      <p style={{ color:C.dim, fontSize:10 }}>نقطة</p>
                    </div>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ color:C.green, fontWeight:700, fontSize:13 }}>{o.wins}🏆</p>
                      <p style={{ color:C.dim, fontSize:10 }}>انتصار</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleChallenge} disabled={selected===null}
              style={{ width:'100%', padding:'15px', borderRadius:16, background:selected===null ? '#EEE' : 'linear-gradient(135deg,#1E1B4B,#1E3A8A)', color:'#fff', fontWeight:900, fontSize:15, border:`2px solid ${selected===null ? 'transparent' : C.gold}`, cursor:selected===null ? 'not-allowed' : 'pointer', ...font, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              ⚔️ إرسال التحدي في {subject}
            </button>
          </>
        )}

        {tab==='history' && (
          <div style={cardS}>
            <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:14 }}>سجل مبارياتك</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {MY_MATCHES.map((m,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', borderRadius:14, background:'#F9FAFB', border:`1px solid ${C.border}` }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:m.result==='فوز' ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                    {m.result==='فوز' ? '🏆' : '😔'}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{m.opp} — {m.subject}</p>
                    <p style={{ color:C.dim, fontSize:11 }}>{m.date}</p>
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ color:m.result==='فوز' ? C.green : C.red, fontWeight:900, fontSize:14 }}>{m.result==='فوز' ? '✓ فوز' : '✗ خسارة'}</p>
                    <p style={{ color:C.dim, fontSize:11 }}>{m.myPts} vs {m.oppPts}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div dir="rtl" style={{ position:'fixed', bottom:0, left:0, right:0, height:BH, background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-around', zIndex:100, boxShadow:'0 -4px 20px rgba(0,0,0,0.08)' }}>
        <button onClick={()=>navigate('/student/dashboard')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span style={{ fontSize:9.5, color:C.sub }}>الرئيسية</span>
        </button>
        <button onClick={()=>navigate('/student/league')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <span style={{ fontSize:20 }}>🏆</span>
          <span style={{ fontSize:9.5, color:C.sub }}>الدوري</span>
        </button>
        <div style={{ position:'relative', top:-12 }}>
          <button style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(160deg,#1B2038,#0D1535)', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor:'pointer', boxShadow:`0 6px 20px rgba(13,21,53,0.6)`, outline:'none' }}><BrandLogo size={38} /></button>
        </div>
        <button onClick={()=>navigate('/student/messages')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <span style={{ fontSize:20 }}>✉️</span>
          <span style={{ fontSize:9.5, color:C.sub }}>الرسائل</span>
        </button>
        <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <span style={{ fontSize:20 }}>⋯</span>
          <span style={{ fontSize:9.5, color:C.sub }}>المزيد</span>
        </button>
      </div>
    </div>
  );
}
