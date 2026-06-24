import { useState } from 'react';
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

const TEACHERS = [
  { id:1, name:'أ. سامر النابلسي',  subject:'الرياضيات',          avatar:'👨‍🏫', phone:'0599000001', email:'samer@yaqoot.ps', times:'ن/ث/خ  ٩ص–١١ص', rating:4.9, sessions:312, online:true  },
  { id:2, name:'أ. منى الزهراني',   subject:'العلوم',              avatar:'👩‍🔬', phone:'0599000002', email:'mona@yaqoot.ps',  times:'الأحد/الثلاثاء ١٠ص–١٢م', rating:4.8, sessions:198, online:false },
  { id:3, name:'أ. خالد المطيري',   subject:'اللغة العربية',       avatar:'👨‍🏫', phone:'0599000003', email:'khaled@yaqoot.ps',times:'الاثنين/الأربعاء ٨ص–١٠ص', rating:4.7, sessions:145, online:true  },
  { id:4, name:'أ. فاطمة القرشي',   subject:'اللغة الإنجليزية',   avatar:'👩‍🏫', phone:'0599000004', email:'fatma@yaqoot.ps', times:'ن/ث/خ  ١١ص–١ظ',  rating:4.9, sessions:276, online:false },
  { id:5, name:'أ. عمر الشمري',     subject:'التربية الإسلامية',  avatar:'👨‍🏫', phone:'0599000005', email:'omar@yaqoot.ps',  times:'الأحد/الخميس ٩ص–١١ص',    rating:4.6, sessions:112, online:true  },
];

const TOPICS = ['سؤال عن الدرس','استفسار عن الواجب','طلب شرح إضافي','مشكلة في الفهم','تغيب عن حصة','أخرى'];

export default function StudentTeacherContactPage() {
  const navigate  = useNavigate();
  const [selected, setSelected] = useState<number|null>(null);
  const [topic,    setTopic]    = useState(TOPICS[0]);
  const [msg,      setMsg]      = useState('');
  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);
  const [tab,      setTab]      = useState<'contact'|'list'>('list');

  const teacher = selected !== null ? TEACHERS.find(t=>t.id===selected) : null;

  const handleSend = () => {
    if (!selected || !msg.trim()) return;
    setSending(true);
    setTimeout(()=>{ setSending(false); setSent(true); }, 1600);
  };

  const cardS = { background:C.card, borderRadius:18, padding:'18px', boxShadow:C.shadow, border:`1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, ...font, direction:'rtl' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0D1535 0%,#162144 60%,#1B2038 100%)', padding:'28px 24px 32px', position:'relative', overflow:'hidden' }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(201,149,42,${0.08-i*0.02})`, width:120+i*100, height:120+i*100, top:'50%', right:'-20px', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, maxWidth:820, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>←</button>
          <div style={{ width:52, height:52, borderRadius:14, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0, boxShadow:'0 4px 16px rgba(201,149,42,0.4)' }}>👨‍🏫</div>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>تواصل مع المعلم</h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, marginTop:4 }}>تواصل مباشر مع معلميك واحصل على دعمهم</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:C.card }}>
        {[{k:'list',l:'قائمة المعلمين'},{k:'contact',l:'إرسال رسالة'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k as any)}
            style={{ flex:1, padding:'14px', border:'none', background:'none', cursor:'pointer', fontWeight:700, fontSize:13, ...font,
              color:tab===t.k ? C.gold : C.sub,
              borderBottom:tab===t.k ? `2px solid ${C.gold}` : '2px solid transparent' }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ flex:1, padding:'20px', maxWidth:820, margin:'0 auto', width:'100%', boxSizing:'border-box', paddingBottom:BH+20 }}>

        {tab==='list' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {TEACHERS.map(t=>(
              <div key={t.id} style={{ ...cardS, display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:58, height:58, borderRadius:'50%', background:C.goldBg, border:`2px solid ${C.goldBdr}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>{t.avatar}</div>
                  {t.online && <div style={{ position:'absolute', bottom:2, left:2, width:13, height:13, borderRadius:'50%', background:C.green, border:'2px solid #fff' }}/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <div>
                      <p style={{ color:C.text, fontWeight:900, fontSize:15 }}>{t.name}</p>
                      <p style={{ color:C.gold, fontSize:12, fontWeight:700 }}>{t.subject}</p>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:t.online ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.05)', color:t.online ? C.green : C.dim }}>{t.online ? '🟢 متاح' : '⚫ غير متاح'}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:10 }}>
                    <span style={{ color:C.sub, fontSize:12 }}>⭐ {t.rating}</span>
                    <span style={{ color:C.sub, fontSize:12 }}>📅 {t.times}</span>
                    <span style={{ color:C.sub, fontSize:12 }}>💬 {t.sessions} جلسة</span>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>{ setSelected(t.id); setTab('contact'); }}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:12, border:'none', cursor:'pointer', ...font, boxShadow:'0 3px 10px rgba(201,149,42,0.3)' }}>
                      ✉️ إرسال رسالة
                    </button>
                    <button onClick={()=>navigate('/student/messages')}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:12, background:C.bg, color:C.sub, fontWeight:700, fontSize:12, border:`1px solid ${C.border}`, cursor:'pointer', ...font }}>
                      💬 دردشة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='contact' && (
          sent ? (
            <div style={{ ...cardS, textAlign:'center', padding:'48px 24px', marginTop:20 }}>
              <div style={{ fontSize:64, marginBottom:16 }}>📨</div>
              <h2 style={{ color:C.green, fontWeight:900, fontSize:22, marginBottom:8 }}>تم إرسال رسالتك</h2>
              <p style={{ color:C.sub, fontSize:14, marginBottom:24 }}>سيرد عليك {teacher?.name} في أقرب فرصة</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button onClick={()=>{ setSent(false); setMsg(''); setSelected(null); }}
                  style={{ padding:'12px 24px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', ...font }}>
                  إرسال رسالة أخرى
                </button>
                <button onClick={()=>navigate('/student/dashboard')}
                  style={{ padding:'12px 24px', borderRadius:14, background:C.bg, color:C.sub, fontWeight:700, fontSize:14, border:`1px solid ${C.border}`, cursor:'pointer', ...font }}>
                  الرئيسية
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Teacher selector */}
              <div style={{ ...cardS, marginBottom:14 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:12 }}>اختر المعلم</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                  {TEACHERS.map(t=>(
                    <button key={t.id} onClick={()=>setSelected(t.id)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px', borderRadius:14, border:`2px solid ${selected===t.id ? C.gold : C.border}`, background:selected===t.id ? C.goldBg : 'transparent', cursor:'pointer', textAlign:'right', ...font }}>
                      <span style={{ fontSize:22 }}>{t.avatar}</span>
                      <div>
                        <p style={{ color:selected===t.id ? C.gold : C.text, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{t.name}</p>
                        <p style={{ color:C.dim, fontSize:11 }}>{t.subject}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div style={{ ...cardS, marginBottom:14 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:12 }}>موضوع الرسالة</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {TOPICS.map(tp=>(
                    <button key={tp} onClick={()=>setTopic(tp)}
                      style={{ padding:'8px 14px', borderRadius:12, border:`1.5px solid ${topic===tp ? C.gold : C.border}`, background:topic===tp ? C.goldBg : 'transparent', color:topic===tp ? C.gold : C.sub, fontWeight:600, fontSize:12, cursor:'pointer', ...font }}>
                      {tp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ ...cardS, marginBottom:14 }}>
                <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:10 }}>نص الرسالة</p>
                <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={5}
                  placeholder="اكتب رسالتك للمعلم هنا..."
                  style={{ width:'100%', borderRadius:12, border:`1px solid ${C.border}`, padding:'12px 14px', fontSize:13, color:C.text, background:C.bg, resize:'none', outline:'none', boxSizing:'border-box', ...font }}/>
              </div>

              <button onClick={handleSend} disabled={!selected || !msg.trim() || sending}
                style={{ width:'100%', padding:'15px', borderRadius:16, background:(!selected||!msg.trim()) ? '#EEE' : C.goldGrad, color:(!selected||!msg.trim()) ? C.dim : '#1B2038', fontWeight:900, fontSize:15, border:'none', cursor:(!selected||!msg.trim()) ? 'not-allowed' : 'pointer', ...font, boxShadow:selected&&msg.trim() ? '0 5px 18px rgba(201,149,42,0.4)' : 'none', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                {sending ? '⏳ جاري الإرسال...' : '📨 إرسال الرسالة'}
              </button>
            </>
          )
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
