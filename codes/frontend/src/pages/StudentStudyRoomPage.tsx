import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { useAppSelector } from '../app/hooks';
import StudentBottomNav, { C, BH } from '../components/StudentBottomNav';

interface Message {
  id:        string;
  userId:    number;
  userName:  string;
  text:      string;
  role:      string;
  timestamp: number;
}

const QUICK_ACTIONS = [
  { label:'شرح درس',       desc:'أشرح أي درس لك',           emoji:'✏️' },
  { label:'حل سؤال',      desc:'ساعدني في حل سؤال',         emoji:'❓' },
  { label:'تلخيص',         desc:'لخص لي هذا الموضوع',        emoji:'📋' },
  { label:'تحضير امتحان', desc:'أسئلة تدريبية',             emoji:'📝' },
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' });
}

export default function StudentStudyRoomPage() {
  const navigate  = useNavigate();
  const user      = useAppSelector(s => s.auth.user);
  const roomId    = `room_${user?.id}`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const msgsRef = ref(db, `studyRoom/${roomId}/messages`);
    const unsubscribe = onValue(msgsRef, snap => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      const list: Message[] = Object.entries(data).map(([id, v]) => ({ id, ...(v as Omit<Message,'id'>) }));
      list.sort((a,b) => a.timestamp - b.timestamp);
      setMessages(list);
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async (customText?: string) => {
    const trimmed = (customText ?? text).trim();
    if (!trimmed || sending || !user) return;
    setSending(true);
    await push(ref(db, `studyRoom/${roomId}/messages`), {
      userId: user.id, userName: user.name, role: user.role, text: trimmed, timestamp: Date.now(),
    });
    setText(''); setSending(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'محمد';

  return (
    <div dir="rtl" style={{ background:C.bg, height:'100vh', display:'flex', flexDirection:'column', fontFamily:"'Cairo',sans-serif" }}>

      {/* Status */}
      <div style={{ background:C.card, padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:C.navy2, flexShrink:0 }}>
        <span>9:41</span><span>▶▶ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.04)', flexShrink:0 }}>
        <button onClick={()=>navigate(-1)} style={{ width:36, height:36, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>‹</button>
        <h1 style={{ color:C.navy2, fontWeight:800, fontSize:18, flex:1, textAlign:'center' }}>معلمي الذكي</h1>
        <div style={{ width:36 }} />
      </div>

      {/* Chat area */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', paddingBottom:BH+80 }}>
        {messages.length === 0 && (
          <>
            {/* Robot welcome */}
            <div style={{ textAlign:'center', padding:'20px 0 24px' }}>
              <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#0D1535,#1B2038)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:46, boxShadow:'0 8px 24px rgba(13,21,53,0.4)', border:`3px solid ${C.gold}` }}>🤖</div>
              <p style={{ color:C.navy2, fontWeight:800, fontSize:18, marginBottom:6 }}>مرحباً {firstName} 👋</p>
              <p style={{ color:C.sub, fontSize:13.5 }}>كيف بإمكاني مساعدتك اليوم؟</p>
            </div>

            {/* Quick Actions */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
              {QUICK_ACTIONS.map((a,i) => (
                <button key={i} onClick={()=>send(a.label)}
                  style={{ background:C.card, borderRadius:16, padding:'14px 12px', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:6, border:`1px solid ${C.border}`, boxShadow:C.shadow, cursor:'pointer', textAlign:'right', fontFamily:"'Cairo',sans-serif" }}>
                  <span style={{ fontSize:24 }}>{a.emoji}</span>
                  <p style={{ color:C.navy2, fontWeight:700, fontSize:13.5 }}>{a.label}</p>
                  <p style={{ color:C.sub, fontSize:11 }}>{a.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map(msg => {
          const isMe = msg.userId === user?.id;
          return (
            <div key={msg.id} style={{ display:'flex', justifyContent:isMe?'flex-start':'flex-end', marginBottom:10 }}>
              <div style={{ maxWidth:'78%', padding:'10px 14px', borderRadius:isMe?'16px 16px 4px 16px':'16px 16px 16px 4px', background:isMe?C.navy2:C.card, color:isMe?'#fff':C.text, boxShadow:C.shadow, border:isMe?'none':`1px solid ${C.border}` }}>
                {!isMe && <p style={{ color:C.gold, fontSize:10.5, fontWeight:700, marginBottom:4 }}>{msg.userName}</p>}
                <p style={{ fontSize:13.5, lineHeight:1.5 }}>{msg.text}</p>
                <p style={{ fontSize:10, color:isMe?'rgba(255,255,255,0.4)':C.dim, marginTop:4 }}>{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ position:'fixed', bottom:BH, left:0, right:0, background:C.card, borderTop:`1px solid ${C.border}`, padding:'10px 14px', display:'flex', gap:8, alignItems:'flex-end', zIndex:90 }}>
        <button style={{ width:38, height:38, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, fontSize:17 }}>🎙️</button>
        <textarea
          value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKey}
          rows={1} placeholder="اكتب سؤالك هنا..."
          style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:14, padding:'10px 14px', fontSize:13.5, color:C.text, background:C.bg, outline:'none', resize:'none', fontFamily:"'Cairo',sans-serif", maxHeight:120, lineHeight:1.5 }}
        />
        <button onClick={()=>send()} disabled={sending||!text.trim()}
          style={{ width:40, height:40, borderRadius:'50%', background:text.trim()?C.goldGrad:C.bg, border:`1px solid ${text.trim()?'transparent':C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:text.trim()?'pointer':'default', flexShrink:0, transition:'all 0.2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={text.trim()?'#1B2038':'#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>

      <StudentBottomNav cur="/student/study-room" />
    </div>
  );
}
