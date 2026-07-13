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
  red:'#EF4444',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
  purple:'#8B5CF6',
};

const CHILD_COLORS = ['#C59341', '#3B82F6', '#10B981', '#8B5CF6'];

interface ReportPayload {
  student: { id: number; name: string; phone: string | null };
  attendance: { total: number; present: number; absent: number; late: number; rate: number | null };
  exams: { count: number; average: number | null; recent: { title: string | null; score: number; total: number; pct: number; date: string }[] };
  homework: { submitted: number; late: number; average: number | null };
  progress: { videos_completed: number };
}

function RingChart({ value, label, color, bg }: { value: number | null; label: string; color: string; bg: string }) {
  const v = value ?? 0;
  const r = 36, circ = 2 * Math.PI * r, dash = (v / 100) * circ;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:90, height:90 }}>
        <svg width="90" height="90" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke={bg} strokeWidth="8" />
          <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
          <span style={{ color:C.text, fontSize:18, fontWeight:900 }}>{value == null ? '—' : `${value}%`}</span>
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

  const CHILDREN = children.map((c, i) => ({
    id: c.id, name: c.name,
    initials: c.name.split(' ').slice(0, 2).map(w => w[0]).join(''),
    color: CHILD_COLORS[i % CHILD_COLORS.length],
  }));

  const [selectedChild, setSelectedChild] = useState(0);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [waBusy, setWaBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const selectedChildId = CHILDREN[selectedChild]?.id;

  const loadReport = async () => {
    if (!selectedChildId) return;
    setLoadingReport(true);
    setMsg(null);
    try {
      const { data } = await api.get(`/parent/children/${selectedChildId}/report`);
      setReport(data.data ?? null);
    } catch {
      setReport(null);
      setMsg({ ok: false, text: 'تعذّر جلب التقرير من النظام.' });
    } finally {
      setLoadingReport(false);
    }
  };

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
      setMsg({ ok: false, text: 'تعذّر تحميل التقرير حالياً.' });
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (!selectedChildId) return;
    setWaBusy(true);
    setMsg(null);
    try {
      const res = await api.post(`/parent/children/${selectedChildId}/report/whatsapp`);
      setMsg({ ok: true, text: res.data?.message ?? 'تم الإرسال بنجاح عبر واتساب.' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setMsg({ ok: false, text: err.response?.data?.message ?? 'تعذّر الإرسال عبر واتساب حالياً.' });
    } finally {
      setWaBusy(false);
    }
  };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>التقارير الأكاديمية</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>تقارير الأداء من بيانات المنصة الفعلية</p>
        </div>

        <div style={{ background:C.card, borderRadius:16, padding:24, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:24 }}>
          <p style={{ color:C.text, fontWeight:800, fontSize:15, marginBottom:20 }}>اختيار الابن</p>
          {CHILDREN.length === 0 ? (
            <p style={{ color:C.sub, fontSize:13 }}>لا يوجد أبناء مرتبطون بالحساب.</p>
          ) : (
            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
              {CHILDREN.map((c, i) => (
                <button key={c.id} onClick={() => { setSelectedChild(i); setReport(null); }} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'9px 18px',
                  borderRadius:12, border: selectedChild===i ? 'none' : `1px solid ${C.border}`,
                  background: selectedChild===i ? c.color : C.card,
                  color: selectedChild===i ? '#fff' : C.text,
                  fontWeight:700, fontSize:13, cursor:'pointer',
                  fontFamily:"'Cairo',sans-serif",
                }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: selectedChild===i ? 'rgba(255,255,255,0.25)' : `${c.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color: selectedChild===i ? '#fff' : c.color }}>{c.initials}</div>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={loadReport} disabled={!selectedChildId || loadingReport} style={{
              padding:'12px 32px', borderRadius:12, background:C.goldGrad, border:'none',
              color:'#fff', fontWeight:800, fontSize:14, cursor: !selectedChildId || loadingReport ? 'default' : 'pointer',
              opacity: !selectedChildId || loadingReport ? 0.6 : 1, fontFamily:"'Cairo',sans-serif",
            }}>{loadingReport ? 'جارٍ التحميل...' : 'عرض التقرير'}</button>
            {report && (
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
          {msg && (
            <p style={{ marginTop:12, fontSize:12.5, fontWeight:700, color: msg.ok ? C.green : C.red }}>
              {msg.ok ? '✅' : '⚠️'} {msg.text}
            </p>
          )}
        </div>

        {report && (
          <div style={{ background:C.card, borderRadius:16, padding:24, boxShadow:C.shadow, border:`1px solid ${C.border}`, marginBottom:24 }}>
            <div style={{ background:'linear-gradient(135deg,#0D1E3A,#1B2038)', borderRadius:12, padding:'18px 24px', marginBottom:24 }}>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginBottom:4 }}>التقرير الأكاديمي</p>
              <p style={{ color:'#fff', fontWeight:900, fontSize:18 }}>{report.student.name}</p>
              <p style={{ color:C.goldL, fontSize:12, marginTop:2 }}>من بيانات المنصة الفعلية</p>
            </div>

            <div style={{ display:'flex', justifyContent:'space-around', marginBottom:24, padding:'20px 0', borderBottom:`1px solid ${C.border}`, flexWrap:'wrap', gap:16 }}>
              <RingChart value={report.exams.average} label="متوسط الامتحانات" color={C.gold} bg={C.goldBg} />
              <RingChart value={report.attendance.rate} label="نسبة الحضور" color={C.green} bg={C.greenBg} />
              <RingChart value={report.homework.average} label="متوسط الواجبات" color={C.blue} bg={C.blueBg} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
              {[
                { l:'سجلات الحضور', v: report.attendance.total },
                { l:'حضور', v: report.attendance.present },
                { l:'غياب', v: report.attendance.absent },
                { l:'تأخير', v: report.attendance.late },
                { l:'امتحانات', v: report.exams.count },
                { l:'واجبات مسلّمة', v: report.homework.submitted },
                { l:'فيديوهات مكتملة', v: report.progress.videos_completed },
              ].map((s,i)=>(
                <div key={i} style={{ padding:14, borderRadius:12, background:C.bg, border:`1px solid ${C.border}` }}>
                  <p style={{ color:C.text, fontWeight:900, fontSize:20 }}>{s.v}</p>
                  <p style={{ color:C.sub, fontSize:11 }}>{s.l}</p>
                </div>
              ))}
            </div>

            <p style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:12 }}>آخر الامتحانات</p>
            {report.exams.recent.length === 0 ? (
              <p style={{ color:C.sub, fontSize:13, marginBottom:16 }}>لا توجد امتحانات مُصحَّحة بعد.</p>
            ) : (
              <div style={{ overflowX:'auto', marginBottom:16 }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:420 }}>
                  <thead>
                    <tr style={{ background:'#F8F5EE' }}>
                      {['الامتحان','الدرجة','النسبة'].map(h=>(
                        <th key={h} style={{ padding:'10px 14px', textAlign:'right', color:C.sub, fontSize:11.5, fontWeight:700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.exams.recent.map((e,i)=>(
                      <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                        <td style={{ padding:'11px 14px', color:C.text, fontSize:13 }}>{e.title || '—'}</td>
                        <td style={{ padding:'11px 14px', color:C.sub, fontSize:13 }}>{e.score}/{e.total}</td>
                        <td style={{ padding:'11px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{e.pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!report && !loadingReport && (
          <div style={{ background:C.card, borderRadius:16, padding:40, boxShadow:C.shadow, border:`1px solid ${C.border}`, textAlign:'center', color:C.sub }}>
            <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>لا يوجد تقرير معروض</p>
            <p style={{ fontSize:13 }}>اختر ابناً ثم اضغط «عرض التقرير» لجلب البيانات من النظام.</p>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
