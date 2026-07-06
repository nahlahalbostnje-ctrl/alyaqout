import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import api from '../services/axios';

const C = {
  gold:'#C59341', goldL:'#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
  purple:'#8B5CF6', amber:'#F59E0B', amberBg:'rgba(245,158,11,0.08)',
};

const CHILDREN_STATIC = [
  { id:1, name:'محمد أحمد', initials:'مأ', color:'#C59341', grade:'الصف الخامس' },
  { id:2, name:'سارة أحمد', initials:'سأ', color:'#3B82F6', grade:'الصف السادس' },
  { id:3, name:'علي أحمد',  initials:'عأ', color:'#10B981', grade:'الصف الثالث' },
];
const CHILD_COLORS = ['#C59341', '#3B82F6', '#10B981', '#8B5CF6'];

const REPORT_TYPES = [
  { id:'monthly',  label:'التقرير الشهري',  icon:'📅', desc:'ملخص الأداء الشهري الشامل' },
  { id:'semester', label:'التقرير الفصلي',  icon:'📚', desc:'تحليل مفصل للفصل الدراسي' },
  { id:'subject',  label:'تقرير المادة',    icon:'📖', desc:'تقرير تفصيلي لمادة محددة' },
  { id:'behavior', label:'تقرير السلوك',   icon:'🌟', desc:'تقرير الانضباط والحضور' },
];

const REPORT_DATA = {
  child:'محمد أحمد', grade:'الصف الخامس', period:'مايو 2025',
  overall_avg: 88, attendance_rate: 94, homework_completion: 90, behavior_score: 95,
  strengths: ['الرياضيات','العلوم','اللغة العربية'],
  improvements: ['اللغة الإنجليزية','التاريخ'],
  subjects: [
    { name:'الرياضيات',        avg:92, grade:'ممتاز',    trend:'up'     },
    { name:'اللغة الإنجليزية', avg:76, grade:'جيد جداً', trend:'up'     },
    { name:'العلوم',            avg:88, grade:'ممتاز',    trend:'stable' },
    { name:'اللغة العربية',    avg:91, grade:'ممتاز',    trend:'up'     },
    { name:'التاريخ',           avg:80, grade:'جيد جداً', trend:'down'   },
  ],
  teacher_notes:'محمد طالب مجتهد ويُبدي تقدماً ملحوظاً في جميع المواد. يُنصح بمزيد من التدريب على مهارات الكتابة الإنجليزية وزيادة القراءة خارج المنهج.',
};

const PREV_REPORTS = [
  { date:'2025-04-30', type:'شهري', child:'محمد أحمد', status:'جاهز' },
  { date:'2025-04-30', type:'شهري', child:'سارة أحمد', status:'جاهز' },
  { date:'2025-03-31', type:'شهري', child:'محمد أحمد', status:'جاهز' },
  { date:'2025-02-28', type:'فصلي', child:'محمد أحمد', status:'جاهز' },
  { date:'2025-02-28', type:'فصلي', child:'سارة أحمد', status:'جاهز' },
];

function RingChart({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  const r = 36, circ = 2 * Math.PI * r, dash = (value / 100) * circ;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:90, height:90 }}>
        <svg width="90" height="90" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke={bg} strokeWidth="8" />
          <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
          <span style={{ color:C.text, fontSize:18, fontWeight:900 }}>{value}%</span>
        </div>
      </div>
      <p style={{ color:C.sub, fontSize:12, fontWeight:600, textAlign:'center' }}>{label}</p>
    </div>
  );
}

export default function ParentReportsPage() {
  const dispatch = useAppDispatch();
  const { children } = useAppSelector((s) => s.parent);

  useEffect(() => { if (children.length === 0) dispatch(fetchParentDashboard()); }, [dispatch, children.length]);

  const CHILDREN = children.length > 0
    ? children.map((c, i) => ({
        id: c.id, name: c.name,
        initials: c.name.split(' ').slice(0, 2).map(w => w[0]).join(''),
        color: CHILD_COLORS[i % CHILD_COLORS.length], grade: 'طالب',
      }))
    : CHILDREN_STATIC;

  const [selectedChild, setSelectedChild] = useState(0);
  const [selectedType, setSelectedType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('مايو 2025');
  const [showReport, setShowReport] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [waBusy, setWaBusy] = useState(false);
  const [waMsg, setWaMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const selectedChildId = CHILDREN[selectedChild]?.id;

  const handleDownloadPdf = async () => {
    if (!selectedChildId) return;
    setPdfBusy(true);
    try {
      const res = await api.get(`/parent/children/${selectedChildId}/report/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير-${CHILDREN[selectedChild].name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setWaMsg({ ok: false, text: 'تعذّر تحميل التقرير حالياً.' });
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (!selectedChildId) return;
    setWaBusy(true);
    setWaMsg(null);
    try {
      const res = await api.post(`/parent/children/${selectedChildId}/report/whatsapp`);
      setWaMsg({ ok: true, text: res.data?.message ?? 'تم الإرسال بنجاح عبر واتساب.' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setWaMsg({ ok: false, text: err.response?.data?.message ?? 'تعذّر الإرسال عبر واتساب حالياً.' });
    } finally {
      setWaBusy(false);
    }
  };

  const months = ['مايو 2025','أبريل 2025','مارس 2025','فبراير 2025','يناير 2025'];

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>التقارير الأكاديمية 📋</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>مركز استخراج وثائق تقييم الأداء الشامل</p>
        </div>

        {/* Report builder */}
        <div style={{ background:C.card, borderRadius:16, padding:24, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:24 }}>
          <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:20 }}>🛠️ بناء التقرير</p>

          {/* Child selector */}
          <p style={{ color:C.sub, fontSize:12, fontWeight:700, marginBottom:10 }}>اختر الابن</p>
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {CHILDREN.map((c, i) => (
              <button key={c.id} onClick={() => setSelectedChild(i)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'9px 18px',
                borderRadius:12, border: selectedChild===i ? 'none' : `1px solid ${C.border}`,
                background: selectedChild===i ? c.color : C.card,
                color: selectedChild===i ? '#fff' : C.text,
                fontWeight:700, fontSize:13, cursor:'pointer',
                boxShadow: selectedChild===i ? `0 4px 14px ${c.color}40` : 'none',
                fontFamily:"'Cairo',sans-serif",
              }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background: selectedChild===i ? 'rgba(255,255,255,0.25)' : `${c.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color: selectedChild===i ? '#fff' : c.color }}>{c.initials}</div>
                {c.name}
                <span style={{ fontSize:10, opacity:0.8 }}>{c.grade}</span>
              </button>
            ))}
          </div>

          {/* Report type */}
          <p style={{ color:C.sub, fontSize:12, fontWeight:700, marginBottom:10 }}>نوع التقرير</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
            {REPORT_TYPES.map((t) => (
              <div key={t.id} onClick={() => setSelectedType(t.id)} style={{
                padding:'14px 16px', borderRadius:12, cursor:'pointer', textAlign:'center',
                border: selectedType===t.id ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                background: selectedType===t.id ? C.goldBg : C.card,
                boxShadow: selectedType===t.id ? `0 4px 14px rgba(197,147,65,0.18)` : 'none',
                transition:'all 0.15s',
              }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{t.icon}</div>
                <p style={{ color: selectedType===t.id ? C.gold : C.text, fontWeight:700, fontSize:12.5, marginBottom:3 }}>{t.label}</p>
                <p style={{ color:C.dim, fontSize:10.5, lineHeight:1.4 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Period */}
          <p style={{ color:C.sub, fontSize:12, fontWeight:700, marginBottom:10 }}>الفترة الزمنية</p>
          <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
            {months.map((m) => (
              <button key={m} onClick={() => setSelectedMonth(m)} style={{
                padding:'8px 16px', borderRadius:10, fontSize:12.5, fontWeight:600, cursor:'pointer',
                border: selectedMonth===m ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                background: selectedMonth===m ? C.goldBg : C.card,
                color: selectedMonth===m ? C.gold : C.sub,
                fontFamily:"'Cairo',sans-serif",
              }}>{m}</button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={() => setShowReport(true)} style={{
              padding:'12px 32px', borderRadius:12, background:C.goldGrad, border:'none',
              color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer',
              boxShadow:'0 4px 14px rgba(197,147,65,0.35)', fontFamily:"'Cairo',sans-serif",
            }}>📊 توليد التقرير</button>
            {showReport && (
              <>
                <button onClick={handleDownloadPdf} disabled={pdfBusy} style={{
                  padding:'12px 24px', borderRadius:12, border:`1.5px solid ${C.gold}`,
                  background:'transparent', color:C.gold, fontWeight:700, fontSize:13, cursor: pdfBusy ? 'default' : 'pointer',
                  fontFamily:"'Cairo',sans-serif", opacity: pdfBusy ? 0.6 : 1,
                }}>{pdfBusy ? '... جارٍ التحميل' : '📄 تحميل PDF'}</button>
                <button onClick={handleSendWhatsapp} disabled={waBusy} style={{
                  padding:'12px 24px', borderRadius:12, border:'none',
                  background:'#25D366', color:'#fff', fontWeight:700, fontSize:13, cursor: waBusy ? 'default' : 'pointer',
                  fontFamily:"'Cairo',sans-serif", opacity: waBusy ? 0.6 : 1,
                }}>{waBusy ? '... جارٍ الإرسال' : '📱 إرسال عبر واتساب'}</button>
              </>
            )}
          </div>
          {waMsg && (
            <p style={{ marginTop:12, fontSize:12.5, fontWeight:700, color: waMsg.ok ? C.green : C.red }}>
              {waMsg.ok ? '✅' : '⚠️'} {waMsg.text}
            </p>
          )}
        </div>

        {/* Generated report */}
        {showReport && (
          <div style={{ background:C.card, borderRadius:16, padding:24, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:24 }}>
            {/* Report header */}
            <div style={{ background:'linear-gradient(135deg,#0D1E3A,#1B2038)', borderRadius:12, padding:'18px 24px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginBottom:4 }}>التقرير الأكاديمي الشهري</p>
                <p style={{ color:'#fff', fontWeight:900, fontSize:18 }}>{REPORT_DATA.child}</p>
                <p style={{ color:C.goldL, fontSize:12, marginTop:2 }}>{REPORT_DATA.grade} • {REPORT_DATA.period}</p>
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>تاريخ الإصدار</p>
                <p style={{ color:'#fff', fontSize:12, fontWeight:700 }}>2025-05-31</p>
                <p style={{ color:C.goldL, fontSize:10, marginTop:4 }}>منصة الياقوت التعليمية</p>
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display:'flex', justifyContent:'space-around', marginBottom:24, padding:'20px 0', borderBottom:`1px solid ${C.border}` }}>
              <RingChart value={REPORT_DATA.overall_avg}         label="المتوسط العام"     color={C.gold}   bg={C.goldBg} />
              <RingChart value={REPORT_DATA.attendance_rate}     label="نسبة الحضور"      color={C.green}  bg={C.greenBg} />
              <RingChart value={REPORT_DATA.homework_completion} label="إكمال الواجبات"   color={C.blue}   bg={C.blueBg} />
              <RingChart value={REPORT_DATA.behavior_score}      label="درجة السلوك"      color={C.purple} bg="rgba(139,92,246,0.08)" />
            </div>

            {/* Subjects table */}
            <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:12 }}>أداء المواد الدراسية</p>
            <div style={{ overflowX:'auto', marginBottom:24 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
              <thead>
                <tr style={{ background:'#F8F5EE' }}>
                  {['المادة','المتوسط','التقييم','الاتجاه'].map((h) => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'right', color:C.sub, fontSize:11.5, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPORT_DATA.subjects.map((s, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'11px 14px', color:C.text, fontSize:13, fontWeight:600 }}>{s.name}</td>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:6, borderRadius:3, background:`${s.avg>=80?C.green:s.avg>=60?C.amber:C.red}1A` }}>
                          <div style={{ height:'100%', width:`${s.avg}%`, borderRadius:3, background: s.avg>=80?C.green:s.avg>=60?C.amber:C.red }} />
                        </div>
                        <span style={{ color:C.text, fontWeight:800, fontSize:13, minWidth:32 }}>{s.avg}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: s.grade==='ممتاز'?C.greenBg:C.amberBg, color: s.grade==='ممتاز'?C.green:C.amber }}>
                        {s.grade}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:18 }}>
                      {s.trend==='up' ? <span style={{ color:C.green }}>↑</span> : s.trend==='down' ? <span style={{ color:C.red }}>↓</span> : <span style={{ color:C.amber }}>→</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Strengths & improvements */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
              <div style={{ background:C.greenBg, borderRadius:12, padding:16, border:'1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ color:C.green, fontWeight:800, fontSize:13, marginBottom:10 }}>✅ نقاط القوة</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {REPORT_DATA.strengths.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:C.green, flexShrink:0 }} />
                      <span style={{ color:C.text, fontSize:12.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:C.amberBg, borderRadius:12, padding:16, border:'1px solid rgba(245,158,11,0.2)' }}>
                <p style={{ color:C.amber, fontWeight:800, fontSize:13, marginBottom:10 }}>📈 مجالات التحسين</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {REPORT_DATA.improvements.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:C.amber, flexShrink:0 }} />
                      <span style={{ color:C.text, fontSize:12.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher notes */}
            <div style={{ borderRight:`4px solid ${C.gold}`, paddingRight:16, marginBottom:24, background:C.goldBg, padding:'14px 16px', borderRadius:'0 12px 12px 0' }}>
              <p style={{ color:C.gold, fontWeight:800, fontSize:12, marginBottom:6 }}>💬 ملاحظات المعلمين</p>
              <p style={{ color:C.text, fontSize:13, lineHeight:1.8 }}>{REPORT_DATA.teacher_notes}</p>
            </div>

            {/* Download button */}
            <button onClick={handleDownloadPdf} disabled={pdfBusy} style={{
              width:'100%', padding:'14px', borderRadius:12, background:C.goldGrad,
              border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor: pdfBusy ? 'default' : 'pointer',
              boxShadow:'0 4px 16px rgba(197,147,65,0.35)', display:'flex', alignItems:'center',
              justifyContent:'center', gap:8, fontFamily:"'Cairo',sans-serif", opacity: pdfBusy ? 0.6 : 1,
            }}>
              {pdfBusy ? '... جارٍ التحميل' : '📄 تحميل التقرير كاملاً PDF'}
            </button>
          </div>
        )}

        {/* Previous reports */}
        <div style={{ background:C.card, borderRadius:16, padding:20, boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:C.goldGrad }} />
            <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>التقارير السابقة</span>
          </div>
          <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:520 }}>
            <thead>
              <tr style={{ background:'#F8F5EE' }}>
                {['التاريخ','نوع التقرير','الابن','الحالة','إجراءات'].map((h) => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'right', color:C.sub, fontSize:11.5, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREV_REPORTS.map((r, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'11px 14px', color:C.sub, fontSize:12 }}>{r.date}</td>
                  <td style={{ padding:'11px 14px', color:C.text, fontSize:13 }}>{r.type}</td>
                  <td style={{ padding:'11px 14px', color:C.text, fontSize:13, fontWeight:600 }}>{r.child}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:C.greenBg, color:C.green }}>{r.status}</span>
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>alert(`عرض تقرير ${r.type} بتاريخ ${r.date} لـ${r.child} قيد التطوير — أرشيف التقارير السابقة غير مفعّل بعد، استخدم "بناء تقرير جديد" أعلاه.`)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>عرض</button>
                      <button onClick={()=>alert(`تحميل تقرير ${r.type} بتاريخ ${r.date} لـ${r.child} قيد التطوير — أرشيف التقارير السابقة غير مفعّل بعد، استخدم "بناء تقرير جديد" أعلاه.`)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${C.goldBdr}`, background:C.goldBg, color:C.gold, fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تحميل</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </ParentLayout>
  );
}
