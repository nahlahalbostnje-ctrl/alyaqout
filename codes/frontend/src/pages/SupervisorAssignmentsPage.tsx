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

const SUBJECTS = ['الكل', 'الرياضيات', 'اللغة العربية', 'العلوم', 'اللغة الإنجليزية'];
const STATUS_FILTERS = ['الكل', 'معلق', 'مراجع', 'مقبول'];

interface Assignment {
  id: number; student: string; title: string; subject: string;
  submitted: string; status: 'pending' | 'reviewed' | 'approved';
  grade: string; feedback: string; hasFile: boolean;
}

const MOCK: Assignment[] = [
  { id:1, student:'أحمد محمد',    title:'تمارين الكسور العشرية',     subject:'الرياضيات',      submitted:'2026-06-20', status:'pending',  grade:'', feedback:'', hasFile:true  },
  { id:2, student:'سارة علي',     title:'قراءة قصيدة المطر',          subject:'اللغة العربية',  submitted:'2026-06-19', status:'pending',  grade:'', feedback:'', hasFile:true  },
  { id:3, student:'خالد أحمد',    title:'تجربة الكيمياء الفصل 3',    subject:'العلوم',          submitted:'2026-06-18', status:'reviewed', grade:'88', feedback:'ممتاز، أكمل شرح الخطوة الأخيرة', hasFile:false },
  { id:4, student:'نورة سلمان',   title:'تمارين Present Perfect',     subject:'اللغة الإنجليزية', submitted:'2026-06-17', status:'approved', grade:'95', feedback:'عمل رائع!', hasFile:true  },
  { id:5, student:'فيصل ناصر',   title:'مسائل هندسية الفصل 4',      subject:'الرياضيات',      submitted:'2026-06-16', status:'pending',  grade:'', feedback:'', hasFile:true  },
];

const STATUS_MAP = { pending:{ label:'معلق', color:C.amber, bg:C.amberBg }, reviewed:{ label:'مراجع', color:C.gold, bg:C.goldBg }, approved:{ label:'مقبول', color:C.green, bg:C.greenBg } };

export default function SupervisorAssignmentsPage() {
  const [subject, setSubject] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [grades, setGrades] = useState<Record<number,string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number,string>>({});
  const [approved, setApproved] = useState<Set<number>>(new Set());

  const filtered = MOCK.filter(a =>
    (subject === 'الكل' || a.subject === subject) &&
    (statusFilter === 'الكل' || STATUS_MAP[a.status].label === statusFilter)
  );

  const approve = (id: number) => setApproved(prev => new Set([...prev, id]));
  const pendingCount = MOCK.filter(a => a.status === 'pending').length;

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>غرف الواجبات 📝</h1>
            {pendingCount > 0 && <span style={{ padding:'2px 10px', borderRadius:20, background:C.amberBg, color:C.amber, fontSize:12, fontWeight:700 }}>{pendingCount} معلق</span>}
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>مراجعة واجبات الطلاب وإدخال الدرجات والتغذية الراجعة</p>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6, background:C.card, borderRadius:12, padding:4, border:`1px solid ${C.border}` }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)} style={{
                padding:'6px 14px', borderRadius:9, border:'none', fontFamily:"'Cairo',sans-serif",
                fontSize:12.5, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                background: subject===s ? C.navy : 'transparent',
                color: subject===s ? '#fff' : C.sub,
              }}>{s}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:6, background:C.card, borderRadius:12, padding:4, border:`1px solid ${C.border}` }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding:'6px 14px', borderRadius:9, border:'none', fontFamily:"'Cairo',sans-serif",
                fontSize:12.5, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                background: statusFilter===s ? C.gold : 'transparent',
                color: statusFilter===s ? '#fff' : C.sub,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <svg width={56} height={56} fill="none" stroke={C.gold} viewBox="0 0 24 24" strokeWidth={1.2} style={{ opacity:0.35 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p style={{ color:C.dim, fontSize:14 }}>لا توجد واجبات تطابق الفلتر المحدد</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}`, background:'#FDFAF4' }}>
                  {['الطالب','الواجب','المادة','تاريخ التسليم','الحالة','الدرجة','التغذية الراجعة','إجراء'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', color:C.sub, fontSize:11.5, fontWeight:700, textAlign:'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const st = STATUS_MAP[a.status];
                  const isApproved = approved.has(a.id);
                  return (
                    <tr key={a.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : 'none', transition:'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#FDFAF4')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                    >
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:12, flexShrink:0 }}>
                            {a.student.charAt(0)}
                          </div>
                          <span style={{ color:C.text, fontWeight:600, fontSize:13 }}>{a.student}</span>
                        </div>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <p style={{ color:C.text, fontSize:13, fontWeight:600, marginBottom:2 }}>{a.title}</p>
                        {a.hasFile && <span style={{ color:C.gold, fontSize:11 }}>📎 ملف مرفق</span>}
                      </td>
                      <td style={{ padding:'14px 16px' }}><span style={{ color:C.sub, fontSize:12.5 }}>{a.subject}</span></td>
                      <td style={{ padding:'14px 16px' }}><span style={{ color:C.dim, fontSize:12 }}>{a.submitted}</span></td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11.5, fontWeight:700, background:isApproved?C.greenBg:st.bg, color:isApproved?C.green:st.color }}>
                          {isApproved ? 'مقبول' : st.label}
                        </span>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <input value={grades[a.id] ?? a.grade} onChange={e => setGrades(g => ({...g,[a.id]:e.target.value}))}
                          placeholder="0-100" maxLength={3}
                          style={{ width:60, padding:'5px 8px', borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, fontFamily:"'Cairo',sans-serif", textAlign:'center', outline:'none' }} />
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <input value={feedbacks[a.id] ?? a.feedback} onChange={e => setFeedbacks(f => ({...f,[a.id]:e.target.value}))}
                          placeholder="اكتب تعليقاً..."
                          style={{ width:180, padding:'5px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, fontFamily:"'Cairo',sans-serif", outline:'none' }} />
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        {!isApproved ? (
                          <button onClick={() => approve(a.id)} style={{
                            padding:'6px 14px', borderRadius:10, border:'none', background:C.goldGrad,
                            color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif",
                            boxShadow:'0 2px 8px rgba(197,147,65,0.3)',
                          }}>اعتماد</button>
                        ) : (
                          <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✓ تم الاعتماد</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SupervisorLayout>
  );
}
