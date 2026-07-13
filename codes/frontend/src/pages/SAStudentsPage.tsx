import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

export default function SAStudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الطلاب وأولياء الأمور</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>متابعة أداء وتقدم الطلاب</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>alert('تصدير قائمة الطلاب قيد التطوير.')} style={{padding:'9px 16px',borderRadius:12,background:C.bg,color:C.text,fontWeight:700,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>📤 تصدير</button>
          <button onClick={()=>alert('إضافة طالب من لوحة السوبر أدمن قيد التطوير — استخدم لوحة الأدمن الخاصة بكل دولة حالياً.')} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إضافة طالب</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:14}}>
        {[
          {label:'إجمالي الطلاب',    value:'—',icon:'🎓',color:C.purple, sub:'لا توجد بيانات'},
          {label:'الطلاب النشطون',   value:'—',icon:'⚡',color:C.green,  sub:'لا توجد بيانات'},
          {label:'يحتاجون متابعة',   value:'—',icon:'⚠️',color:C.orange, sub:'لا توجد بيانات'},
          {label:'أولياء الأمور',    value:'—',icon:'👨‍👩‍👦',color:C.teal,  sub:'لا توجد بيانات'},
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث باسم الطالب أو الفرع أو الصف..." style={{width:'100%',padding:'8px 38px 8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          {['الكل','نشط','متميز','يحتاج متابعة'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={card({padding:0,overflowX:'auto'})}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:580}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['الطالب','الصف / المسار','الفرع / الدولة','ولي الأمر','التقدم الدراسي','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7}>
                <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا يوجد طلاب</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}
