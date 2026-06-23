import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const REPORT_SECTIONS = [
  {
    id:'platform', icon:'📋', title:'تقرير المنصة الشامل', desc:'ملخص شامل لأداء المنصة — الإيرادات، المستخدمين، المحتوى، الاعتمادات',
    stats:[{l:'المدارس',v:'48'},{l:'الطلاب',v:'12,842'},{l:'المعلمين',v:'936'},{l:'الدورات',v:'2,451'}],
    color:C.navy,
  },
  {
    id:'teachers', icon:'👨‍🏫', title:'تقرير المدربين', desc:'تقييم أداء المدربين، نسب التفاعل، وجودة المحتوى المقدم',
    stats:[{l:'المدربون النشطون',v:'898'},{l:'متوسط التقييم',v:'4.7'},{l:'الدورات المنشورة',v:'1,840'},{l:'إجمالي الطلاب',v:'12,842'}],
    color:C.teal,
  },
  {
    id:'students', icon:'🎓', title:'تقرير الطلاب', desc:'معدلات الحضور والتقدم الدراسي والأداء الأكاديمي عبر المنصة',
    stats:[{l:'معدل الحضور',v:'87.3%'},{l:'متوسط التقدم',v:'73.2%'},{l:'الطلاب المتميزون',v:'1,284'},{l:'يحتاجون متابعة',v:'486'}],
    color:C.purple,
  },
  {
    id:'financial', icon:'💰', title:'التقرير المالي', desc:'الإيرادات والمصروفات والفواتير وتحليل الأداء المالي للمنصة',
    stats:[{l:'إيرادات الشهر',v:'245,680'},{l:'الاشتراكات النشطة',v:'42'},{l:'نمو الإيرادات',v:'+18%'},{l:'معدل التحويل',v:'94.2%'}],
    color:C.green,
  },
  {
    id:'content', icon:'✅', title:'تقرير الاعتمادات', desc:'حالة المحتوى المعتمد والمرفوض وكفاءة عملية المراجعة',
    stats:[{l:'إجمالي المحتوى',v:'2,451'},{l:'معدل الاعتماد',v:'89.4%'},{l:'وقت المراجعة',v:'4.2 ساعة'},{l:'هذا الشهر',v:'+215'}],
    color:C.orange,
  },
  {
    id:'activity', icon:'⚡', title:'تقرير نشاط المنصة', desc:'سجل العمليات اليومية وتحليل أنماط استخدام المنصة',
    stats:[{l:'عمليات يومية',v:'8,420'},{l:'حصص مباشرة',v:'124'},{l:'واجبات مرفوعة',v:'3,840'},{l:'رسائل مرسلة',v:'12,100'}],
    color:C.blue,
  },
];

export default function SAReportsPage() {
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-23');
  const [period, setPeriod] = useState('هذا الشهر');
  const [generating, setGenerating] = useState<string|null>(null);

  const handleGenerate = (id:string) => {
    setGenerating(id);
    setTimeout(()=>setGenerating(null), 2000);
  };

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>التقارير والتحليلات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>توليد وتصدير تقارير المنصة الشاملة</p>
        </div>
      </div>

      {/* Export Toolbar */}
      <div style={card({marginBottom:16,padding:'16px 20px'})}>
        <p style={{color:C.text,fontWeight:800,fontSize:14,marginBottom:12}}>فلاتر التقرير</p>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div>
            <label style={{color:C.sub,fontSize:11,fontWeight:600,display:'block',marginBottom:4}}>الفترة الزمنية</label>
            <select value={period} onChange={e=>setPeriod(e.target.value)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
              {['هذا الشهر','الشهر الماضي','آخر 3 أشهر','هذا الفصل الدراسي','هذا العام','مخصص'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          {period==='مخصص'&&<>
            <div>
              <label style={{color:C.sub,fontSize:11,fontWeight:600,display:'block',marginBottom:4}}>من تاريخ</label>
              <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none'}}/>
            </div>
            <div>
              <label style={{color:C.sub,fontSize:11,fontWeight:600,display:'block',marginBottom:4}}>إلى تاريخ</label>
              <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none'}}/>
            </div>
          </>}
          <div style={{flex:1}}/>
          <div style={{display:'flex',gap:10}}>
            <button style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:12,background:C.navy,color:'#fff',fontWeight:700,fontSize:12.5,border:'none',cursor:'pointer',boxShadow:'0 3px 10px rgba(13,21,53,0.3)'}}>
              📄 تنزيل PDF
            </button>
            <button style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:700,fontSize:12.5,border:'none',cursor:'pointer',boxShadow:'0 3px 10px rgba(201,149,42,0.3)'}}>
              📊 تنزيل Excel
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {REPORT_SECTIONS.map(r=>(
          <div key={r.id} style={card({display:'flex',flexDirection:'column',gap:0})}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
              <div style={{width:48,height:48,borderRadius:15,background:`${r.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{r.icon}</div>
              <div>
                <p style={{color:C.text,fontWeight:800,fontSize:14,lineHeight:1.3}}>{r.title}</p>
                <p style={{color:C.sub,fontSize:11,marginTop:3,lineHeight:1.5}}>{r.desc}</p>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {r.stats.map((s,i)=>(
                <div key={i} style={{padding:'10px 12px',borderRadius:12,background:`${r.color}08`,border:`1px solid ${r.color}20`}}>
                  <p style={{color:r.color,fontWeight:900,fontSize:16}}>{s.v}</p>
                  <p style={{color:C.sub,fontSize:10.5,marginTop:2}}>{s.l}</p>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,marginTop:'auto'}}>
              <button onClick={()=>handleGenerate(r.id)} style={{flex:1,padding:'10px',borderRadius:12,background:generating===r.id?C.bg:C.goldGrad,color:generating===r.id?C.sub:'#1B2038',fontWeight:700,fontSize:12,border:generating===r.id?`1px solid ${C.border}`:'none',cursor:'pointer',transition:'all 0.2s'}}>
                {generating===r.id?'⏳ جاري التوليد...':'📊 Excel'}
              </button>
              <button style={{flex:1,padding:'10px',borderRadius:12,background:C.navy,color:'#fff',fontWeight:700,fontSize:12,border:'none',cursor:'pointer'}}>
                📄 PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </SuperAdminShell>
  );
}
