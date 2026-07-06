import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const ROLES = [
  {id:'super_admin',  name:'السوبر أدمن',       icon:'👑', color:C.gold,   users:1,   desc:'صلاحيات كاملة وغير محدودة على المنصة'},
  {id:'admin',        name:'مدير المنصة',        icon:'🛡️', color:C.blue,   users:12,  desc:'إدارة المدارس والمحتوى والمستخدمين'},
  {id:'teacher',      name:'المعلم',             icon:'👨‍🏫', color:C.teal,   users:936, desc:'رفع المحتوى وإدارة الدورات والطلاب'},
  {id:'student',      name:'الطالب',             icon:'🎓', color:C.purple, users:12842,desc:'الوصول للمحتوى التعليمي والاختبارات'},
  {id:'parent',       name:'ولي الأمر',          icon:'👨‍👩‍👦', color:C.orange, users:399, desc:'متابعة أداء الأبناء وتقاريرهم'},
  {id:'supervisor',   name:'المشرف الأكاديمي',  icon:'🔍', color:C.green,  users:58,  desc:'متابعة الطلاب وغرف الدراسة'},
];

const SCREENS = [
  'لوحة القيادة', 'مؤشرات المنصة', 'إدارة المدارس', 'المعلمون والموظفون',
  'الطلاب وأولياء الأمور', 'المحتوى والاعتمادات', 'المالية والفواتير',
  'الخطط والاشتراكات', 'التقارير والتحليلات', 'نظام التنبيهات',
  'الإعدادات العامة', 'الصلاحيات والأدوار', 'سجل العمليات',
  'الدعم الفني', 'مركز التطوير',
];

const PERMS = ['قراءة', 'إضافة', 'تعديل', 'حذف'];

const DEFAULT_ACCESS:Record<string,Record<string,Record<string,boolean>>> = {
  super_admin: Object.fromEntries(SCREENS.map(s=>[s,Object.fromEntries(PERMS.map(p=>[p,true]))])),
  admin: Object.fromEntries(SCREENS.map((s,i)=>[s,Object.fromEntries(PERMS.map((p,j)=>[p,i<12&&!(j===3&&i>8)]))])),
  teacher: Object.fromEntries(SCREENS.map((s,i)=>[s,Object.fromEntries(PERMS.map((p,j)=>[p,i===0&&j===0||i===5&&j<2]))])),
  student: Object.fromEntries(SCREENS.map((s,i)=>[s,Object.fromEntries(PERMS.map((p,j)=>[p,j===0&&[0,4].includes(i)]))])),
  parent: Object.fromEntries(SCREENS.map((s,i)=>[s,Object.fromEntries(PERMS.map((p,j)=>[p,j===0&&i===4]))])),
  supervisor: Object.fromEntries(SCREENS.map((s,i)=>[s,Object.fromEntries(PERMS.map((p,j)=>[p,j===0&&[0,4].includes(i)]))])),
};

export default function SARolesPage() {
  const [editRole, setEditRole] = useState<string|null>(null);
  const [access, setAccess] = useState(DEFAULT_ACCESS);

  const togglePerm = (screen:string, perm:string) => {
    if(!editRole) return;
    setAccess(prev=>({...prev,[editRole]:{...prev[editRole],[screen]:{...prev[editRole][screen],[perm]:!prev[editRole][screen][perm]}}}));
  };

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الصلاحيات والأدوار</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة أدوار المستخدمين وصلاحياتهم</p>
        </div>
        <button style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إضافة دور جديد</button>
      </div>

      {/* Roles Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        {ROLES.map(role=>(
          <div key={role.id} style={card({cursor:'pointer',border:editRole===role.id?`2px solid ${role.color}`:`1px solid ${C.border}`,background:editRole===role.id?`${role.color}06`:C.card})} onClick={()=>setEditRole(editRole===role.id?null:role.id)}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:14,background:`${role.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{role.icon}</div>
              <div>
                <p style={{color:C.text,fontWeight:800,fontSize:14}}>{role.name}</p>
                <p style={{color:C.sub,fontSize:11,marginTop:2}}>{role.users.toLocaleString()} مستخدم</p>
              </div>
            </div>
            <p style={{color:C.sub,fontSize:11.5,lineHeight:1.5,marginBottom:12}}>{role.desc}</p>
            <button onClick={e=>{e.stopPropagation();setEditRole(editRole===role.id?null:role.id);}} style={{width:'100%',padding:'9px',borderRadius:11,border:`1px solid ${role.color}`,background:editRole===role.id?role.color:`${role.color}10`,color:editRole===role.id?'#fff':role.color,fontWeight:700,fontSize:12,cursor:'pointer',transition:'all 0.15s'}}>
              {editRole===role.id?'✕ إغلاق':'🔑 تعديل الصلاحيات'}
            </button>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      {editRole&&(
        <div style={card()}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <span style={{fontSize:24}}>{ROLES.find(r=>r.id===editRole)?.icon}</span>
            <div>
              <p style={{color:C.text,fontWeight:800,fontSize:15}}>صلاحيات: {ROLES.find(r=>r.id===editRole)?.name}</p>
              <p style={{color:C.sub,fontSize:12}}>حدد الصلاحيات الممنوحة لهذا الدور</p>
            </div>
            <div style={{flex:1}}/>
            <button style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:12,border:'none',cursor:'pointer'}}>💾 حفظ الصلاحيات</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
              <thead>
                <tr style={{background:'rgba(0,0,0,0.03)'}}>
                  <th style={{padding:'12px 16px',textAlign:'right',color:C.sub,fontSize:12,fontWeight:700,borderBottom:`1px solid ${C.border}`,minWidth:200}}>الشاشة</th>
                  {PERMS.map(p=>(
                    <th key={p} style={{padding:'12px 16px',textAlign:'center',color:C.sub,fontSize:12,fontWeight:700,borderBottom:`1px solid ${C.border}`,minWidth:80}}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCREENS.map((screen,i)=>(
                  <tr key={screen} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                    <td style={{padding:'10px 16px',color:C.text,fontWeight:600,fontSize:13}}>{screen}</td>
                    {PERMS.map(perm=>{
                      const checked=access[editRole]?.[screen]?.[perm]??false;
                      return (
                        <td key={perm} style={{padding:'10px 16px',textAlign:'center'}}>
                          <input type="checkbox" checked={checked} onChange={()=>togglePerm(screen,perm)} style={{width:16,height:16,cursor:'pointer',accentColor:ROLES.find(r=>r.id===editRole)?.color}}/>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
