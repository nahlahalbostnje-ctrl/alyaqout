import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

type InvoiceStatus = 'مدفوعة'|'معلقة'|'متأخرة';

export default function SABillingPage() {
  const [statusFilter, setStatusFilter] = useState<'الكل'|InvoiceStatus>('الكل');
  const [dateFilter, setDateFilter] = useState('الشهر الحالي');

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>المالية والفواتير</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة الإيرادات والعمليات المالية</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button disabled title="غير متاح بعد" style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:12,background:C.bg,color:C.dim,fontWeight:700,fontSize:12,border:`1px solid ${C.border}`,cursor:'not-allowed',opacity:0.55}}>📥 استيراد</button>
          <button disabled title="غير متاح بعد" style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:12,background:C.navy,color:'#fff',fontWeight:700,fontSize:12,border:'none',cursor:'not-allowed',opacity:0.55}}>📄 PDF</button>
          <button disabled title="غير متاح بعد" style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:12,border:'none',cursor:'not-allowed',opacity:0.55}}>📊 Excel</button>
        </div>
      </div>

      {/* Financial Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:14}}>
        {[
          {label:'إجمالي الإيرادات (المدفوعة)', value:'—', sub:'لا توجد بيانات', icon:'💰', color:C.green},
          {label:'الإيرادات هذا الشهر',          value:'—', sub:'لا توجد بيانات', icon:'📅', color:C.blue},
          {label:'مبالغ معلقة',                  value:'—', sub:'لا توجد بيانات', icon:'⏳', color:C.orange},
          {label:'مبالغ متأخرة',                 value:'—', sub:'لا توجد بيانات', icon:'⚠️', color:C.red},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'18px'})}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{s.icon}</div>
            </div>
            <p style={{color:C.text,fontWeight:900,fontSize:22,lineHeight:1}}>{s.value}</p>
            <p style={{color:C.sub,fontSize:10,marginTop:2}}>ريال سعودي</p>
            <p style={{color:s.color,fontSize:11,fontWeight:600,marginTop:6}}>{s.sub}</p>
            <p style={{color:C.sub,fontSize:10.5,marginTop:2}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as typeof statusFilter)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          {(['الكل','مدفوعة','معلقة','متأخرة'] as const).map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          {['الشهر الحالي','الشهر الماضي','آخر 3 أشهر','هذا العام'].map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{flex:1}}/>
        <p style={{color:C.sub,fontSize:12}}>0 فاتورة</p>
      </div>

      {/* Table */}
      <div style={card({padding:0,overflowX:'auto'})}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:620}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['رقم الفاتورة','الطالب','الفرع / الدولة','طريقة الدفع','التاريخ','المبلغ','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8}>
                <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}
