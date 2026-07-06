import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentLiveClasses } from '../features/student/studentSlice';
import StudentBottomNav, { C, BH } from '../components/StudentBottomNav';

const DAYS = [
  { label:'الأحد',    num:25 },
  { label:'الاثنين',  num:27 },
  { label:'الثلاثاء', num:28 },
  { label:'الأربعاء', num:29 },
  { label:'الخميس',  num:30 },
];

const MOCK_CLASSES = [
  { time:'08:00 - 09:00', subject:'الرياضيات',         teacher:'أ. أحمد الحربي',   status:'live'      },
  { time:'09:00 - 10:00', subject:'اللغة الإنجليزية',  teacher:'Sarah Johnson',     status:'scheduled' },
  { time:'11:00 - 12:00', subject:'العلوم',             teacher:'أ. خالد النجار',   status:'scheduled' },
  { time:'12:30 - 01:30', subject:'اللغة العربية',      teacher:'أ. فاطمة علي',     status:'scheduled' },
  { time:'02:00 - 03:00', subject:'التربية الإسلامية', teacher:'أ. محمد سليمان',   status:'scheduled' },
];

const SUBJ_COLORS: Record<string, string> = {
  'الرياضيات':         '#4F46E5',
  'اللغة الإنجليزية': '#2563EB',
  'العلوم':            '#059669',
  'اللغة العربية':     '#D97706',
  'التربية الإسلامية':'#DC2626',
};

export default function StudentLiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { liveClasses } = useAppSelector(s => s.student);
  const [dayIdx, setDayIdx] = useState(0);

  useEffect(() => { dispatch(fetchStudentLiveClasses()); }, [dispatch]);

  const display = liveClasses.length > 0
    ? liveClasses.map(c => ({
        time: c.scheduled_at
          ? new Date(c.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          : '',
        subject: c.title ?? '',
        teacher: c.teacher?.name ?? '',
        status: c.status,
        id: c.id,
        channel: c.agora_channel,
      }))
    : MOCK_CLASSES;

  return (
    <div dir="rtl" style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Cairo',sans-serif", paddingBottom:BH+16 }}>

      {/* Status */}
      <div style={{ background:C.card, padding:'8px 16px 2px', display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:C.navy2 }}>
        <span>9:41</span><span>▶▶ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background:C.card, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
        <button onClick={()=>navigate(-1)} style={{ width:36, height:36, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16 }}>‹</button>
        <h1 style={{ color:C.navy2, fontWeight:800, fontSize:18, flex:1, textAlign:'center' }}>جدول الحصص</h1>
        <div style={{ width:36 }} />
      </div>

      {/* Day Strip */}
      <div style={{ background:C.card, padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none' }}>
        {DAYS.map((d,i) => (
          <button key={i} onClick={()=>setDayIdx(i)}
            style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 14px', borderRadius:14, border:'none', cursor:'pointer', background:dayIdx===i?C.navy2:'transparent', transition:'all 0.2s' }}>
            <span style={{ fontSize:11, color:dayIdx===i?'rgba(255,255,255,0.7)':C.sub, fontWeight:500 }}>{d.label}</span>
            <span style={{ fontSize:18, fontWeight:800, color:dayIdx===i?C.goldL:C.text, lineHeight:1 }}>{d.num}</span>
          </button>
        ))}
      </div>

      {/* Date label */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ color:C.navy2, fontWeight:700, fontSize:15 }}>
          {DAYS[dayIdx].label} {DAYS[dayIdx].num} مايو 2026
        </p>
        <span style={{ color:C.sub, fontSize:12 }}>{display.length} حصص</span>
      </div>

      {/* Class Cards */}
      <div style={{ padding:'0 16px' }}>
        {display.map((cls: any, i: number) => {
          const color = SUBJ_COLORS[Object.keys(SUBJ_COLORS).find(k=>cls.subject?.includes(k.split(' ')[0]))??''] ?? C.blue;
          const isLive = cls.status === 'live';
          return (
            <div key={i} style={{ background:C.card, borderRadius:18, padding:'14px 16px', marginBottom:10, boxShadow:C.shadow, border:`1px solid ${isLive?'rgba(22,163,74,0.3)':C.border}`, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <p style={{ color:C.sub, fontSize:10.5, marginBottom:2 }}>{cls.time?.split(' - ')[0] ?? cls.time}</p>
                <div style={{ width:3, height:28, borderRadius:2, background:color, margin:'4px auto' }} />
                <p style={{ color:C.dim, fontSize:10.5 }}>{cls.time?.split(' - ')[1] ?? ''}</p>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                  <p style={{ color:C.navy2, fontWeight:800, fontSize:14 }}>{cls.subject}</p>
                  {isLive && (
                    <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10.5, fontWeight:700, color:'#16A34A', background:'rgba(22,163,74,0.08)', padding:'2px 8px', borderRadius:20 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#16A34A', display:'inline-block' }} />
                      مباشر
                    </span>
                  )}
                </div>
                <p style={{ color:C.sub, fontSize:12 }}>{cls.teacher}</p>
              </div>
              <button
                onClick={()=>{ if(cls.channel||isLive) navigate(`/live/${cls.channel??'demo'}?classId=${cls.id??1}`); }}
                style={{ flexShrink:0, padding:'8px 16px', borderRadius:11, background:isLive?C.goldGrad:`${color}18`, border:isLive?'none':`1px solid ${color}33`, color:isLive?'#1B2038':color, fontWeight:700, fontSize:12.5, cursor:'pointer', boxShadow:isLive?'0 3px 10px rgba(201,149,42,0.35)':'none' }}>
                دخول
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Button */}
      <div style={{ padding:'6px 16px 16px' }}>
        <button onClick={()=>alert('عرض الجدول الأسبوعي الكامل قيد التطوير.')} style={{ width:'100%', padding:'13px', borderRadius:14, background:C.card, border:`1.5px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          عرض الجدول الكامل
        </button>
      </div>

      <StudentBottomNav cur="/student/live-classes" />
    </div>
  );
}
