import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const C = {
  bg:'#F2EDE4', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)', red:'#EF4444', green:'#16A34A',
};
const BH = 60;
const font = { fontFamily:"'Cairo', sans-serif" };

const CONVERSATIONS = [
  { id:1, name:'أ. سامر النابلسي', role:'معلم الرياضيات', avatar:'👨‍🏫', lastMsg:'عمل ممتاز في الامتحان! 🎉', time:'٩:٢٠ ص', unread:2, online:true  },
  { id:2, name:'أ. منى الزهراني',  role:'معلمة العلوم',  avatar:'👩‍🔬', lastMsg:'لا تنسَ تسليم الواجب غداً', time:'أمس',     unread:0, online:false },
  { id:3, name:'المشرف / إبراهيم', role:'مشرف الصف',     avatar:'👨‍💼', lastMsg:'مرحباً، تفضل...',             time:'أمس',     unread:1, online:true  },
  { id:4, name:'أ. خالد المطيري',  role:'معلم اللغة العربية',avatar:'👨‍🏫',lastMsg:'أحسنت!',                  time:'الاثنين', unread:0, online:false },
];

type Msg = { from:'me'|'other'; text:string; time:string };
const INIT_MSGS: Record<number, Msg[]> = {
  1: [
    { from:'other', text:'مرحباً أحمد، كيف حالك اليوم؟', time:'٩:١٠ ص' },
    { from:'me',    text:'بخير أستاذ، شكراً!', time:'٩:١٢ ص' },
    { from:'other', text:'عمل ممتاز في الامتحان! 🎉', time:'٩:٢٠ ص' },
  ],
  2: [
    { from:'other', text:'لا تنسَ تسليم الواجب غداً', time:'أمس' },
  ],
  3: [
    { from:'other', text:'مرحباً، تفضل...', time:'أمس' },
  ],
  4: [
    { from:'other', text:'أحسنت!', time:'الاثنين' },
  ],
};

export default function StudentMessagesPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<number|null>(null);
  const [msgs, setMsgs]   = useState<Record<number,Msg[]>>(INIT_MSGS);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, activeId]);

  const active = CONVERSATIONS.find(c=>c.id===activeId);

  const sendMsg = () => {
    if (!input.trim() || !activeId) return;
    const txt = input.trim();
    const now = new Date().toLocaleTimeString('ar-EG', { hour:'numeric', minute:'2-digit', hour12:true });
    setMsgs(m=>({ ...m, [activeId]:[...(m[activeId]??[]), { from:'me', text:txt, time:now }] }));
    setInput('');
    setTimeout(()=>{
      const replies=['شكراً!','حسناً، سأراجعه.','ممتاز!','تفضل.'];
      setMsgs(m=>({ ...m, [activeId]:[...(m[activeId]??[]), { from:'other', text:replies[Math.floor(Math.random()*replies.length)], time:now }] }));
    }, 1500);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, ...font, direction:'rtl' }}>

      {/* Hero */}
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

      {/* Split Layout */}
      <div style={{ display:'flex', flex:1, maxWidth:900, margin:'0 auto', width:'100%', height:'calc(100vh - 160px)' }}>

        {/* Conversations List */}
        <div style={{ width:280, borderLeft:`1px solid ${C.border}`, background:C.card, overflowY:'auto', flexShrink:0 }}>
          <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}` }}>
            <input placeholder="بحث..." style={{ width:'100%', padding:'8px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, fontSize:12, outline:'none', ...font, boxSizing:'border-box' }}/>
          </div>
          {CONVERSATIONS.map(conv=>(
            <div key={conv.id} onClick={()=>setActiveId(conv.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'14px', cursor:'pointer', borderBottom:`1px solid ${C.border}`,
                background:activeId===conv.id ? C.goldBg : 'transparent',
                borderRight:activeId===conv.id ? `3px solid ${C.gold}` : '3px solid transparent' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(0,0,0,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{conv.avatar}</div>
                {conv.online && <div style={{ position:'absolute', bottom:1, left:1, width:11, height:11, borderRadius:'50%', background:C.green, border:'2px solid #fff' }}/>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <p style={{ color:C.text, fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.name}</p>
                  <span style={{ color:C.dim, fontSize:10, flexShrink:0 }}>{conv.time}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ color:C.sub, fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{conv.lastMsg}</p>
                  {conv.unread>0 && <span style={{ width:18, height:18, borderRadius:'50%', background:C.red, color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginRight:4 }}>{conv.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
          {!activeId ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
              <div style={{ fontSize:56 }}>✉️</div>
              <p style={{ color:C.sub, fontSize:14, fontWeight:600 }}>اختر محادثة من القائمة</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding:'12px 18px', background:C.card, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:28 }}>{active?.avatar}</div>
                <div>
                  <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{active?.name}</p>
                  <p style={{ color:C.sub, fontSize:11 }}>{active?.role} • {active?.online ? <span style={{ color:C.green }}>متاح</span> : 'غير متاح'}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                {(msgs[activeId]??[]).map((m,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:m.from==='me' ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth:'70%' }}>
                      <div style={{ padding:'10px 14px', fontSize:13, lineHeight:1.5, fontWeight:500,
                        background:m.from==='me' ? C.goldGrad : C.card,
                        color:m.from==='me' ? '#1B2038' : C.text,
                        border:m.from==='other' ? `1px solid ${C.border}` : 'none',
                        boxShadow:m.from==='other' ? C.shadow : '0 2px 8px rgba(201,149,42,0.2)',
                        borderRadius:m.from==='me' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      }}>{m.text}</div>
                      <p style={{ color:C.dim, fontSize:10, marginTop:3, textAlign:m.from==='me' ? 'right' : 'left' }}>{m.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={endRef}/>
              </div>

              {/* Input */}
              <div style={{ padding:'12px 16px', background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', gap:10 }}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                  placeholder="اكتب رسالة..."
                  style={{ flex:1, padding:'11px 16px', borderRadius:14, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', ...font }}/>
                <button onClick={sendMsg} style={{ width:44, height:44, borderRadius:12, background:C.goldGrad, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 3px 10px rgba(201,149,42,0.3)', flexShrink:0 }}>➤</button>
              </div>
            </>
          )}
        </div>
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
        <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span style={{ fontSize:9.5, color:C.gold, fontWeight:700 }}>الرسائل</span>
        </button>
        <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 14px', border:'none', background:'none', cursor:'pointer', ...font }}>
          <span style={{ fontSize:20 }}>⋯</span>
          <span style={{ fontSize:9.5, color:C.sub }}>المزيد</span>
        </button>
      </div>
    </div>
  );
}
