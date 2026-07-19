import { useEffect, useMemo, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import api from '../services/axios';

const C = {
  gold:'#C9952A', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.08)',
  card:'#FFFFFF', text:'#0D1535', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
};

const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

interface LiveClassRow {
  id: number;
  title: string;
  scheduled_at: string;
  status: string;
  duration_minutes?: number;
  course?: { id: number; title: string } | null;
}

interface ClassSlot {
  id: number;
  day: string;
  time: string;
  subject: string;
  grade: string;
  room: string;
  status: 'active' | 'cancelled' | 'done';
}

const STATUS_COLOR: Record<string, string> = { active:C.blue, done:C.green, cancelled:C.red };
const STATUS_BG: Record<string, string> = { active:C.blueBg, done:C.greenBg, cancelled:C.redBg };
const STATUS_LABEL: Record<string, string> = { active:'📍 قادمة', done:'✅ منتهية', cancelled:'❌ ملغاة' };

function mapStatus(s: string): ClassSlot['status'] {
  if (s === 'ended' || s === 'completed') return 'done';
  if (s === 'cancelled') return 'cancelled';
  return 'active';
}

export default function TeacherSchedulePage() {
  const [classes, setClasses] = useState<LiveClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    api.get('/teacher/live-classes', { params: { scope: 'active' } })
      .then(r => setClasses(r.data.data ?? []))
      .catch(() => setError('تعذّر تحميل الجدول من الحصص المباشرة'))
      .finally(() => setLoading(false));
  }, []);

  const schedule: ClassSlot[] = useMemo(() => classes.map(lc => {
    const d = new Date(lc.scheduled_at);
    return {
      id: lc.id,
      day: DAYS[d.getDay()] ?? '—',
      time: d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
      subject: lc.course?.title || lc.title,
      grade: lc.title,
      room: `${lc.duration_minutes ?? 60} د`,
      status: mapStatus(lc.status),
    };
  }), [classes]);

  const total = schedule.length;
  const active = schedule.filter(s => s.status === 'active').length;
  const done = schedule.filter(s => s.status === 'done').length;
  const cancelled = schedule.filter(s => s.status === 'cancelled').length;

  return (
    <TeacherLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
              <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>جدول الحصص</h1>
            </div>
            <p style={{ color:C.sub, fontSize:13, margin:0 }}>يُبنى تلقائياً من حصصك المباشرة المعتمدة</p>
          </div>
          <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:`1px solid ${C.border}` }}>
            {(['list','grid'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'8px 16px', background: view===v ? C.goldGrad : C.card, color: view===v ? '#fff' : C.sub, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:12, fontWeight:700 }}>
                {v === 'grid' ? '⊞ أيام' : '☰ قائمة'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'إجمالي الحصص', value:total, icon:'📚', color:C.gold },
            { label:'قادمة / جارية', value:active, icon:'📍', color:C.blue },
            { label:'منتهية', value:done, icon:'✅', color:C.green },
            { label:'ملغاة', value:cancelled, icon:'❌', color:C.red },
          ].map((s,i)=>(
            <div key={i} style={{ background:C.card, borderRadius:14, padding:16, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
              <p style={{ margin:0, fontSize:12, color:C.sub }}>{s.icon} {s.label}</p>
              <p style={{ margin:'6px 0 0', fontSize:22, fontWeight:900, color:s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && <p style={{ color:C.red, fontSize:13 }}>{error}</p>}
        {loading ? (
          <p style={{ color:C.sub }}>جاري التحميل...</p>
        ) : schedule.length === 0 ? (
          <div style={{ background:C.card, borderRadius:16, padding:48, textAlign:'center', border:`1px solid ${C.border}` }}>
            <p style={{ color:C.sub, fontSize:14, fontWeight:700, margin:0 }}>لا حصص مجدولة حالياً</p>
            <p style={{ color:C.dim, fontSize:12, marginTop:8 }}>أضف حصصاً من «حصصي المباشرة» لتظهر هنا</p>
          </div>
        ) : view === 'list' ? (
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
            {schedule.map((slot, i) => (
              <div key={slot.id} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center', gap:12,
                padding:'14px 18px', borderBottom: i < schedule.length-1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div>
                  <p style={{ margin:0, fontWeight:800, color:C.text, fontSize:14 }}>{slot.subject}</p>
                  <p style={{ margin:'4px 0 0', fontSize:12, color:C.sub }}>{slot.day} · {slot.time} · {slot.room}</p>
                </div>
                <span style={{
                  padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:700,
                  color: STATUS_COLOR[slot.status], background: STATUS_BG[slot.status],
                }}>{STATUS_LABEL[slot.status]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
            {DAYS.slice(0, 5).map(day => {
              const daySlots = schedule.filter(s => s.day === day);
              return (
                <div key={day} style={{ background:C.card, borderRadius:14, padding:14, border:`1px solid ${C.border}` }}>
                  <p style={{ margin:'0 0 10px', fontWeight:800, color:C.text }}>{day}</p>
                  {daySlots.length === 0 ? (
                    <p style={{ margin:0, fontSize:12, color:C.dim }}>لا حصص</p>
                  ) : daySlots.map(s => (
                    <div key={s.id} style={{ marginBottom:8, padding:8, borderRadius:10, background:C.goldBg }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:700 }}>{s.time}</p>
                      <p style={{ margin:'2px 0 0', fontSize:11, color:C.sub }}>{s.subject}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
