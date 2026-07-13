import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

type ActionType = 'إضافة'|'تعديل'|'حذف'|'تسجيل دخول'|'تصدير'|'اعتماد'|'رفض';

export default function SAActivityLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<'الكل'|ActionType>('الكل');
  const [date, setDate] = useState('');

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>سجل العمليات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>تتبع كل عملية تجري على المنصة</p>
        </div>
        <button onClick={()=>alert('تصدير سجل العمليات كملف قيد التطوير.')} style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>📥 تصدير السجل</button>
      </div>

      {/* Filters */}
      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <div style={{position:'relative',flex:1}}>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث في السجل..." style={{width:'100%',padding:'8px 38px 8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <select value={actionFilter} onChange={e=>setActionFilter(e.target.value as typeof actionFilter)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          {(['الكل','إضافة','تعديل','حذف','تسجيل دخول','تصدير','اعتماد','رفض'] as const).map(a=><option key={a}>{a}</option>)}
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none'}}/>
        <p style={{color:C.sub,fontSize:12,flexShrink:0}}>0 سجل</p>
      </div>

      {/* Log Table */}
      <div style={card({padding:0,overflowX:'auto'})}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:700}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.04)'}}>
              {['#','المستخدم','الدور','العملية','الشاشة','التفاصيل','عنوان IP','التاريخ والوقت'].map((h,i)=>(
                <th key={i} style={{padding:'10px 12px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
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
