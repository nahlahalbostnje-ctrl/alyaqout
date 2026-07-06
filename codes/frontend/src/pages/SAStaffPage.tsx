import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const TEACHERS = [
  { id:1, name:'أ. محمد السالم',     avatar:'👨‍🏫', specialty:'الرياضيات',       phone:'0501234567', email:'m.salem@yaqoot.sa',    branch:'🇵🇸 فلسطين', status:'نشط',   courses:8, rating:4.9 },
  { id:2, name:'أ. سارة العمر',      avatar:'👩‍🏫', specialty:'الفيزياء',         phone:'0512345678', email:'s.omar@yaqoot.sa',     branch:'🇯🇴 الأردن',  status:'نشط',   courses:6, rating:4.8 },
  { id:3, name:'أ. خالد المنصور',    avatar:'👨‍🏫', specialty:'اللغة الإنجليزية', phone:'0523456789', email:'k.mansour@yaqoot.sa',  branch:'🇸🇦 السعودية',status:'نشط',   courses:10,rating:4.7 },
  { id:4, name:'أ. نورة الزهراني',   avatar:'👩‍🏫', specialty:'علم الأحياء',      phone:'0534567890', email:'n.zahrani@yaqoot.sa',  branch:'🇪🇬 مصر',status:'إجازة',courses:5, rating:4.6 },
  { id:5, name:'أ. عبدالله القحطاني',avatar:'👨‍🏫', specialty:'الكيمياء',          phone:'0545678901', email:'a.qahtani@yaqoot.sa',  branch:'🇦🇪 الإمارات', status:'نشط',   courses:7, rating:4.5 },
  { id:6, name:'أ. ريم الحربي',      avatar:'👩‍🏫', specialty:'اللغة العربية',     phone:'0556789012', email:'r.harbi@yaqoot.sa',    branch:'🇵🇸 فلسطين', status:'نشط',   courses:9, rating:4.8 },
];

const STAFF = [
  { id:1, name:'عمر الشهري',   avatar:'👨‍💼', role:'مدير إدارة',   phone:'0501111111', email:'o.shahri@yaqoot.sa',   dept:'الإدارة العامة',  status:'نشط' },
  { id:2, name:'فاطمة الحربي', avatar:'👩‍💼', role:'محاسبة',        phone:'0502222222', email:'f.harbi@yaqoot.sa',    dept:'المالية',         status:'نشط' },
  { id:3, name:'سلمى القحطاني',avatar:'👩‍💼', role:'دعم فني',       phone:'0503333333', email:'s.qahtani@yaqoot.sa',  dept:'التقنية',         status:'نشط' },
  { id:4, name:'أحمد الغامدي', avatar:'👨‍💼', role:'مشرف محتوى',   phone:'0504444444', email:'a.ghamdi@yaqoot.sa',   dept:'المحتوى',         status:'إجازة' },
];

export default function SAStaffPage() {
  const [tab, setTab] = useState<'teachers'|'staff'>('teachers');
  const [search, setSearch] = useState('');
  const [impersonating, setImpersonating] = useState<typeof TEACHERS[number]|null>(null);
  const [impersonateDone, setImpersonateDone] = useState(false);

  const filteredTeachers = TEACHERS.filter(t=>search===''||t.name.includes(search)||t.specialty.includes(search));
  const filteredStaff = STAFF.filter(s=>search===''||s.name.includes(search)||s.role.includes(search));

  return (
    <SuperAdminShell>

      {/* Impersonation Modal */}
      {impersonating && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
          onClick={() => { setImpersonating(null); setImpersonateDone(false); }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px', width:'100%', maxWidth:400, fontFamily:"'Cairo',sans-serif", direction:'rtl', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            {impersonateDone ? (
              <div style={{ textAlign:'center', padding:'12px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🔑</div>
                <h3 style={{ color:'#0D1E3A', fontWeight:800, fontSize:17, marginBottom:8 }}>تم الدخول بنجاح</h3>
                <p style={{ color:'#64748B', fontSize:13, marginBottom:16 }}>أنت الآن داخل حساب <strong>{impersonating.name}</strong></p>
                <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'10px', marginBottom:16 }}>
                  <p style={{ color:'#EF4444', fontSize:12, fontWeight:600, margin:0 }}>⚠️ أي تعديل ستقوم به سيُطبَّق على الحساب الحقيقي</p>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => { setImpersonating(null); setImpersonateDone(false); }}
                    style={{ flex:1, padding:'12px', borderRadius:12, background:'#F1F5F9', color:'#64748B', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    الخروج
                  </button>
                  <a href="/teacher/dashboard" style={{ flex:1, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#C59341,#D4A65A)', color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', textDecoration:'none', textAlign:'center', fontFamily:"'Cairo',sans-serif" }}>
                    🚀 انتقل للحساب
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:'rgba(197,147,65,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{impersonating.avatar}</div>
                  <div>
                    <h3 style={{ color:'#0D1E3A', fontWeight:800, fontSize:16, margin:0 }}>{impersonating.name}</h3>
                    <p style={{ color:'#64748B', fontSize:12, margin:'3px 0 0' }}>{impersonating.specialty} — {impersonating.branch}</p>
                  </div>
                </div>
                <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'12px 14px', marginBottom:20 }}>
                  <p style={{ color:'#EF4444', fontWeight:700, fontSize:13, marginBottom:4 }}>⚠️ تحذير: دخول مباشر</p>
                  <p style={{ color:'#64748B', fontSize:12, margin:0 }}>ستدخل إلى حساب هذا المعلم كـ Super Admin. سيُسجَّل هذا الإجراء في سجل النظام.</p>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setImpersonateDone(true)}
                    style={{ flex:1, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#C59341,#D4A65A)', color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    🔑 تأكيد الدخول
                  </button>
                  <button onClick={() => setImpersonating(null)}
                    style={{ flex:1, padding:'12px', borderRadius:12, background:'#F1F5F9', color:'#64748B', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
          {label:'إجمالي المعلمين',value:'936',icon:'👨‍🏫',color:C.teal},
          {label:'المعلمون النشطون',value:'898',icon:'✅',color:C.green},
          {label:'إجمالي الموظفين',value:'58',icon:'👨‍💼',color:C.blue},
          {label:'في إجازة',       value:'14',icon:'🏖️',color:C.orange},
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
              {filteredTeachers.map((t,i)=>(
                <tr key={t.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:`${C.gold}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{t.avatar}</div>
                      <span style={{color:C.text,fontWeight:700,fontSize:13}}>{t.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{t.specialty}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12,direction:'ltr',textAlign:'right'}}>{t.phone}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:11}}>{t.email}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{t.branch}</td>
                  <td style={{padding:'12px 14px',color:C.text,fontWeight:700,fontSize:13,textAlign:'center'}}>{t.courses}</td>
                  <td style={{padding:'12px 14px',color:C.gold,fontWeight:700,fontSize:12}}>⭐ {t.rating}</td>
                  <td style={{padding:'12px 14px'}}>
                    <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:t.status==='نشط'?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)',color:t.status==='نشط'?C.green:C.orange}}>{t.status}</span>
                  </td>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',gap:5}}>
                      {([['✏️','تعديل بيانات المعلم'],['📋','الملف التفصيلي'],['🗑️','حذف المعلم']] as const).map(([ico,label],j)=>(
                        <button key={j} title={label} onClick={()=>alert(`${label} — إدارة الموظفين عبر الدول قيد التطوير، متاحة حالياً من لوحة الأدمن الخاصة بكل دولة.`)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:12}}>{ico}</button>
                      ))}
                      <button onClick={() => { setImpersonating(t); setImpersonateDone(false); }}
                        style={{padding:'0 10px',height:28,borderRadius:8,border:'1px solid rgba(197,147,65,0.4)',background:'rgba(197,147,65,0.08)',cursor:'pointer',fontSize:11,color:C.gold,fontWeight:700,fontFamily:"'Cairo',sans-serif"}}>
                        🔑 دخول كـ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              {filteredStaff.map((s,i)=>(
                <tr key={s.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:`${C.blue}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{s.avatar}</div>
                      <span style={{color:C.text,fontWeight:700,fontSize:13}}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{s.role}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12,direction:'ltr',textAlign:'right'}}>{s.phone}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:11}}>{s.email}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{s.dept}</td>
                  <td style={{padding:'12px 14px'}}>
                    <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:s.status==='نشط'?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)',color:s.status==='نشط'?C.green:C.orange}}>{s.status}</span>
                  </td>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',gap:5}}>
                      {([['✏️','تعديل بيانات الموظف'],['📋','الملف التفصيلي'],['🗑️','حذف الموظف']] as const).map(([ico,label],j)=>(
                        <button key={j} title={label} onClick={()=>alert(`${label} — إدارة الموظفين عبر الدول قيد التطوير، متاحة حالياً من لوحة الأدمن الخاصة بكل دولة.`)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:12}}>{ico}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SuperAdminShell>
  );
}
