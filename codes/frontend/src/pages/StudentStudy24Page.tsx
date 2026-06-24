import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)', red:'#EF4444', green:'#16A34A',
};
const BH = 60;
const font = { fontFamily:"'Cairo', sans-serif" };

const TUTORS = [
  { name:'أ. فاطمة القرشي', subject:'الرياضيات',         avatar:'👩‍🏫', status:'متاح',  rating:4.9, sessions:312 },
  { name:'أ. سامر النابلسي', subject:'اللغة الإنجليزية', avatar:'👨‍🏫', status:'مشغول', rating:4.8, sessions:198 },
  { name:'أ. منى الزهراني',  subject:'العلوم',            avatar:'👩‍🔬', status:'متاح',  rating:4.9, sessions:276 },
  { name:'أ. خالد المطيري',  subject:'اللغة العربية',     avatar:'👨‍🏫', status:'متاح',  rating:4.7, sessions:145 },
];

type Msg = { from:'me'|'tutor'; text:string };
const INIT: Msg[] = [
  { from:'tutor', text:'أهلاً وسهلاً! غرفة الدراسة 24/7 متاحة دائماً. كيف يمكنني مساعدتك؟ 😊' },
];

export default function StudentStudy24Page() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState<'live'|'chat'>('live');
  const [msgs, setMsgs]     = useState<Msg[]>(INIT);
  const [input, setInput]   = useState('');
  const [selected, setSelected] = useState<number|null>(null);
  const [requested, setRequested] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const sendMsg = () => {
    if (!input.trim()) return;
    const txt = input.trim();
    setMsgs(m=>[...m, { from:'me', text:txt }]);
    setInput('');
    setTimeout(()=>{
      const replies = ['سؤال ممتاز!', 'دعني أشرح لك بالتفصيل...', 'بالطبع، هذا المفهوم مهم جداً!', 'جيد جداً، استمر!'];
      setMsgs(m=>[...m, { from:'tutor', text:replies[Math.floor(Math.random()*replies.length)] }]);
    }, 1200);
  };

  const cardS = { background:C.card, borderRadius:18, padding:'18px', boxShadow:C.shadow, border:`1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, ...font, direction:'rtl' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#111827 0%,#1F2937 60%,#0D1535 100%)', padding:'28px 24px 32px', position:'relative', overflow:'hidden' }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(201,149,42,${0.08-i*0.02})`, width:120+i*100, height:120+i*100, top:'50%', right:'-20px', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>←</button>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,0.08)', border:`1px solid ${C.goldBdr}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>🎧</div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 0 2px rgba(34,197,94,0.3)' }}/>
              <span style={{ color:'#22C55E', fontSize:11, fontWeight:700 }}>مباشر 24/7</span>
            </div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>غرفة الدراسة 24/7</h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, marginTop:4 }}>دعم مباشر من معلمين متخصصين في أي وقت</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:C.card }}>
        {[{k:'live',l:'المعلمون المتاحون'},{k:'chat',l:'الدردشة المباشرة'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as any)}
            style={{ flex:1, padding:'14px', border:'none', background:'none', cursor:'pointer', fontWeight:700, fontSize:13, ...font,
              color:tab===t.k ? C.gold : C.sub,
              borderBottom:tab===t.k ? `2px solid ${C.gold}` : '2px solid transparent' }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ flex:1, padding:'20px', maxWidth:800, margin:'0 auto', width:'100%', boxSizing:'border-box', paddingBottom:BH+20 }}>

        {tab==='live' && (
          <>
            {requested && (
              <div style={{ marginBottom:14, padding:'14px 18px', borderRadius:14, background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)', display:'flex', gap:10 }}>
                <span style={{ fontSize:20 }}>✅</span>
                <p style={{ color:C.green, fontWeight:700, fontSize:13 }}>تم إرسال الطلب — سيتواصل معك المعلم خلال دقائق</p>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {TUTORS.map((t,i)=>(
                <div key={i} style={{ ...cardS, display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:54, height:54, borderRadius:'50%', background:t.status==='متاح' ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0, position:'relative' }}>
                    {t.avatar}
                    <div style={{ position:'absolute', bottom:2, left:2, width:12, height:12, borderRadius:'50%', background:t.status==='متاح' ? C.green : C.dim, border:'2px solid #fff' }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{t.name}</p>
                    <p style={{ color:C.sub, fontSize:12 }}>{t.subject}</p>
                    <div style={{ display:'flex', gap:10, marginTop:4 }}>
                      <span style={{ fontSize:11, color:C.gold }}>⭐ {t.rating}</span>
                      <span style={{ fontSize:11, color:C.dim }}>{t.sessions} جلسة</span>
                    </div>
                  </div>
                  <button
                    disabled={t.status==='مشغول'}
                    onClick={()=>{ setSelected(i); setRequested(true); setTimeout(()=>setRequested(false),4000); }}
                    style={{ padding:'10px 18px', borderRadius:12, background:t.status==='متاح' ? C.goldGrad : '#EEE', color:t.status==='متاح' ? '#1B2038' : C.dim, fontWeight:800, fontSize:12, border:'none', cursor:t.status==='متاح' ? 'pointer' : 'not-allowed', ...font, whiteSpace:'nowrap', boxShadow:t.status==='متاح' ? '0 3px 10px rgba(201,149,42,0.35)' : 'none' }}>
                    {t.status==='متاح' ? '📞 طلب جلسة' : '⏸ مشغول'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==='chat' && (
          <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 280px)' }}>
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:10 }}>
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:m.from==='me' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:16, fontSize:13, fontWeight:500, lineHeight:1.5,
                    background:m.from==='me' ? C.goldGrad : C.card,
                    color:m.from==='me' ? '#1B2038' : C.text,
                    border:m.from==='tutor' ? `1px solid ${C.border}` : 'none',
                    boxShadow:m.from==='tutor' ? C.shadow : '0 2px 8px rgba(201,149,42,0.25)',
                    borderRadius:m.from==='me' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef}/>
            </div>
            <div style={{ display:'flex', gap:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                placeholder="اكتب سؤالك هنا..."
                style={{ flex:1, padding:'12px 16px', borderRadius:14, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', ...font }}/>
              <button onClick={sendMsg} style={{ width:46, height:46, borderRadius:14, background:C.goldGrad, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 3px 10px rgba(201,149,42,0.35)', flexShrink:0 }}>
                ➤
              </button>
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
          <button style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(160deg,#1B2038,#0D1535)', border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor:'pointer', boxShadow:`0 6px 20px rgba(13,21,53,0.6)`, outline:'none' }}>💎</button>
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
