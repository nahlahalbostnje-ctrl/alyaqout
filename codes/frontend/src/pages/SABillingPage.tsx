import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

type InvoiceStatus = 'مدفوعة'|'معلقة'|'متأخرة';
interface Invoice {
  id:string; student:string; school:string; method:string; date:string;
  amount:number; status:InvoiceStatus;
}

const INVOICES:Invoice[] = [
  {id:'INV-2026-001',student:'علي حسن محمد',    school:'الياقوت العالمية', method:'visa',   date:'2026-06-23',amount:1200,status:'مدفوعة'},
  {id:'INV-2026-002',student:'مريم سعد الأحمدي',school:'الياقوت الأهلية',  method:'master',date:'2026-06-22',amount:800, status:'مدفوعة'},
  {id:'INV-2026-003',student:'فهد عبدالله الشمري',school:'الياقوت النموذجية',method:'cash',date:'2026-06-22',amount:950, status:'معلقة'},
  {id:'INV-2026-004',student:'سارة خالد البلوي', school:'الياقوت الابتدائية',method:'visa', date:'2026-06-21',amount:1500,status:'مدفوعة'},
  {id:'INV-2026-005',student:'محمد أحمد الغامدي',school:'الياقوت المتوسطة',method:'master',date:'2026-06-20',amount:700, status:'متأخرة'},
  {id:'INV-2026-006',student:'نورة فهد القحطاني',school:'الياقوت العالمية', method:'visa',  date:'2026-06-19',amount:1100,status:'مدفوعة'},
  {id:'INV-2026-007',student:'ريم سالم الحربي',  school:'الياقوت الأهلية', method:'cash',  date:'2026-06-18',amount:600, status:'معلقة'},
  {id:'INV-2026-008',student:'عمر يوسف الزهراني',school:'الياقوت التقنية',  method:'master',date:'2026-06-17',amount:850, status:'متأخرة'},
];

const METHOD_ICON = {visa:'💳',master:'🔶',cash:'💵'} as Record<string,string>;
const METHOD_LABEL = {visa:'Visa',master:'MasterCard',cash:'نقدي'} as Record<string,string>;
const STATUS_COLOR = {'مدفوعة':C.green,'معلقة':C.orange,'متأخرة':C.red} as Record<InvoiceStatus,string>;
const STATUS_BG = {'مدفوعة':'rgba(22,163,74,0.12)','معلقة':'rgba(217,119,6,0.12)','متأخرة':'rgba(239,68,68,0.12)'} as Record<InvoiceStatus,string>;

export default function SABillingPage() {
  const [statusFilter, setStatusFilter] = useState<'الكل'|InvoiceStatus>('الكل');
  const [dateFilter, setDateFilter] = useState('الشهر الحالي');

  const filtered = INVOICES.filter(i=>statusFilter==='الكل'||i.status===statusFilter);
  const totalRevenue = INVOICES.filter(i=>i.status==='مدفوعة').reduce((a,b)=>a+b.amount,0);
  const pending = INVOICES.filter(i=>i.status==='معلقة').reduce((a,b)=>a+b.amount,0);
  const late = INVOICES.filter(i=>i.status==='متأخرة').reduce((a,b)=>a+b.amount,0);

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>المالية والفواتير</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة الإيرادات والعمليات المالية</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:12,background:C.bg,color:C.text,fontWeight:700,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>📥 استيراد</button>
          <button style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:12,background:C.navy,color:'#fff',fontWeight:700,fontSize:12,border:'none',cursor:'pointer'}}>📄 PDF</button>
          <button style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:12,border:'none',cursor:'pointer'}}>📊 Excel</button>
        </div>
      </div>

      {/* Financial Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
        {[
          {label:'إجمالي الإيرادات (المدفوعة)', value:totalRevenue.toLocaleString(),   sub:'+18% عن الشهر الماضي',  icon:'💰', color:C.green,  up:true},
          {label:'الإيرادات هذا الشهر',          value:'245,680',                        sub:'من 348 عملية',          icon:'📅', color:C.blue,   up:true},
          {label:'مبالغ معلقة',                  value:pending.toLocaleString(),         sub:`${INVOICES.filter(i=>i.status==='معلقة').length} فاتورة`,icon:'⏳',color:C.orange,up:false},
          {label:'مبالغ متأخرة',                 value:late.toLocaleString(),            sub:'تحتاج متابعة عاجلة',    icon:'⚠️', color:C.red,    up:false},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'18px'})}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{s.icon}</div>
              <span style={{color:s.up?C.green:C.red,fontSize:11,fontWeight:700,background:s.up?'rgba(22,163,74,0.1)':'rgba(239,68,68,0.1)',padding:'3px 8px',borderRadius:20}}>{s.up?'↑':'↓'}</span>
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
        <p style={{color:C.sub,fontSize:12}}>{filtered.length} فاتورة</p>
      </div>

      {/* Table */}
      <div style={card({padding:0,overflow:'hidden'})}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['رقم الفاتورة','الطالب','المدرسة','طريقة الدفع','التاريخ','المبلغ','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv,i)=>(
              <tr key={inv.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                <td style={{padding:'12px 14px',color:C.gold,fontWeight:700,fontSize:12}}>{inv.id}</td>
                <td style={{padding:'12px 14px',color:C.text,fontWeight:700,fontSize:13}}>{inv.student}</td>
                <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{inv.school}</td>
                <td style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:16}}>{METHOD_ICON[inv.method]}</span>
                    <span style={{color:C.text,fontSize:12}}>{METHOD_LABEL[inv.method]}</span>
                  </div>
                </td>
                <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{inv.date}</td>
                <td style={{padding:'12px 14px',color:C.text,fontWeight:900,fontSize:13}}>{inv.amount.toLocaleString()} <span style={{color:C.dim,fontSize:10,fontWeight:400}}>ر.س</span></td>
                <td style={{padding:'12px 14px'}}>
                  <span style={{padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700,background:STATUS_BG[inv.status],color:STATUS_COLOR[inv.status]}}>{inv.status}</span>
                </td>
                <td style={{padding:'12px 14px'}}>
                  <div style={{display:'flex',gap:5}}>
                    <button title="عرض" style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:12}}>👁️</button>
                    <button title="طباعة" style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:12}}>🖨️</button>
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
