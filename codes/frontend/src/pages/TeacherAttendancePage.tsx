import { useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.08)',
};

const CLASSES = ['10أ - رياضيات', '10ب - رياضيات', '11أ - فيزياء'];

const STUDENTS = [
  { id:1, name:'أحمد محمد السالم', absences:2, behavior:'ممتاز', attention:'عالي' },
  { id:2, name:'سارة خالد العمر', absences:0, behavior:'جيد جداً', attention:'متوسط' },
  { id:3, name:'محمد علي النجار', absences:5, behavior:'يحتاج متابعة', attention:'منخفض' },
  { id:4, name:'نورة سعد المالك', absences:1, behavior:'ممتاز', attention:'عالي' },
  { id:5, name:'خالد فيصل الغامدي', absences:3, behavior:'جيد', attention:'متوسط' },
  { id:6, name:'لينا أحمد الزهراني', absences:0, behavior:'ممتاز', attention:'عالي' },
  { id:7, name:'يوسف عمر الحارثي', absences:7, behavior:'يحتاج متابعة', attention:'منخفض' },
  { id:8, name:'منى فهد الشهري', absences:1, behavior:'جيد جداً', attention:'عالي' },
];

type AttendanceStatus = 'present' | 'absent' | 'late' | '';

interface StudentRecord {
  id: number;
  name: string;
  absences: number;
  behavior: string;
  attention: string;
}

interface StudentRow extends StudentRecord {
  attendance: AttendanceStatus;
  behaviorNote: string;
  attentionNote: string;
}

const BEHAVIOR_OPTIONS = ['ممتاز', 'جيد جداً', 'جيد', 'يحتاج متابعة', 'سلوك سلبي'];
const ATTENTION_OPTIONS = ['عالي', 'متوسط', 'منخفض', 'غائب ذهنياً'];

export default function TeacherAttendancePage() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [today] = useState(new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' }));
  const [rows, setRows] = useState<StudentRow[]>(
    STUDENTS.map(s => ({ ...s, attendance:'' as AttendanceStatus, behaviorNote:'', attentionNote:'' }))
  );
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance'|'behavior'>('attendance');

  const setAttendance = (id: number, val: AttendanceStatus) => {
    setRows(p => p.map(r => r.id === id ? { ...r, attendance: val } : r));
  };

  const setBehavior = (id: number, val: string) => {
    setRows(p => p.map(r => r.id === id ? { ...r, behaviorNote: val } : r));
  };

  const setAttention = (id: number, val: string) => {
    setRows(p => p.map(r => r.id === id ? { ...r, attentionNote: val } : r));
  };

  const markAll = (val: AttendanceStatus) => {
    setRows(p => p.map(r => ({ ...r, attendance: val })));
  };

  const presentCount = rows.filter(r => r.attendance === 'present').length;
  const absentCount  = rows.filter(r => r.attendance === 'absent').length;
  const lateCount    = rows.filter(r => r.attendance === 'late').length;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const ATT_COLORS: Record<string, string> = { present: C.green, absent: C.red, late: C.amber };
  const ATT_LABELS: Record<string, string> = { present:'حاضر', absent:'غائب', late:'متأخر' };

  return (
    <TeacherLayout>
      <div style={{ padding:20, fontFamily:"'Cairo',sans-serif", direction:'rtl', background:C.bg, minHeight:'100vh' }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>سجل الحضور والسلوك 📋</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13 }}>{today}</p>
        </div>

        {/* Class Selector */}
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          {CLASSES.map(c => (
            <button key={c} onClick={() => setSelectedClass(c)} style={{ padding:'8px 16px', borderRadius:10, border:`1px solid ${selectedClass===c ? C.gold : C.border}`, background: selectedClass===c ? C.goldBg : C.card, color: selectedClass===c ? C.gold : C.sub, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              {c}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
          {[
            { label:'إجمالي الطلاب', value:STUDENTS.length, color:C.text, bg:'#F3F4F6' },
            { label:'حاضرون', value:presentCount, color:C.green, bg:C.greenBg },
            { label:'غائبون', value:absentCount, color:C.red, bg:C.redBg },
            { label:'متأخرون', value:lateCount, color:C.amber, bg:C.amberBg },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:12, padding:'12px 14px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:s.color, fontWeight:900, fontSize:16 }}>{s.value}</span>
              </div>
              <p style={{ color:C.sub, fontSize:11 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div style={{ display:'flex', gap:6, marginBottom:16, background:C.card, padding:4, borderRadius:10, border:`1px solid ${C.border}`, width:'fit-content' }}>
          {([['attendance','تسجيل الحضور'],['behavior','السلوك والانتباه']] as const).map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700, background: activeTab===v ? C.goldGrad : 'transparent', color: activeTab===v ? '#fff' : C.sub, transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <button onClick={() => markAll('present')} style={{ padding:'7px 14px', borderRadius:9, background:C.greenBg, border:`1px solid ${C.green}30`, color:C.green, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تعيين الكل حاضر</button>
              <button onClick={() => markAll('absent')} style={{ padding:'7px 14px', borderRadius:9, background:C.redBg, border:`1px solid ${C.red}30`, color:C.red, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تعيين الكل غائب</button>
            </div>
            <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:C.goldBg, borderBottom:`1px solid ${C.border}` }}>
                    {['#', 'اسم الطالب', 'الغيابات السابقة', 'الحضور اليوم'].map((h,i) => (
                      <th key={i} style={{ padding:'10px 14px', color:C.text, fontWeight:700, fontSize:12, textAlign:'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i) => (
                    <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0 ? '#fff' : '#FAFAF9' }}>
                      <td style={{ padding:'10px 14px', color:C.dim, fontSize:12 }}>{i+1}</td>
                      <td style={{ padding:'10px 14px', color:C.text, fontSize:13, fontWeight:600 }}>{r.name}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ padding:'2px 10px', borderRadius:6, background: r.absences > 4 ? C.redBg : r.absences > 1 ? C.amberBg : C.greenBg, color: r.absences > 4 ? C.red : r.absences > 1 ? C.amber : C.green, fontSize:11, fontWeight:700 }}>
                          {r.absences} غياب
                        </span>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          {(['present','absent','late'] as AttendanceStatus[]).map(s => (
                            <button key={s} onClick={() => setAttendance(r.id, s)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${r.attendance===s ? ATT_COLORS[s] : C.border}`, background: r.attendance===s ? `${ATT_COLORS[s]}15` : '#fff', color: r.attendance===s ? ATT_COLORS[s] : C.dim, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", transition:'all 0.15s' }}>
                              {ATT_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.goldBg, borderBottom:`1px solid ${C.border}` }}>
                  {['اسم الطالب', 'السلوك', 'مستوى الانتباه', 'ملاحظة'].map((h,i) => (
                    <th key={i} style={{ padding:'10px 14px', color:C.text, fontWeight:700, fontSize:12, textAlign:'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0 ? '#fff' : '#FAFAF9' }}>
                    <td style={{ padding:'10px 14px', color:C.text, fontSize:13, fontWeight:600 }}>{r.name}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <select value={r.behaviorNote || r.behavior} onChange={e => setBehavior(r.id, e.target.value)} style={{ padding:'5px 10px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:12, fontFamily:"'Cairo',sans-serif", outline:'none', background:'#fff', color:C.text }}>
                        {BEHAVIOR_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <select value={r.attentionNote || r.attention} onChange={e => setAttention(r.id, e.target.value)} style={{ padding:'5px 10px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:12, fontFamily:"'Cairo',sans-serif", outline:'none', background:'#fff', color:C.text }}>
                        {ATTENTION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <input placeholder="ملاحظة..." style={{ padding:'5px 10px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:12, fontFamily:"'Cairo',sans-serif", outline:'none', width:160 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Save */}
        <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={handleSave} style={{ padding:'10px 28px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(197,147,65,0.3)', fontFamily:"'Cairo',sans-serif" }}>
            حفظ السجل
          </button>
          {saved && <span style={{ color:C.green, fontWeight:700, fontSize:13 }}>✅ تم الحفظ بنجاح!</span>}
        </div>
      </div>
    </TeacherLayout>
  );
}
