import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const STUDENTS = [
  { id:1,  name:'علي حسن محمد',      avatar:'👦', grade:'الصف العاشر',         school:'الياقوت العالمية',  progress:87, status:'نشط',    parent:'حسن محمد' },
  { id:2,  name:'مريم سعد الأحمدي',  avatar:'👧', grade:'الصف الثامن',          school:'الياقوت الأهلية',   progress:92, status:'نشط',    parent:'سعد الأحمدي' },
  { id:3,  name:'فهد عبدالله الشمري',avatar:'👦', grade:'الصف الثاني عشر',      school:'الياقوت النموذجية', progress:78, status:'نشط',    parent:'عبدالله الشمري' },
  { id:4,  name:'سارة خالد البلوي',  avatar:'👧', grade:'الصف السابع',          school:'الياقوت الابتدائية',progress:95, status:'متميز',  parent:'خالد البلوي' },
  { id:5,  name:'محمد أحمد الغامدي', avatar:'👦', grade:'الصف الحادي عشر',      school:'الياقوت المتوسطة',  progress:65, status:'يحتاج متابعة',parent:'أحمد الغامدي' },
  { id:6,  name:'نورة فهد القحطاني', avatar:'👧', grade:'الصف التاسع',           school:'الياقوت العالمية',  progress:88, status:'نشط',    parent:'فهد القحطاني' },
  { id:7,  name:'ريم سالم الحربي',   avatar:'👧', grade:'الصف السادس',          school:'الياقوت الأهلية',   progress:91, status:'نشط',    parent:'سالم الحربي' },
  { id:8,  name:'عمر يوسف الزهراني', avatar:'👦', grade:'الصف العاشر',          school:'الياقوت التقنية',   progress:73, status:'نشط',    parent:'يوسف الزهراني' },
];

const statusColor = (s:string) => s==='متميز'?C.gold:s==='يحتاج متابعة'?C.orange:C.green;
const statusBg = (s:string) => s==='متميز'?'rgba(201,149,42,0.12)':s==='يحتاج متابعة'?'rgba(217,119,6,0.12)':'rgba(22,163,74,0.12)';

export default function SAStudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  const filtered = STUDENTS.filter(s=>
    (search===''||s.name.includes(search)||s.grade.includes(search)||s.school.includes(search))&&
    (statusFilter==='الكل'||s.status===statusFilter)
  );

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الطلاب وأولياء الأمور</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>متابعة أداء وتقدم الطلاب</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{padding:'9px 16px',borderRadius:12,background:C.bg,color:C.text,fontWeight:700,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>📤 تصدير</button>
          <button style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إضافة طالب</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
        {[
          {label:'إجمالي الطلاب',    value:'12,842',icon:'🎓',color:C.purple, sub:'+1,250 هذا الشهر'},
          {label:'الطلاب النشطون',   value:'11,640',icon:'⚡',color:C.green,  sub:'90.6% من الإجمالي'},
          {label:'يحتاجون متابعة',   value:'486',   icon:'⚠️',color:C.orange, sub:'3.8% من الإجمالي'},
          {label:'أولياء الأمور',    value:'10,284',icon:'👨‍👩‍👦',color:C.teal,  sub:'متصلون بالمنصة'},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'14px'})}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <p style={{color:C.sub,fontSize:11}}>{s.label}</p>
              <div style={{width:36,height:36,borderRadius:11,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
            </div>
            <p style={{color:C.text,fontWeight:900,fontSize:21}}>{s.value}</p>
            <p style={{color:s.color,fontSize:11,fontWeight:600,marginTop:4}}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث باسم الطالب أو المدرسة أو الصف..." style={{width:'100%',padding:'8px 38px 8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          {['الكل','نشط','متميز','يحتاج متابعة'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={card({padding:0,overflow:'hidden'})}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['الطالب','الصف / المسار','المدرسة','ولي الأمر','التقدم الدراسي','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                <td style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:9}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:`${C.purple}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.avatar}</div>
                    <span style={{color:C.text,fontWeight:700,fontSize:13}}>{s.name}</span>
                  </div>
                </td>
                <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{s.grade}</td>
                <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{s.school}</td>
                <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{s.parent}</td>
                <td style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{flex:1,height:7,borderRadius:4,background:'rgba(0,0,0,0.08)',minWidth:80}}>
                      <div style={{width:`${s.progress}%`,height:'100%',borderRadius:4,background:s.progress>=90?C.green:s.progress>=70?C.gold:C.orange,transition:'width 0.3s'}}/>
                    </div>
                    <span style={{color:C.text,fontSize:12,fontWeight:700,flexShrink:0}}>{s.progress}%</span>
                  </div>
                </td>
                <td style={{padding:'12px 14px'}}>
                  <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:statusBg(s.status),color:statusColor(s.status)}}>{s.status}</span>
                </td>
                <td style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',gap:5}}>
                    <button title="معاينة" style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13}}>👁️</button>
                    <button title="مراسلة" style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13}}>💬</button>
                    <button title="تقرير" style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13}}>📋</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}
