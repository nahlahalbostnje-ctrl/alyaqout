import { useState, useEffect, useMemo } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSuperAdminStats } from '../features/superAdmin/superAdminSlice';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const ROLE_META = [
  {id:'super_admin',  name:'السوبر أدمن',       icon:'👑', color:C.gold,   desc:'صلاحيات كاملة وغير محدودة على المنصة'},
  {id:'admin',        name:'مدير المنصة',        icon:'🛡️', color:C.blue,   desc:'إدارة المدارس والمحتوى والمستخدمين'},
  {id:'teacher',      name:'المعلم',             icon:'👨‍🏫', color:C.teal,   desc:'رفع المحتوى وإدارة الدورات والطلاب'},
  {id:'student',      name:'الطالب',             icon:'🎓', color:C.purple, desc:'الوصول للمحتوى التعليمي والاختبارات'},
  {id:'parent',       name:'ولي الأمر',          icon:'👨‍👩‍👦', color:C.orange, desc:'متابعة أداء الأبناء وتقاريرهم'},
  {id:'supervisor',   name:'المشرف الأكاديمي',  icon:'🔍', color:C.green,  desc:'متابعة الطلاب وغرف الدراسة'},
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

interface PermRow { role:string; screen:string; permission:string; allowed:boolean; }

export default function SARolesPage() {
  const dispatch = useAppDispatch();
  const { stats } = useAppSelector(s => s.superAdmin);
  const [editRole, setEditRole] = useState<string|null>(null);
  const [access, setAccess] = useState(DEFAULT_ACCESS);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loadingPerms, setLoadingPerms] = useState(false);

  useEffect(() => {
    dispatch(fetchSuperAdminStats());
  }, [dispatch]);

  const roles = useMemo(() => {
    const counts: Record<string, number> = {
      super_admin: 0,
      admin: 0,
      teacher: stats?.total_teachers ?? 0,
      student: stats?.total_students ?? 0,
      parent: stats?.total_parents ?? 0,
      supervisor: 0,
    };
    return ROLE_META.map(r => ({ ...r, users: counts[r.id] ?? 0 }));
  }, [stats]);

  useEffect(() => {
    if (!editRole) return;
    setLoadingPerms(true);
    setSaveMsg('');
    api.get('/super-admin/roles/permissions', { params: { role: editRole } })
      .then(({ data }) => {
        const overrides: PermRow[] = data.data ?? [];
        if (overrides.length === 0) return;
        setAccess(prev => {
          const roleAccess = { ...prev[editRole] };
          overrides.forEach(o => {
            roleAccess[o.screen] = { ...roleAccess[o.screen], [o.permission]: o.allowed };
          });
          return { ...prev, [editRole]: roleAccess };
        });
      })
      .finally(() => setLoadingPerms(false));
  }, [editRole]);

  const togglePerm = (screen:string, perm:string) => {
    if(!editRole) return;
    setAccess(prev=>({...prev,[editRole]:{...prev[editRole],[screen]:{...prev[editRole][screen],[perm]:!prev[editRole][screen][perm]}}}));
  };

  const savePermissions = async () => {
    if (!editRole) return;
    setSaveBusy(true);
    setSaveMsg('');
    const permissions = SCREENS.flatMap(screen =>
      PERMS.map(perm => ({ screen, permission: perm, allowed: !!access[editRole]?.[screen]?.[perm] }))
    );
    try {
      await api.put('/super-admin/roles/permissions', { role: editRole, permissions });
      setSaveMsg('✅ تم حفظ الصلاحيات بنجاح.');
    } catch {
      setSaveMsg('⚠️ تعذّر حفظ الصلاحيات.');
    } finally {
      setSaveBusy(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الصلاحيات والأدوار</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة أدوار المستخدمين وصلاحياتهم</p>
        </div>
        <button onClick={()=>alert('إضافة أدوار مخصصة جديدة تتطلب تعديل بنية الأدوار الأساسية بالنظام (enum + الحماية البرمجية) — غير مفعّلة بعد.')} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إضافة دور جديد</button>
      </div>

      {/* Roles Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:16}}>
        {roles.map(role=>(
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
            <span style={{fontSize:24}}>{roles.find(r=>r.id===editRole)?.icon}</span>
            <div>
              <p style={{color:C.text,fontWeight:800,fontSize:15}}>صلاحيات: {roles.find(r=>r.id===editRole)?.name}</p>
              <p style={{color:C.sub,fontSize:12}}>حدد الصلاحيات الممنوحة لهذا الدور</p>
            </div>
            <div style={{flex:1}}/>
            {saveMsg && <span style={{fontSize:12,fontWeight:700,color:saveMsg.startsWith('✅')?C.green:C.red,marginLeft:10}}>{saveMsg}</span>}
            <button onClick={savePermissions} disabled={saveBusy || loadingPerms} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:12,border:'none',cursor:'pointer',opacity:(saveBusy||loadingPerms)?0.6:1}}>
              {saveBusy?'جارٍ الحفظ...':'💾 حفظ الصلاحيات'}
            </button>
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
                          <input type="checkbox" checked={checked} onChange={()=>togglePerm(screen,perm)} style={{width:16,height:16,cursor:'pointer',accentColor:roles.find(r=>r.id===editRole)?.color}}/>
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
