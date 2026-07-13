import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';

const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)', red:'#EF4444', green:'#16A34A',
};
const font = { fontFamily:"'Cairo', sans-serif" };

/** No student messages API yet — empty primary data. */
const CONVERSATIONS: { id: number; name: string; role: string; avatar: string; lastMsg: string; time: string; unread: number; online: boolean }[] = [];

export default function StudentMessagesPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<number|null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const active = CONVERSATIONS.find(c=>c.id===activeId);

  return (
    <StudentLayout>
    <div style={{ display:'flex', flexDirection:'column', ...font, direction:'rtl' }}>

      <div style={{ background:'linear-gradient(135deg,#0D1535 0%,#1B2038 60%,#0369A1 100%)', padding:'22px 24px 26px', position:'relative', overflow:'hidden' }}>
        {[...Array(3)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', borderRadius:'50%', border:`1px solid rgba(201,149,42,${0.08-i*0.02})`, width:100+i*80, height:100+i*80, top:'50%', right:'-20px', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        ))}
        <div style={{ position:'relative', zIndex:1, maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>navigate('/student/dashboard')} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>←</button>
          <div style={{ width:46, height:46, borderRadius:12, background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>✉️</div>
          <div>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:20, lineHeight:1 }}>الرسائل</h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, marginTop:3 }}>تواصل مع معلميك ومشرفيك</p>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, maxWidth:900, margin:'0 auto', width:'100%', height:'calc(100vh - 160px)' }}>

        {(!isMobile || !activeId) && (
        <div style={{ width:isMobile ? '100%' : 280, borderLeft:isMobile ? 'none' : `1px solid ${C.border}`, background:C.card, overflowY:'auto', flexShrink:0 }}>
          <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}` }}>
            <input placeholder="بحث..." style={{ width:'100%', padding:'8px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, fontSize:12, outline:'none', ...font, boxSizing:'border-box' }}/>
          </div>
          {CONVERSATIONS.length === 0 ? (
            <div style={{ padding:'40px 16px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>✉️</div>
              <p style={{ color:C.sub, fontSize:13, fontWeight:600 }}>لا توجد محادثات</p>
              <p style={{ color:C.dim, fontSize:11.5, marginTop:6 }}>ستظهر الرسائل هنا عند توفر خدمة المراسلة</p>
            </div>
          ) : CONVERSATIONS.map(conv=>(
            <div key={conv.id} onClick={()=>setActiveId(conv.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'14px', cursor:'pointer', borderBottom:`1px solid ${C.border}`,
                background:activeId===conv.id ? C.goldBg : 'transparent',
                borderRight:activeId===conv.id ? `3px solid ${C.gold}` : '3px solid transparent' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{conv.avatar}</div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{conv.name}</p>
                <p style={{ color:C.sub, fontSize:11 }}>{conv.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
        )}

        {(!isMobile || activeId) && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
          {!activeId ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
              <div style={{ fontSize:56 }}>✉️</div>
              <p style={{ color:C.sub, fontSize:14, fontWeight:600 }}>
                {CONVERSATIONS.length === 0 ? 'لا توجد محادثات متاحة' : 'اختر محادثة من القائمة'}
              </p>
            </div>
          ) : (
            <div style={{ padding:'12px 18px', background:C.card, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
              {isMobile && (
                <button onClick={() => setActiveId(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:C.text, padding:0, flexShrink:0 }}>→</button>
              )}
              <div style={{ fontSize:28 }}>{active?.avatar}</div>
              <div>
                <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{active?.name}</p>
                <p style={{ color:C.sub, fontSize:11 }}>{active?.role}</p>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

    </div>
    </StudentLayout>
  );
}
