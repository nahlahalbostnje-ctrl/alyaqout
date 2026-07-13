import { useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';

const C = {
  gold:'#C9952A', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.08)', goldBdr:'rgba(201,149,42,0.22)',
  bg:'#F5EFE0', card:'#FFFFFF', navy:'#0D1535',
  text:'#0D1535', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
};

const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];

interface ClassSlot {
  id: number; day: string; time: string; subject: string;
  grade: string; room: string; status: 'active' | 'cancelled' | 'done';
}

const SCHEDULE: ClassSlot[] = [];

const STATUS_COLOR: Record<string, string> = { active:C.blue, done:C.green, cancelled:C.red };
const STATUS_BG: Record<string, string> = { active:C.blueBg, done:C.greenBg, cancelled:C.redBg };
const STATUS_LABEL: Record<string, string> = { active:'📍 قادمة', done:'✅ منتهية', cancelled:'❌ ملغاة' };

type ViewMode = 'grid' | 'list';

export default function TeacherSchedulePage() {
  const [view, setView] = useState<ViewMode>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ day: DAYS[0], time: TIMES[0], grade: '', room: '' });

  const getSlot = (day: string, time: string) =>
    SCHEDULE.find(s => s.day === day && s.time === time);

  const total   = SCHEDULE.length;
  const active  = SCHEDULE.filter(s => s.status === 'active').length;
  const done    = SCHEDULE.filter(s => s.status === 'done').length;
  const cancelled = SCHEDULE.filter(s => s.status === 'cancelled').length;

  return (
    <TeacherLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
              <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>جدول الحصص 📅</h1>
            </div>
            <p style={{ color:C.sub, fontSize:13, margin:0 }}>جدولك الأسبوعي الكامل بكل تفاصيل الحصص</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:`1px solid ${C.border}` }}>
              {(['grid','list'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding:'8px 16px', background: view===v ? C.goldGrad : C.card, color: view===v ? '#fff' : C.sub, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:12, fontWeight:700 }}>
                  {v === 'grid' ? '⊞ جدول' : '☰ قائمة'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddModal(true)}
              style={{ padding:'9px 18px', borderRadius:10, background:C.goldGrad, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              + إضافة حصة
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'إجمالي الحصص', value:total, icon:'📚', color:C.gold },
            { label:'قادمة', value:active, icon:'📍', color:C.blue },
            { label:'منتهية', value:done, icon:'✅', color:C.green },
            { label:'ملغاة', value:cancelled, icon:'❌', color:C.red },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'12px 16px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:22, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11, marginTop:1 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {view === 'grid' ? (
          /* Grid View */
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr>
                  <th style={{ padding:'12px 16px', background:C.goldBg, borderBottom:`1px solid ${C.border}`, color:C.gold, fontSize:12, fontWeight:800, textAlign:'right', width:80 }}>الوقت</th>
                  {DAYS.map(d => (
                    <th key={d} style={{ padding:'12px 16px', background:C.goldBg, borderBottom:`1px solid ${C.border}`, color:C.gold, fontSize:12, fontWeight:800, textAlign:'center' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map(time => (
                  <tr key={time}>
                    <td style={{ padding:'10px 16px', borderBottom:`1px solid ${C.border}`, color:C.sub, fontSize:12, fontWeight:700, background:'rgba(197,147,65,0.03)', whiteSpace:'nowrap' }}>{time}</td>
                    {DAYS.map(day => {
                      const slot = getSlot(day, time);
                      return (
                        <td key={day} style={{ padding:6, borderBottom:`1px solid ${C.border}`, textAlign:'center', verticalAlign:'middle' }}>
                          {slot ? (
                            <div onClick={()=>alert(`${slot.subject} — ${slot.grade}\n🏫 ${slot.room}\n📅 ${slot.day} | ⏰ ${slot.time}\nالحالة: ${STATUS_LABEL[slot.status]}`)} style={{ background: STATUS_BG[slot.status], border:`1px solid ${STATUS_COLOR[slot.status]}30`, borderRadius:10, padding:'8px 10px', cursor:'pointer' }}>
                              <p style={{ color:STATUS_COLOR[slot.status], fontSize:12, fontWeight:800, margin:0, marginBottom:2 }}>{slot.grade}</p>
                              <p style={{ color:C.sub, fontSize:10, margin:0 }}>🏫 {slot.room}</p>
                            </div>
                          ) : (
                            <div style={{ height:44 }} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* List View */
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {SCHEDULE.map(slot => (
              <div key={slot.id} style={{ background:C.card, borderRadius:14, padding:'14px 18px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:50, height:50, borderRadius:12, background:STATUS_BG[slot.status], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:22 }}>{slot.status === 'active' ? '📍' : slot.status === 'done' ? '✅' : '❌'}</span>
                  </div>
                  <div>
                    <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>{slot.subject} — {slot.grade}</p>
                    <p style={{ color:C.sub, fontSize:12 }}>📅 {slot.day} | ⏰ {slot.time} | 🏫 {slot.room}</p>
                  </div>
                </div>
                <span style={{ padding:'4px 14px', borderRadius:8, background:STATUS_BG[slot.status], color:STATUS_COLOR[slot.status], fontSize:11, fontWeight:700 }}>
                  {STATUS_LABEL[slot.status]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'#fff', borderRadius:20, padding:28, width:420, maxWidth:'92vw', fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>
              <h3 style={{ color:C.text, fontWeight:800, fontSize:17, marginBottom:20 }}>➕ إضافة حصة جديدة</h3>

              {[
                { label:'اليوم', key:'day', type:'select', options:DAYS },
                { label:'الوقت', key:'time', type:'select', options:TIMES },
                { label:'الصف الدراسي', key:'grade', type:'text', placeholder:'مثال: الصف العاشر' },
                { label:'رقم الغرفة', key:'room', type:'text', placeholder:'مثال: A101' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom:14 }}>
                  <label style={{ display:'block', color:C.sub, fontSize:12, fontWeight:600, marginBottom:5 }}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={form[field.key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', background:'#fff' }}>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={form[field.key as keyof typeof form]} placeholder={field.placeholder}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box' }} />
                  )}
                </div>
              ))}

              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                  إضافة الحصة
                </button>
                <button onClick={() => setShowAddModal(false)} style={{ padding:'11px 18px', borderRadius:12, background:'#F3F4F6', color:C.sub, fontSize:14, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
}
