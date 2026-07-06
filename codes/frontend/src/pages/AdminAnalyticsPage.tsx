import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.08)',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card, borderRadius: 18, padding: 20, boxShadow: C.shadow, border: `1px solid ${C.border}`, ...e,
});

const TEACHERS = [
  { id:1, name:'أ. محمد السالم',   subject:'الرياضيات',  students:184, avgScore:88, attendance:96, engagement:92, homeworkRate:89, rating:4.9, trend:'up'   },
  { id:2, name:'أ. سارة العمر',    subject:'الفيزياء',   students:142, avgScore:82, attendance:91, engagement:78, homeworkRate:74, rating:4.6, trend:'up'   },
  { id:3, name:'أ. خالد النجار',   subject:'العلوم',     students:167, avgScore:71, attendance:84, engagement:65, homeworkRate:61, rating:4.1, trend:'down' },
  { id:4, name:'أ. فاطمة علي',     subject:'اللغة العربية', students:201, avgScore:85, attendance:94, engagement:88, homeworkRate:82, rating:4.7, trend:'up' },
  { id:5, name:'أ. نورة القحطاني', subject:'الكيمياء',   students:98,  avgScore:76, attendance:88, engagement:72, homeworkRate:69, rating:4.3, trend:'stable'},
];

const MONTHLY_DATA = [
  { month:'يناير', activeStudents:1240, revenue:48500, coursesCompleted:312 },
  { month:'فبراير',activeStudents:1380, revenue:52100, coursesCompleted:358 },
  { month:'مارس',  activeStudents:1520, revenue:61800, coursesCompleted:401 },
  { month:'أبريل', activeStudents:1690, revenue:69400, coursesCompleted:445 },
  { month:'مايو',  activeStudents:1840, revenue:78200, coursesCompleted:512 },
  { month:'يونيو', activeStudents:2010, revenue:84600, coursesCompleted:567 },
];

const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

function AIEvaluation({ teacher }: { teacher: typeof TEACHERS[0] }) {
  const score = Math.round((teacher.avgScore + teacher.attendance + teacher.engagement + teacher.homeworkRate) / 4);
  const strong: string[] = [];
  const improve: string[] = [];

  if (teacher.avgScore >= 85) strong.push('معدل درجات الطلاب ممتاز');
  else improve.push('تحسين أساليب الشرح لرفع معدل الدرجات');

  if (teacher.attendance >= 92) strong.push('انتظام عالٍ في الحضور');
  else improve.push('الالتزام بمواعيد الحصص بشكل أفضل');

  if (teacher.engagement >= 80) strong.push('تفاعل قوي مع الطلاب');
  else improve.push('تعزيز التفاعل باستخدام أنشطة تفاعلية');

  if (teacher.homeworkRate >= 78) strong.push('متابعة جيدة للواجبات');
  else improve.push('تعزيز تسليم الواجبات عبر تحفيز الطلاب');

  const level = score >= 88 ? { label:'متميز', color: C.green, bg: C.greenBg }
              : score >= 75 ? { label:'جيد', color: C.blue, bg: C.blueBg }
              : { label:'يحتاج متابعة', color: C.red, bg: C.redBg };

  return (
    <div style={{ background:`linear-gradient(135deg,${C.navy},#1B2A4A)`, borderRadius:16, padding:'20px 22px', color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
        <div>
          <p style={{ fontWeight:800, fontSize:14, lineHeight:1 }}>تقييم الذكاء الاصطناعي</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>تحليل شامل لأداء المعلم</p>
        </div>
        <span style={{ marginRight:'auto', padding:'4px 12px', borderRadius:20, background: level.bg, color: level.color, fontSize:12, fontWeight:700 }}>
          {level.label}
        </span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, paddingBottom:16, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background: C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#1B2038', flexShrink:0 }}>
          {score}
        </div>
        <div>
          <p style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>مؤشر الأداء الكلي</p>
          <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.1)', width:180 }}>
            <div style={{ width:`${score}%`, height:'100%', borderRadius:4, background: C.goldGrad, transition:'width 1s' }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:8 }}>نقاط القوة:</p>
        {strong.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
            <span style={{ color: C.goldL, fontSize:12 }}>✓</span>
            <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.85)' }}>{s}</p>
          </div>
        ))}
      </div>

      {improve.length > 0 && (
        <div>
          <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.55)', marginBottom:8 }}>توصيات للتحسين:</p>
          {improve.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:7, marginBottom:5 }}>
              <span style={{ color:'#FCA5A5', fontSize:12 }}>!</span>
              <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.75)' }}>{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<typeof TEACHERS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'platform'|'teachers'>('platform');

  return (
    <AdminLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl', minHeight:'100vh', background: C.bg }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          <div style={{ width:4, height:28, borderRadius:4, background: C.goldGrad }} />
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:900, color: C.text }}>التحليلات المتقدمة 📊</h1>
            <p style={{ margin:0, fontSize:12, color: C.sub, marginTop:2 }}>مؤشرات الأداء الشاملة مع تقييم الذكاء الاصطناعي</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:22, background: C.card, borderRadius:14, padding:5, border:`1px solid ${C.border}`, width:'fit-content' }}>
          {([['platform','📈 إحصاءات المنصة'],['teachers','👨‍🏫 تقييم المعلمين بالذكاء الاصطناعي']] as const).map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              style={{ padding:'8px 20px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:activeTab===v?700:500, background: activeTab===v ? C.goldGrad : 'transparent', color: activeTab===v ? '#1B2038' : C.sub, transition:'all 0.2s', boxShadow: activeTab===v ? '0 3px 10px rgba(197,147,65,0.3)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ─── Platform Tab ─── */}
        {activeTab === 'platform' && (
          <>
            {/* KPI Row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
              {[
                { icon:'👥', val:'2,010',  label:'طلاب نشطون',     color: C.blue,  trend:'+12%'  },
                { icon:'🎓', val:'142',    label:'دورة منشورة',    color: C.green, trend:'+8%'   },
                { icon:'💰', val:'84,600', label:'إيرادات (ر.س)',  color: C.gold,  trend:'+18%'  },
                { icon:'⭐', val:'4.7',    label:'تقييم المنصة',   color: C.amber, trend:'+0.2'  },
              ].map((kpi,i) => (
                <div key={i} style={card()}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <span style={{ fontSize:26 }}>{kpi.icon}</span>
                    <span style={{ padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:'rgba(16,185,129,0.08)', color: C.green }}>
                      {kpi.trend}
                    </span>
                  </div>
                  <p style={{ color: kpi.color, fontWeight:900, fontSize:26, lineHeight:1, marginBottom:4 }}>{kpi.val}</p>
                  <p style={{ color: C.sub, fontSize:12 }}>{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div style={card({ marginBottom:20 })}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <p style={{ color: C.text, fontWeight:800, fontSize:15 }}>الإيرادات الشهرية (ر.س)</p>
                <span style={{ fontSize:11, color: C.gold, fontWeight:700 }}>يناير — يونيو 2026</span>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160 }}>
                {MONTHLY_DATA.map((d,i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <p style={{ fontSize:10, color: C.sub, fontWeight:700 }}>
                      {(d.revenue/1000).toFixed(0)}k
                    </p>
                    <div style={{ width:'100%', borderRadius:'6px 6px 0 0', background: i===5 ? C.goldGrad : C.goldBg, height: `${(d.revenue / maxRevenue) * 110}px`, transition:'height 0.6s' }} />
                    <p style={{ fontSize:10, color: C.sub }}>{d.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={card()}>
                <p style={{ color: C.text, fontWeight:800, fontSize:14, marginBottom:14 }}>توزيع الدورات بالمادة</p>
                {[
                  { label:'الرياضيات', pct:32, color: C.blue },
                  { label:'اللغة العربية', pct:24, color: C.gold },
                  { label:'العلوم', pct:20, color: C.green },
                  { label:'اللغة الإنجليزية', pct:14, color: C.amber },
                  { label:'أخرى', pct:10, color: C.dim },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                      <span style={{ color: C.text, fontWeight:600 }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight:700 }}>{item.pct}%</span>
                    </div>
                    <div style={{ height:7, borderRadius:4, background:'rgba(0,0,0,0.06)' }}>
                      <div style={{ width:`${item.pct}%`, height:'100%', borderRadius:4, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={card()}>
                <p style={{ color: C.text, fontWeight:800, fontSize:14, marginBottom:14 }}>مؤشرات الأداء الرئيسية</p>
                {[
                  { icon:'📊', label:'معدل إتمام الدورات',    val:'73%',  color: C.green  },
                  { icon:'⚡', label:'معدل التفاعل اليومي',   val:'89%',  color: C.blue   },
                  { icon:'📝', label:'معدل تسليم الواجبات',   val:'81%',  color: C.gold   },
                  { icon:'🏆', label:'نسبة النجاح في الامتحانات', val:'87%', color: C.amber },
                  { icon:'👤', label:'متوسط جلسات الطالب/أسبوع', val:'4.2', color: C.sub  },
                ].map((kpi,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, paddingBlock:8, borderBottom:i<4?`1px solid ${C.border}`:'none' }}>
                    <span style={{ fontSize:18 }}>{kpi.icon}</span>
                    <p style={{ color: C.text, fontSize:12.5, flex:1 }}>{kpi.label}</p>
                    <p style={{ color: kpi.color, fontWeight:800, fontSize:15 }}>{kpi.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── Teachers AI Evaluation Tab ─── */}
        {activeTab === 'teachers' && (
          <div style={{ display:'grid', gridTemplateColumns: selectedTeacher ? '1fr 380px' : '1fr', gap:18 }}>

            {/* Teachers Table */}
            <div>
              <div style={card({ padding:0, overflowX:'auto' })}>
                <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}` }}>
                  <p style={{ color: C.text, fontWeight:800, fontSize:15 }}>أداء المعلمين — تقييم AI</p>
                  <p style={{ color: C.sub, fontSize:12, marginTop:3 }}>انقر على معلم لعرض التقييم التفصيلي</p>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:560 }}>
                  <thead>
                    <tr style={{ background:'#F8F5EE' }}>
                      {['المعلم','المادة','الطلاب','متوسط الدرجات','الحضور','التفاعل','التقييم','الاتجاه'].map(h => (
                        <th key={h} style={{ padding:'11px 14px', textAlign:'right', color: C.sub, fontSize:11.5, fontWeight:700, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEACHERS.map(t => (
                      <tr key={t.id}
                        onClick={() => setSelectedTeacher(t.id === selectedTeacher?.id ? null : t)}
                        style={{ cursor:'pointer', background: selectedTeacher?.id === t.id ? C.goldBg : 'transparent', borderBottom:`1px solid ${C.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.goldBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = selectedTeacher?.id === t.id ? C.goldBg : 'transparent')}>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background: C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color: C.gold }}>
                              {t.name.charAt(3)}
                            </div>
                            <span style={{ fontWeight:700, color: C.text }}>{t.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px', color: C.sub }}>{t.subject}</td>
                        <td style={{ padding:'12px 14px', fontWeight:700, color: C.blue }}>{t.students}</td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ fontWeight:800, color: t.avgScore >= 85 ? C.green : t.avgScore >= 70 ? C.amber : C.red }}>{t.avgScore}%</span>
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ fontWeight:700, color: t.attendance >= 90 ? C.green : C.amber }}>{t.attendance}%</span>
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <div style={{ flex:1, height:6, borderRadius:3, background:'rgba(0,0,0,0.06)', minWidth:50 }}>
                              <div style={{ width:`${t.engagement}%`, height:'100%', borderRadius:3, background: t.engagement >= 80 ? C.green : C.amber }} />
                            </div>
                            <span style={{ fontSize:11.5, color: C.sub }}>{t.engagement}%</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ fontSize:13, fontWeight:800, color: C.gold }}>⭐ {t.rating}</span>
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ fontSize:16 }}>{t.trend === 'up' ? '📈' : t.trend === 'down' ? '📉' : '➡️'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Panel */}
            {selectedTeacher && (
              <div>
                <div style={{ ...card({ marginBottom:14 }) }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background: C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:20, color: C.gold, flexShrink:0 }}>
                      {selectedTeacher.name.charAt(3)}
                    </div>
                    <div>
                      <p style={{ color: C.text, fontWeight:800, fontSize:15 }}>{selectedTeacher.name}</p>
                      <p style={{ color: C.sub, fontSize:12 }}>{selectedTeacher.subject} • {selectedTeacher.students} طالب</p>
                    </div>
                    <button onClick={() => setSelectedTeacher(null)}
                      style={{ marginRight:'auto', width:28, height:28, borderRadius:7, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:14, color: C.sub }}>✕</button>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                    {[
                      { label:'متوسط الدرجات', val:`${selectedTeacher.avgScore}%` },
                      { label:'الحضور',         val:`${selectedTeacher.attendance}%` },
                      { label:'التفاعل',        val:`${selectedTeacher.engagement}%` },
                      { label:'تسليم الواجبات', val:`${selectedTeacher.homeworkRate}%` },
                    ].map((m,i) => (
                      <div key={i} style={{ background: C.goldBg, borderRadius:12, padding:'10px 12px', border:`1px solid ${C.goldBdr}` }}>
                        <p style={{ color: C.sub, fontSize:11, marginBottom:3 }}>{m.label}</p>
                        <p style={{ color: C.text, fontWeight:900, fontSize:17 }}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <AIEvaluation teacher={selectedTeacher} />

                <div style={{ marginTop:12, display:'flex', gap:8 }}>
                  <button style={{ flex:1, padding:'11px', borderRadius:12, background: C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    📧 إرسال تقرير
                  </button>
                  <button style={{ flex:1, padding:'11px', borderRadius:12, background:'transparent', border:`1.5px solid ${C.border}`, color: C.text, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    📥 تحميل PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
