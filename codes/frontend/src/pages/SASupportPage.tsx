import { useState, useRef, useEffect } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface Ticket {
  id:string; user:string; role:string; subject:string; status:'مفتوحة'|'قيد المعالجة'|'مغلقة'; priority:'عالية'|'متوسطة'|'منخفضة'; date:string; avatar:string;
}

interface Msg { id:number; from:'user'|'admin'; text:string; time:string; }

const TICKETS:Ticket[] = [
  {id:'T-001',user:'عمر يوسف',  role:'مدير',   subject:'مشكلة في الوصول للوحة التحكم',      status:'مفتوحة',      priority:'عالية',   date:'منذ 10 د', avatar:'👨‍💼'},
  {id:'T-002',user:'سارة خالد', role:'مدربة',  subject:'تعذر رفع ملف فيديو بحجم 800 MB',   status:'قيد المعالجة',priority:'متوسطة',  date:'منذ ساعة',  avatar:'👩‍🏫'},
  {id:'T-003',user:'محمد علي',  role:'طالب',   subject:'الحصة المباشرة لا تعمل على الجوال', status:'مفتوحة',      priority:'عالية',   date:'منذ 2 س',  avatar:'👦'},
  {id:'T-004',user:'نورة فهد',  role:'ولي أمر',subject:'استفسار عن تجديد الاشتراك',        status:'مغلقة',       priority:'منخفضة',  date:'منذ يوم',  avatar:'👩'},
  {id:'T-005',user:'فهد عمر',   role:'مشرف',   subject:'خطأ في تقارير الحضور',              status:'قيد المعالجة',priority:'متوسطة',  date:'منذ يوم',  avatar:'👨'},
];

const PRIORITY_COLOR = {'عالية':C.red,'متوسطة':C.orange,'منخفضة':C.green};
const STATUS_COLOR = {'مفتوحة':C.orange,'قيد المعالجة':C.blue,'مغلقة':C.green};

const INIT_MSGS:Msg[] = [
  {id:1,from:'user', text:'مرحباً، أواجه مشكلة في الوصول للوحة التحكم منذ الصباح. تظهر لي رسالة "صلاحية غير كافية".', time:'10:30 ص'},
  {id:2,from:'admin',text:'أهلاً عمر، شكراً لتواصلك. سأتحقق من صلاحياتك الآن.', time:'10:32 ص'},
  {id:3,from:'user', text:'شكراً، أحتاج الوصول بشكل عاجل لتقارير هذا الشهر.', time:'10:33 ص'},
  {id:4,from:'admin',text:'تم تحديث صلاحياتك. هل يمكنك المحاولة مرة أخرى الآن؟', time:'10:35 ص'},
];

export default function SASupportPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [activeTicket, setActiveTicket] = useState<string>('T-001');
  const [msgs, setMsgs] = useState<Msg[]>(INIT_MSGS);
  const [inputText, setInputText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'الكل'|Ticket['status']>('الكل');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs]);

  const sendMsg = () => {
    if(!inputText.trim()) return;
    const now = new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
    setMsgs(prev=>[...prev,{id:prev.length+1,from:'admin',text:inputText.trim(),time:now}]);
    setInputText('');
  };

  const filteredTickets = TICKETS.filter(t=>statusFilter==='الكل'||t.status===statusFilter);
  const current = TICKETS.find(t=>t.id===activeTicket);

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الدعم الفني</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>{TICKETS.filter(t=>t.status!=='مغلقة').length} تذكرة مفتوحة بانتظار الرد</p>
        </div>
        <button disabled title="غير متاح بعد — لا يوجد نظام تذاكر بعد" style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'not-allowed',opacity:0.55}}>+ فتح تذكرة جديدة</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',gap:14,height: isMobile ? 'auto' : 'calc(100vh - 200px)',minHeight:500}}>

        {/* Tickets List */}
        <div style={{display:'flex',flexDirection:'column',gap:0}}>
          {/* Filter */}
          <div style={card({marginBottom:10,padding:'10px 12px'})}>
            <div style={{display:'flex',gap:4}}>
              {(['الكل','مفتوحة','قيد المعالجة','مغلقة'] as const).map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)} style={{flex:1,padding:'6px 4px',borderRadius:9,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,background:statusFilter===s?C.navy:'transparent',color:statusFilter===s?'#fff':C.sub,transition:'all 0.15s'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
            {filteredTickets.map(ticket=>(
              <div key={ticket.id} onClick={()=>setActiveTicket(ticket.id)} style={card({cursor:'pointer',padding:'12px 14px',border:activeTicket===ticket.id?`2px solid ${C.gold}`:`1px solid ${C.border}`,background:activeTicket===ticket.id?`${C.gold}06`:C.card})}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:`${C.blue}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ticket.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:C.text,fontWeight:700,fontSize:12.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ticket.user}</p>
                    <p style={{color:C.sub,fontSize:10.5}}>{ticket.role} · {ticket.date}</p>
                  </div>
                  <span style={{padding:'3px 8px',borderRadius:20,fontSize:10,fontWeight:700,background:`${PRIORITY_COLOR[ticket.priority]}15`,color:PRIORITY_COLOR[ticket.priority],flexShrink:0}}>{ticket.priority}</span>
                </div>
                <p style={{color:C.text,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:8}}>{ticket.subject}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{color:C.dim,fontSize:10.5}}>{ticket.id}</span>
                  <span style={{padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:`${STATUS_COLOR[ticket.status]}15`,color:STATUS_COLOR[ticket.status]}}>{ticket.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={card({display:'flex',flexDirection:'column',padding:0,overflow:'hidden'})}>
          {/* Chat Header */}
          {current&&(
            <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,borderRadius:'50%',background:`${C.blue}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{current.avatar}</div>
              <div style={{flex:1}}>
                <p style={{color:C.text,fontWeight:800,fontSize:14}}>{current.user}</p>
                <p style={{color:C.sub,fontSize:12}}>{current.subject}</p>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button disabled title="غير متاح بعد" style={{padding:'7px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:'transparent',color:C.dim,fontSize:12,cursor:'not-allowed',opacity:0.55}}>📋 التفاصيل</button>
                <button disabled title="غير متاح بعد" style={{padding:'7px 14px',borderRadius:10,border:'none',background:'rgba(22,163,74,0.12)',color:C.green,fontSize:12,fontWeight:700,cursor:'not-allowed',opacity:0.55}}>✓ إغلاق التذكرة</button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:12}}>
            {msgs.map(msg=>(
              <div key={msg.id} style={{display:'flex',flexDirection:msg.from==='admin'?'row-reverse':'row',gap:10,alignItems:'flex-end'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:msg.from==='admin'?C.goldGrad:`${C.blue}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
                  {msg.from==='admin'?'👨‍💼':'👨'}
                </div>
                <div style={{maxWidth:'70%'}}>
                  <div style={{padding:'11px 14px',borderRadius:msg.from==='admin'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:msg.from==='admin'?C.navy:C.card,border:msg.from==='user'?`1px solid ${C.border}`:'none',boxShadow:msg.from==='user'?C.shadow:'none'}}>
                    <p style={{color:msg.from==='admin'?'#fff':C.text,fontSize:13,lineHeight:1.6}}>{msg.text}</p>
                  </div>
                  <p style={{color:C.dim,fontSize:10,marginTop:4,textAlign:msg.from==='admin'?'left':'right'}}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{padding:'12px 16px',borderTop:`1px solid ${C.border}`,display:'flex',gap:10,alignItems:'center'}}>
            <button title="غير متاح بعد" disabled style={{width:40,height:40,borderRadius:11,border:`1px solid ${C.border}`,background:'transparent',cursor:'not-allowed',fontSize:18,flexShrink:0,opacity:0.55}}>📎</button>
            <input value={inputText} onChange={e=>setInputText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="اكتب ردك هنا..." style={{flex:1,padding:'10px 14px',borderRadius:11,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:13,outline:'none',fontFamily:"'Cairo',sans-serif"}}/>
            <button title="غير متاح بعد" disabled style={{width:40,height:40,borderRadius:11,border:`1px solid ${C.border}`,background:'transparent',cursor:'not-allowed',fontSize:18,flexShrink:0,opacity:0.55}}>🎤</button>
            <button onClick={sendMsg} style={{width:42,height:42,borderRadius:12,border:'none',background:C.goldGrad,cursor:'pointer',fontSize:20,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>📤</button>
          </div>
        </div>
      </div>
    </SuperAdminShell>
  );
}
