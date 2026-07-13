import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

export default function SAStaffPage() {
  const [tab, setTab] = useState<'teachers'|'staff'>('teachers');
  const [search, setSearch] = useState('');

  return (
    <SuperAdminShell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>المعلمون والموظفون</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>إدارة كوادر المنصة البشرية</p>
        </div>
        <button onClick={() => alert('سيتم إضافة هذه الميزة قريباً — صفحة إضافة معلم/موظف جديد')} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(201,149,42,0.3)' }}>
          <span>+</span> إضافة جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
        {[
          {label:'إجمالي المعلمين',value:'—',icon:'👨‍🏫',color:C.teal},
          {label:'المعلمون النشطون',value:'—',icon:'✅',color:C.green},
          {label:'إجمالي الموظفين',value:'—',icon:'👨‍💼',color:C.blue},
          {label:'في إجازة',       value:'—',icon:'🏖️',color:C.orange},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:12})}>
            <div style={{width:42,height:42,borderRadius:13,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
            <div>
              <p style={{color:C.text,fontWeight:900,fontSize:20}}>{s.value}</p>
              <p style={{color:C.sub,fontSize:11}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab + Search */}
      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <div style={{ display:'flex', borderRadius:12, overflow:'hidden', border:`1px solid ${C.border}`, flexShrink:0 }}>
          {(['teachers','staff'] as const).map((t,i)=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:700, background:tab===t?C.goldGrad:'transparent', color:tab===t?'#1B2038':C.sub, transition:'all 0.15s', borderLeft:i===0?'none':`1px solid ${C.border}` }}>
              {t==='teachers'?'المعلمون':'الموظفون الإداريون'}
            </button>
          ))}
        </div>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث..." style={{width:'100%',padding:'8px 38px 8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
        </div>
      </div>

      {/* Table */}
      {tab==='teachers'?(
        <div style={card({padding:0,overflowX:'auto'})}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
            <thead>
              <tr style={{background:'rgba(0,0,0,0.03)'}}>
                {['المعلم','التخصص','رقم الهاتف','البريد الإلكتروني','الفرع / الدولة','الدورات','التقييم','الحالة','إجراءات'].map((h,i)=>(
                  <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={9}>
                  <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ):(
        <div style={card({padding:0,overflowX:'auto'})}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
            <thead>
              <tr style={{background:'rgba(0,0,0,0.03)'}}>
                {['الموظف','المسمى الوظيفي','رقم الهاتف','البريد الإلكتروني','القسم','الحالة','إجراءات'].map((h,i)=>(
                  <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7}>
                  <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </SuperAdminShell>
  );
}
