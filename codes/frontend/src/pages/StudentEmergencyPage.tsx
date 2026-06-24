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

const TYPES = [
  { emoji:'🤒', label:'مشكلة صحية',      desc:'أحتاج مساعدة طبية طارئة' },
  { emoji:'😰', label:'ضغط نفسي',         desc:'أشعر بضغط وتوتر شديد' },
  { emoji:'📚', label:'صعوبة في الدراسة', desc:'لا أفهم المادة وأحتاج مساعدة فورية' },
  { emoji:'⚠️', label:'مشكلة تقنية',     desc:'مشكلة في الدخول أو الامتحان' },
  { emoji:'👨‍👩‍👧', label:'مشكلة عائلية',   desc:'ظرف عائلي طارئ' },
  { emoji:'🆘', label:'أخرى',             desc:'موقف طارئ آخر يحتاج تدخلاً فورياً' },
];

export default function StudentEmergencyPage() {
  const navigate = useNavigate();
  const [selected, setSelected]   = useState<number|null>(null);
  const [note,     setNote]       = useState('');
  const [sent,     setSent]       = useState(false);
  const [sending,  setSending]    = useState(false);

  const handleSend = () => {
    if (selected === null) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1800);
  };

  const cardS = { background:C.card, borderRadius:18, padding:'18px', boxShadow:C.shadow, border:`1px solid ${C.border}` } as React.CSSProperties;

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, ...font, direction:'rtl' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#7F1D1D 0%,#991B1B 60%,#B91C1C 100%)', padding:'28px 24px 32px', position:'relative', overflow:'hidden' }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(255,255,255,${0.06-i*0.015})`, width:120+i*100, height:120+i*100, top:'50%', left:'-30px', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, maxWidth:800, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>←</button>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>🚨</div>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:22, lineHeight:1 }}>غرفة الطوارئ</h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:4 }}>مساعدة فورية على مدار الساعة — أخبرنا بما تحتاجه</p>
          </div>
        </div>
      </div>

      <div style={{ flex:1, padding:'20px', maxWidth:800, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>

        {sent ? (
          /* Success State */
          <div style={{ ...cardS, textAlign:'center', padding:'48px 24px', marginTop:20 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
            <h2 style={{ color:C.green, fontWeight:900, fontSize:22, marginBottom:8 }}>تم إرسال طلب المساعدة</h2>
            <p style={{ color:C.sub, fontSize:14, marginBottom:24 }}>سيتواصل معك أحد المشرفين خلال دقائق قليلة</p>
            <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', padding:'14px 20px', borderRadius:14, background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)', marginBottom:24 }}>
              <span style={{ fontSize:20 }}>📞</span>
              <p style={{ color:C.green, fontWeight:700, fontSize:14 }}>رقم الطوارئ: 1800-YAQOOT</p>
            </div>
            <button onClick={()=>navigate('/student/dashboard')} style={{ padding:'12px 32px', borderRadius:14, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', ...font }}>
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <>
            {/* Alert Banner */}
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'14px 18px', marginBottom:18, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>⚡</span>
              <p style={{ color:C.red, fontSize:13, fontWeight:700 }}>فريق الطوارئ متاح 24/7 — طلبك سيُعالَج فوراً</p>
            </div>

            {/* Type Selection */}
            <div style={{ ...cardS, marginBottom:14 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:14 }}>نوع الطارئ</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                {TYPES.map((t,i)=>(
                  <button key={i} onClick={()=>setSelected(i)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', borderRadius:14, border:`2px solid ${selected===i ? C.red : C.border}`, background:selected===i ? 'rgba(239,68,68,0.06)' : C.card, cursor:'pointer', textAlign:'right', transition:'all 0.15s', ...font }}>
                    <span style={{ fontSize:26, flexShrink:0 }}>{t.emoji}</span>
                    <div>
                      <p style={{ color:selected===i ? C.red : C.text, fontWeight:700, fontSize:13, lineHeight:1.3 }}>{t.label}</p>
                      <p style={{ color:C.dim, fontSize:11, marginTop:2 }}>{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ ...cardS, marginBottom:14 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:10 }}>تفاصيل إضافية (اختياري)</p>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={4}
                placeholder="أخبرنا بالتفاصيل لنتمكن من مساعدتك بشكل أفضل..."
                style={{ width:'100%', borderRadius:12, border:`1px solid ${C.border}`, padding:'12px 14px', fontSize:13, color:C.text, background:C.bg, resize:'none', outline:'none', boxSizing:'border-box', ...font }}/>
            </div>

            {/* Send Button */}
            <button onClick={handleSend} disabled={selected===null || sending}
              style={{ width:'100%', padding:'16px', borderRadius:16, background:selected===null ? '#EEE' : 'linear-gradient(135deg,#DC2626,#EF4444)', color:'#fff', fontWeight:900, fontSize:16, border:'none', cursor:selected===null ? 'not-allowed' : 'pointer', boxShadow:selected!==null ? '0 6px 20px rgba(239,68,68,0.4)' : 'none', transition:'all 0.2s', ...font, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              {sending ? '⏳ جاري الإرسال...' : '🚨 إرسال طلب المساعدة فوراً'}
            </button>
          </>
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
