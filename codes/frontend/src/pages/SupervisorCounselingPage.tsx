import { useState } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  amber:'#F59E0B', amberBg:'rgba(245,158,11,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
};

interface Session {
  id:number; parent:string; student:string; topic:string;
  date:string; time:string; status:'upcoming'|'active'|'done';
}

const SESSIONS: Session[] = [
  { id:1, parent:'أم أحمد',    student:'أحمد محمد',   topic:'تراجع المستوى الأكاديمي في الرياضيات',  date:'2026-06-25', time:'10:00 ص', status:'upcoming' },
  { id:2, parent:'والد سارة',  student:'سارة علي',    topic:'صعوبات في القراءة والفهم',               date:'2026-06-24', time:'03:00 م', status:'upcoming' },
  { id:3, parent:'أم خالد',    student:'خالد أحمد',   topic:'الانضباط وعدم تسليم الواجبات',          date:'2026-06-23', time:'11:00 ص', status:'active' },
  { id:4, parent:'والد نورة',  student:'نورة سلمان',  topic:'متابعة خطة تقوية اللغة الإنجليزية',    date:'2026-06-20', time:'02:00 م', status:'done' },
  { id:5, parent:'أم فيصل',   student:'فيصل ناصر',  topic:'قلق الاختبارات والتوتر',               date:'2026-06-19', time:'04:00 م', status:'done' },
];

const STATUS_MAP = {
  upcoming:{ label:'قادمة',   color:C.amber, bg:C.amberBg },
  active:  { label:'الآن 🟢', color:C.green, bg:C.greenBg },
  done:    { label:'منتهية',  color:C.dim,   bg:'#F3F4F6' },
};

export default function SupervisorCounselingPage() {
  const [filter, setFilter] = useState<'all'|'upcoming'|'active'|'done'>('all');

  const filtered = filter==='all' ? SESSIONS : SESSIONS.filter(s=>s.status===filter);
  const upcoming = SESSIONS.filter(s=>s.status==='upcoming').length;
  const activeNow = SESSIONS.find(s=>s.status==='active');

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>جلسات الإرشاد والتوجيه 🤝</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>متابعة طلبات الإرشاد المحجوزة من أولياء الأمور والدخول للجلسات</p>
        </div>

        {/* Active session banner */}
        {activeNow && (
          <div style={{ background:`linear-gradient(135deg,${C.navy},#1a3560)`, borderRadius:16, padding:'18px 22px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:C.green, boxShadow:'0 0 0 3px rgba(16,185,129,0.3)' }}/>
                <span style={{ color:C.green, fontWeight:700, fontSize:13 }}>جلسة جارية الآن</span>
              </div>
              <p style={{ color:'#fff', fontWeight:800, fontSize:16, marginBottom:2 }}>{activeNow.parent} — {activeNow.student}</p>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{activeNow.topic}</p>
            </div>
            <button onClick={()=>alert('غرفة جلسات الإرشاد المباشرة قريباً — لم تُربط بعد بخدمة البث.')} style={{ padding:'12px 24px', borderRadius:12, border:'none', background:C.goldGrad, color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 4px 14px rgba(197,147,65,0.4)' }}>
              دخول الجلسة →
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
          {[
            { label:'جلسات قادمة',  val:upcoming,                         color:C.amber, icon:'📅' },
            { label:'إجمالي الطلبات', val:SESSIONS.length,               color:C.navy,  icon:'📋' },
            { label:'جلسات منتهية', val:SESSIONS.filter(s=>s.status==='done').length, color:C.green, icon:'✅' },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'16px 20px', boxShadow:C.shadow, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:28 }}>{s.icon}</span>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:24 }}>{s.val}</p>
                <p style={{ color:C.sub, fontSize:12 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:'flex', gap:6, background:C.card, borderRadius:12, padding:4, border:`1px solid ${C.border}`, width:'fit-content', marginBottom:16 }}>
          {(['all','upcoming','active','done'] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'6px 16px', borderRadius:9, border:'none', fontFamily:"'Cairo',sans-serif",
              fontSize:12.5, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              background:filter===f?C.goldGrad:'transparent', color:filter===f?'#fff':C.sub,
            }}>{f==='all'?'الكل':STATUS_MAP[f].label}</button>
          ))}
        </div>

        {/* Sessions */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
              <svg width={56} height={56} fill="none" stroke={C.gold} viewBox="0 0 24 24" strokeWidth={1.2} style={{ opacity:0.35 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p style={{ color:C.dim, fontSize:14 }}>لا توجد جلسات في هذا الفلتر</p>
            </div>
          ) : filtered.map(s => {
            const st = STATUS_MAP[s.status];
            return (
              <div key={s.id} style={{ background:C.card, borderRadius:14, boxShadow:C.shadow, border:`1px solid ${s.status==='active'?'rgba(16,185,129,0.3)':C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
                {/* Date badge */}
                <div style={{ width:54, height:54, borderRadius:12, background:s.status==='active'?C.greenBg:C.goldBg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${s.status==='active'?'rgba(16,185,129,0.2)':C.goldBdr}` }}>
                  <span style={{ color:s.status==='active'?C.green:C.gold, fontWeight:900, fontSize:16 }}>{s.date.split('-')[2]}</span>
                  <span style={{ color:C.dim, fontSize:10 }}>يونيو</span>
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{s.parent}</p>
                    <span style={{ color:C.dim, fontSize:12 }}>·</span>
                    <p style={{ color:C.sub, fontSize:12.5 }}>الطالب: {s.student}</p>
                  </div>
                  <p style={{ color:C.sub, fontSize:12.5, marginBottom:3 }}>{s.topic}</p>
                  <p style={{ color:C.dim, fontSize:11.5 }}>🕐 {s.time} · {s.date}</p>
                </div>
                {/* Status & action */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                  <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11.5, fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>
                  {s.status !== 'done' && (
                    <button onClick={()=>alert('غرفة جلسات الإرشاد المباشرة قريباً — لم تُربط بعد بخدمة البث.')} style={{ padding:'8px 18px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontWeight:700, fontSize:12,
                      background:s.status==='active'?C.goldGrad:C.navy, color:'#fff',
                    }}>
                      {s.status==='active' ? 'دخول الجلسة' : 'الانضمام عند الموعد'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SupervisorLayout>
  );
}
