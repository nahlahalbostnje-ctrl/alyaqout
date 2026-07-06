import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const BRANCHES = [
  { id:1, flag:'🇵🇸', country:'فلسطين',       currency:'شيكل',  courses:48, students:2840, teachers:186, admin:'أ. أحمد الخطيب',   status:'نشط',  perf:98.7 },
  { id:2, flag:'🇯🇴', country:'الأردن',        currency:'دينار', courses:36, students:2120, teachers:142, admin:'أ. سامي الزعبي',    status:'نشط',  perf:96.2 },
  { id:3, flag:'🇸🇦', country:'السعودية',      currency:'ريال',  courses:54, students:3410, teachers:224, admin:'أ. عمر الشهري',     status:'نشط',  perf:97.1 },
  { id:4, flag:'🇪🇬', country:'مصر',           currency:'جنيه',  courses:41, students:2980, teachers:198, admin:'أ. محمود حسن',      status:'نشط',  perf:94.8 },
  { id:5, flag:'🇦🇪', country:'الإمارات',      currency:'درهم',  courses:29, students:1620, teachers:108, admin:'أ. خالد المنصوري',  status:'نشط',  perf:95.3 },
  { id:6, flag:'🇰🇼', country:'الكويت',        currency:'دينار', courses:22, students:980,  teachers:76,  admin:'أ. نواف العجمي',    status:'نشط',  perf:92.4 },
  { id:7, flag:'🇶🇦', country:'قطر',           currency:'ريال',  courses:18, students:760,  teachers:54,  admin:'أ. ريم الثاني',     status:'معلق', perf:88.1 },
  { id:8, flag:'🇧🇭', country:'البحرين',       currency:'دينار', courses:14, students:540,  teachers:40,  admin:'أ. فاطمة الدوسري',  status:'معلق', perf:85.6 },
];

const totalStudents = BRANCHES.reduce((s,b)=>s+b.students,0);
const totalTeachers = BRANCHES.reduce((s,b)=>s+b.teachers,0);
const activeCount   = BRANCHES.filter(b=>b.status==='نشط').length;

export default function SASchoolsPage() {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<typeof BRANCHES[0]|null>(null);

  const filtered = BRANCHES.filter(b =>
    (search===''||b.country.includes(search)||b.admin.includes(search)) &&
    (statusFilter==='الكل'||b.status===statusFilter)
  );

  const openAdd  = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (b: typeof BRANCHES[0]) => { setEditTarget(b); setShowModal(true); };

  return (
    <SuperAdminShell>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>إدارة الأفرع</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>
            {BRANCHES.length} فرع — كل فرع يمثّل دولة واحدة في المنصة
          </p>
        </div>
        <button onClick={openAdd}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(201,149,42,0.3)' }}>
          <span style={{ fontSize:16 }}>+</span> إضافة فرع جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        {[
          { label:'إجمالي الأفرع',   value:String(BRANCHES.length), icon:'🌍', color:C.blue   },
          { label:'الأفرع النشطة',   value:String(activeCount),     icon:'✅', color:C.green  },
          { label:'إجمالي الطلاب',   value:totalStudents.toLocaleString(), icon:'🎓', color:C.purple },
          { label:'إجمالي المعلمين', value:totalTeachers.toLocaleString(), icon:'👨‍🏫', color:C.teal  },
        ].map((s,i)=>(
          <div key={i} style={card({ padding:'14px', display:'flex', alignItems:'center', gap:12 })}>
            <div style={{ width:42, height:42, borderRadius:13, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
            <div>
              <p style={{ color:C.text, fontWeight:900, fontSize:20 }}>{s.value}</p>
              <p style={{ color:C.sub, fontSize:11 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={card({ marginBottom:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 })}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث عن فرع أو مدير..."
            style={{ width:'100%', padding:'8px 38px 8px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, outline:'none', boxSizing:'border-box' }}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          style={{ padding:'8px 14px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, outline:'none', cursor:'pointer' }}>
          {['الكل','نشط','معلق'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={card({ padding:0, overflowX:'auto' })}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
          <thead>
            <tr style={{ background:'rgba(0,0,0,0.03)' }}>
              {['#','الفرع / الدولة','العملة','الدورات','الطلاب','المعلمون','مدير الفرع','الأداء','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{ padding:'12px 14px', textAlign:'right', color:C.sub, fontSize:11, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b,i)=>(
              <tr key={b.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?'transparent':'rgba(0,0,0,0.015)' }}>
                <td style={{ padding:'12px 14px', color:C.dim, fontSize:12 }}>{b.id}</td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:`${C.gold}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{b.flag}</div>
                    <div>
                      <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>فرع {b.country}</p>
                      <p style={{ color:C.sub, fontSize:11 }}>{b.country}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{b.currency}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{b.courses}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{b.students.toLocaleString()}</td>
                <td style={{ padding:'12px 14px', color:C.text, fontWeight:700, fontSize:13 }}>{b.teachers}</td>
                <td style={{ padding:'12px 14px', color:C.sub, fontSize:12 }}>{b.admin}</td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(0,0,0,0.08)', minWidth:60 }}>
                      <div style={{ width:`${b.perf}%`, height:'100%', borderRadius:3, background:b.perf>95?C.green:b.perf>90?C.gold:C.orange }}/>
                    </div>
                    <span style={{ color:C.text, fontSize:11, fontWeight:700, flexShrink:0 }}>{b.perf}%</span>
                  </div>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:b.status==='نشط'?'rgba(22,163,74,0.12)':'rgba(217,119,6,0.12)', color:b.status==='نشط'?C.green:C.orange }}>{b.status}</span>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>openEdit(b)} title="تعديل" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✏️</button>
                    <button onClick={()=>alert(`تم ${b.status==='نشط'?'تعليق':'تفعيل'} فرع ${b.country}`)} title={b.status==='نشط'?'تعليق':'تفعيل'} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🔒</button>
                    <button onClick={()=>{ if(confirm(`هل تريد حذف فرع ${b.country}؟`)) alert('تم الحذف — سيُطبّق عند ربط API الفعلي'); }} title="حذف" style={{ width:30, height:30, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{ textAlign:'center', padding:'32px', color:C.sub, fontSize:13 }}>لا توجد نتائج مطابقة</div>}
      </div>

      {/* Modal */}
      {showModal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setShowModal(false)}>
          <div style={{ background:C.card, borderRadius:20, padding:28, width:500, maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:C.text, fontWeight:900, fontSize:17 }}>{editTarget ? `تعديل فرع ${editTarget.country}` : 'إضافة فرع جديد'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:20, color:C.sub }}>×</button>
            </div>
            <p style={{ color:C.sub, fontSize:12, marginBottom:18, background:C.bg, borderRadius:10, padding:'10px 14px' }}>
              ⚠️ كل فرع يمثّل دولة واحدة فقط — لا يمكن إنشاء أكثر من فرع لنفس الدولة.
            </p>
            {[
              { l:'الدولة',         p:'اختر الدولة التي يمثّلها الفرع',  v: editTarget?.country ?? '' },
              { l:'اسم مدير الفرع', p:'الاسم الكامل لمدير هذا الفرع',   v: editTarget?.admin ?? ''   },
              { l:'البريد الإلكتروني', p:'بريد مدير الفرع',             v: '' },
              { l:'رقم الهاتف',     p:'رقم التواصل',                      v: '' },
            ].map((f,i)=>(
              <div key={i} style={{ marginBottom:14 }}>
                <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>{f.l}</label>
                <input defaultValue={f.v} placeholder={f.p}
                  style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.sub, fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>ملاحظات</label>
              <textarea rows={3} placeholder="أي ملاحظات إضافية عن هذا الفرع..." style={{ width:'100%', padding:'9px 14px', borderRadius:11, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', resize:'none', fontFamily:"'Cairo',sans-serif" }}/>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={()=>{ alert(editTarget?'تم حفظ التعديلات — سيُطبّق عند ربط API الفعلي':'تمت إضافة الفرع — سيُطبّق عند ربط API الفعلي'); setShowModal(false); }} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13, border:'none', cursor:'pointer' }}>
                {editTarget ? 'حفظ التعديلات' : 'إضافة الفرع'}
              </button>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'11px', borderRadius:12, background:C.bg, color:C.sub, fontWeight:600, fontSize:13, border:`1px solid ${C.border}`, cursor:'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
