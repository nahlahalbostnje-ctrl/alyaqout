import { useState, useRef, useEffect } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981',
  red:'#EF4444',
};

interface Message { id:number; from:'me'|'other'; text:string; time:string; }
interface Contact { id:number; name:string; role:'parent'|'student'|'teacher'; unread:number; last:string; messages:Message[]; }

const now = () => new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});

const CONTACTS: Contact[] = [
  { id:1, name:'أم أحمد',    role:'parent',  unread:2, last:'هل يمكن تحديد موعد لمناقشة مستوى أحمد?', messages:[
    { id:1, from:'other', text:'السلام عليكم، أريد الاستفسار عن مستوى أحمد في الرياضيات.', time:'09:30 ص' },
    { id:2, from:'me',    text:'وعليكم السلام، أهلاً أم أحمد. سأطلع على آخر تقييماته وأعود لك.', time:'09:35 ص' },
    { id:3, from:'other', text:'هل يمكن تحديد موعد لمناقشة مستوى أحمد?', time:'09:40 ص' },
  ]},
  { id:2, name:'سارة علي',   role:'student', unread:0, last:'شكراً على المتابعة 😊', messages:[
    { id:1, from:'other', text:'أستاذتي، هل يمكنني الاطلاع على ملاحظاتكم على الواجب الأخير?', time:'أمس' },
    { id:2, from:'me',    text:'بالطبع سارة، أرسلت لك التغذية الراجعة على منصة الياقوت.', time:'أمس' },
    { id:3, from:'other', text:'شكراً على المتابعة 😊', time:'أمس' },
  ]},
  { id:3, name:'أ. محمد المدرب', role:'teacher', unread:1, last:'سأراجع الواجب وأرسل لك الدرجات', messages:[
    { id:1, from:'other', text:'مرحباً ليلى، خالد لم يسلّم واجب هذا الأسبوع.', time:'08:00 ص' },
    { id:2, from:'me',    text:'شكراً للإبلاغ، سأتواصل مع ولي أمره فوراً.', time:'08:10 ص' },
    { id:3, from:'other', text:'سأراجع الواجب وأرسل لك الدرجات', time:'08:30 ص' },
  ]},
  { id:4, name:'والد نورة',  role:'parent',  unread:0, last:'جزاكم الله خيراً', messages:[
    { id:1, from:'other', text:'السلام عليكم، نورة تتحسن كثيراً هذا الأسبوع.', time:'أمس' },
    { id:2, from:'me',    text:'الحمد لله، هي طالبة مجتهدة. واصلوا تشجيعها.', time:'أمس' },
    { id:3, from:'other', text:'جزاكم الله خيراً', time:'أمس' },
  ]},
  { id:5, name:'فيصل ناصر', role:'student', unread:3, last:'متى موعد الاختبار القادم?', messages:[
    { id:1, from:'other', text:'أستاذتي، أشعر بقلق كبير قبل الاختبار.', time:'10:00 ص' },
    { id:2, from:'me',    text:'فيصل، أنت تذاكر بجد. ثق بنفسك.', time:'10:15 ص' },
    { id:3, from:'other', text:'متى موعد الاختبار القادم?', time:'10:20 ص' },
  ]},
];

const ROLE_MAP = { parent:{ label:'ولي أمر', color:C.gold }, student:{ label:'طالب', color:C.navy }, teacher:{ label:'مدرب', color:'#8B5CF6' } };

export default function SupervisorChatPage() {
  const [contacts, setContacts] = useState(CONTACTS);
  const [active, setActive] = useState(CONTACTS[0]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all'|'unread'|'parent'>('all');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [active.messages]);

  const filtered = contacts.filter(c =>
    filter==='all' ? true : filter==='unread' ? c.unread>0 : c.role==='parent'
  );

  const send = () => {
    if (!input.trim()) return;
    const msg: Message = { id: Date.now(), from:'me', text:input.trim(), time:now() };
    setContacts(prev => prev.map(c => c.id===active.id ? {...c, messages:[...c.messages,msg], last:input.trim()} : c));
    setActive(prev => ({...prev, messages:[...prev.messages,msg], last:input.trim()}));
    setInput('');
  };

  const selectContact = (c: Contact) => {
    setActive(c);
    setContacts(prev => prev.map(x => x.id===c.id ? {...x,unread:0} : x));
  };

  const totalUnread = contacts.reduce((s,c)=>s+c.unread,0);

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ display:'flex', height:'calc(100vh - 54px)', fontFamily:"'Cairo',sans-serif" }}>

        {/* Contact list */}
        <div style={{ width:300, flexShrink:0, background:C.card, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column' }}>
          {/* Header */}
          <div style={{ padding:'16px 16px 10px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:15 }}>مركز الرسائل 💬</p>
              {totalUnread>0 && <span style={{ padding:'2px 8px', borderRadius:20, background:C.red, color:'#fff', fontSize:11, fontWeight:700 }}>{totalUnread}</span>}
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {(['all','unread','parent'] as const).map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{
                  padding:'4px 10px', borderRadius:8, border:'none', fontFamily:"'Cairo',sans-serif",
                  fontSize:11.5, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                  background:filter===f?C.goldGrad:'#F3F4F6', color:filter===f?'#fff':C.sub,
                }}>{f==='all'?'الكل':f==='unread'?'غير مقروء':'أولياء الأمور'}</button>
              ))}
            </div>
          </div>
          {/* Contacts */}
          <div style={{ flex:1, overflowY:'auto', padding:8, display:'flex', flexDirection:'column', gap:4 }}>
            {filtered.map(c => {
              const rm = ROLE_MAP[c.role];
              return (
                <button key={c.id} onClick={()=>selectContact(c)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12,
                  border:'none', background:active.id===c.id?C.goldBg:'transparent',
                  cursor:'pointer', textAlign:'right', fontFamily:"'Cairo',sans-serif",
                  borderRight:active.id===c.id?`3px solid ${C.gold}`:'3px solid transparent',
                  transition:'all 0.15s',
                }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:`linear-gradient(135deg,${rm.color},${rm.color}99)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:15 }}>
                      {c.name.charAt(0)}
                    </div>
                    {c.unread>0 && <div style={{ position:'absolute', top:-2, left:-2, width:16, height:16, borderRadius:'50%', background:C.red, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9, fontWeight:900, border:'2px solid #fff' }}>{c.unread}</div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                      <p style={{ color:C.text, fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                      <span style={{ padding:'1px 7px', borderRadius:10, fontSize:10, fontWeight:600, background:`${rm.color}18`, color:rm.color, flexShrink:0 }}>{rm.label}</span>
                    </div>
                    <p style={{ color:C.dim, fontSize:11.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.last}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Chat header */}
          <div style={{ padding:'12px 20px', background:C.card, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:16 }}>
              {active.name.charAt(0)}
            </div>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{active.name}</p>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }} />
                <p style={{ color:C.green, fontSize:11.5, fontWeight:600 }}>متصل</p>
                <span style={{ color:C.dim, fontSize:11 }}>· {ROLE_MAP[active.role].label}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:14, background:'#FDFAF4' }}>
            {active.messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:8, flexDirection:msg.from==='me'?'row-reverse':'row', alignItems:'flex-end' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:msg.from==='me'?C.goldGrad:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:12 }}>
                  {msg.from==='me' ? 'م' : active.name.charAt(0)}
                </div>
                <div style={{ maxWidth:'65%' }}>
                  <div style={{ padding:'10px 14px', borderRadius:msg.from==='me'?'16px 4px 16px 16px':'4px 16px 16px 16px', background:msg.from==='me'?C.goldGrad:C.card, color:msg.from==='me'?'#fff':C.text, fontSize:13, lineHeight:1.7, boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:msg.from==='other'?`1px solid ${C.border}`:'none' }}>
                    {msg.text}
                  </div>
                  <p style={{ color:C.dim, fontSize:10, marginTop:3, textAlign:msg.from==='me'?'left':'right' }}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:'12px 20px', background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', gap:10, alignItems:'center' }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') send(); }}
              placeholder={`رسالة إلى ${active.name}...`}
              style={{ flex:1, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }}
              onFocus={e=>{ e.currentTarget.style.borderColor=C.gold; }}
              onBlur={e=>{ e.currentTarget.style.borderColor=C.border; }}
            />
            <button onClick={send} disabled={!input.trim()} style={{ width:42, height:42, borderRadius:11, border:'none', background:input.trim()?C.goldGrad:'#E5E7EB', color:input.trim()?'#fff':C.dim, cursor:input.trim()?'pointer':'not-allowed', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>↑</button>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
}
