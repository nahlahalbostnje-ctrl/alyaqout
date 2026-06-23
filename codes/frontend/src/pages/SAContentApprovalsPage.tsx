import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

type ContentStatus = 'pending'|'approved'|'rejected';
interface ContentItem {
  id:number; name:string; type:'video'|'pdf'|'homework'|'exam'|'grade';
  course:string; teacher:string; date:string; status:ContentStatus; size:string;
}

const ITEMS:ContentItem[] = [
  { id:1,  name:'محاضرة الميكانيكا الكلاسيكية - الجزء الأول', type:'video',    course:'الفيزياء المتقدمة',   teacher:'أ. سارة العمر',     date:'2026-06-23', status:'pending',  size:'245 MB' },
  { id:2,  name:'واجب الفصل الثاني - الرياضيات',             type:'homework',  course:'الرياضيات للصف 10', teacher:'أ. محمد السالم',    date:'2026-06-23', status:'pending',  size:'—' },
  { id:3,  name:'اختبار منتصف الفصل - اللغة الإنجليزية',     type:'exam',      course:'اللغة الإنجليزية',   teacher:'أ. خالد المنصور',   date:'2026-06-22', status:'pending',  size:'—' },
  { id:4,  name:'ملف قراءات إضافية - الكيمياء العضوية',      type:'pdf',       course:'الكيمياء العضوية',   teacher:'أ. عبدالله القحطاني',date:'2026-06-22', status:'pending',  size:'12 MB' },
  { id:5,  name:'درجات الاختبار الشهري - علم الأحياء',       type:'grade',     course:'علم الأحياء',        teacher:'أ. نورة الزهراني',  date:'2026-06-21', status:'pending',  size:'—' },
  { id:6,  name:'فيديو شرح الاشتقاق - الجزء الثاني',         type:'video',    course:'الرياضيات للصف 12', teacher:'أ. محمد السالم',    date:'2026-06-20', status:'approved', size:'380 MB' },
  { id:7,  name:'واجب البلاغة العربية',                        type:'homework',  course:'اللغة العربية',       teacher:'أ. ريم الحربي',     date:'2026-06-19', status:'rejected', size:'—' },
];

const TYPE_INFO = {
  video:    { icon:'🎬', label:'فيديو',    color:C.blue   },
  pdf:      { icon:'📄', label:'PDF',     color:C.red    },
  homework: { icon:'📚', label:'واجب',    color:C.orange },
  exam:     { icon:'📝', label:'اختبار',   color:C.purple },
  grade:    { icon:'📊', label:'درجات',   color:C.teal   },
};

export default function SAContentApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'all'|ContentStatus>('all');
  const [items, setItems] = useState<ContentItem[]>(ITEMS);
  const [rejectModal, setRejectModal] = useState<number|null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = items.filter(i=>activeTab==='all'||i.status===activeTab);
  const counts = { all:items.length, pending:items.filter(i=>i.status==='pending').length, approved:items.filter(i=>i.status==='approved').length, rejected:items.filter(i=>i.status==='rejected').length };

  const approve = (id:number) => setItems(prev=>prev.map(i=>i.id===id?{...i,status:'approved' as ContentStatus}:i));
  const reject  = (id:number) => { setItems(prev=>prev.map(i=>i.id===id?{...i,status:'rejected' as ContentStatus}:i)); setRejectModal(null); setRejectReason(''); };

  const TABS:{key:'all'|ContentStatus;label:string;color:string}[] = [
    {key:'all',label:`الكل (${counts.all})`,color:C.text},
    {key:'pending',label:`بانتظار الاعتماد (${counts.pending})`,color:C.orange},
    {key:'approved',label:`معتمدة (${counts.approved})`,color:C.green},
    {key:'rejected',label:`مرفوضة (${counts.rejected})`,color:C.red},
  ];

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>المحتوى والاعتمادات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>مراجعة واعتماد محتوى المنصة</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:12,background:'rgba(217,119,6,0.1)',border:'1px solid rgba(217,119,6,0.25)'}}>
          <span style={{fontSize:18}}>⚠️</span>
          <span style={{color:C.orange,fontWeight:700,fontSize:13}}>{counts.pending} محتوى بانتظار مراجعتك</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:14}}>
        {[
          {label:'إجمالي المحتوى',value:'2,451',icon:'📁',color:C.blue},
          {label:'بانتظار الاعتماد',value:counts.pending,icon:'⏳',color:C.orange},
          {label:'معتمد',         value:counts.approved,icon:'✅',color:C.green},
          {label:'مرفوض',         value:counts.rejected,icon:'❌',color:C.red},
          {label:'هذا الشهر',     value:'+215',icon:'📈',color:C.purple},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'12px',display:'flex',alignItems:'center',gap:10})}>
            <div style={{width:38,height:38,borderRadius:11,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{s.icon}</div>
            <div>
              <p style={{color:C.text,fontWeight:900,fontSize:18}}>{s.value}</p>
              <p style={{color:C.sub,fontSize:10.5}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:`1px solid ${C.border}`,paddingBottom:0}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:'9px 18px',border:'none',background:'transparent',cursor:'pointer',fontSize:12.5,fontWeight:700,color:activeTab===t.key?t.color:C.sub,borderBottom:activeTab===t.key?`2px solid ${t.color}`:'2px solid transparent',transition:'all 0.15s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={card({padding:0,overflow:'hidden'})}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['النوع','اسم الملف / المحتوى','الدورة','المدرب','تاريخ الرفع','الحجم','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item,i)=>{
              const ti=TYPE_INFO[item.type];
              return (
                <tr key={item.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:32,height:32,borderRadius:9,background:`${ti.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{ti.icon}</div>
                      <span style={{color:ti.color,fontSize:11,fontWeight:700}}>{ti.label}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 14px',color:C.text,fontWeight:700,fontSize:12.5,maxWidth:200}}>
                    <p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
                  </td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{item.course}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{item.teacher}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{item.date}</td>
                  <td style={{padding:'12px 14px',color:C.dim,fontSize:12}}>{item.size}</td>
                  <td style={{padding:'12px 14px'}}>
                    {item.status==='pending'&&<span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(217,119,6,0.12)',color:C.orange}}>بانتظار الاعتماد</span>}
                    {item.status==='approved'&&<span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(22,163,74,0.12)',color:C.green}}>معتمد</span>}
                    {item.status==='rejected'&&<span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(239,68,68,0.12)',color:C.red}}>مرفوض</span>}
                  </td>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',gap:5}}>
                      <button title="معاينة" style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:C.navy,color:'#fff',cursor:'pointer',fontSize:12}}>👁️</button>
                      {item.status==='pending'&&<>
                        <button onClick={()=>approve(item.id)} title="اعتماد" style={{width:30,height:30,borderRadius:8,border:'none',background:'rgba(22,163,74,0.15)',color:C.green,cursor:'pointer',fontSize:14,fontWeight:700}}>✓</button>
                        <button onClick={()=>setRejectModal(item.id)} title="رفض" style={{width:30,height:30,borderRadius:8,border:'none',background:'rgba(239,68,68,0.12)',color:C.red,cursor:'pointer',fontSize:14,fontWeight:700}}>✕</button>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal!==null&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setRejectModal(null)}>
          <div style={{background:C.card,borderRadius:20,padding:28,width:440}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:C.text,fontWeight:900,fontSize:17,marginBottom:14}}>سبب الرفض</h2>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="اكتب سبب رفض هذا المحتوى..." rows={4} style={{width:'100%',padding:'10px 14px',borderRadius:11,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:13,outline:'none',resize:'none',boxSizing:'border-box',fontFamily:"'Cairo',sans-serif"}}/>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>reject(rejectModal)} style={{flex:1,padding:'11px',borderRadius:12,background:'linear-gradient(135deg,#DC2626,#EF4444)',color:'#fff',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>تأكيد الرفض</button>
              <button onClick={()=>setRejectModal(null)} style={{flex:1,padding:'11px',borderRadius:12,background:C.bg,color:C.sub,fontWeight:600,fontSize:13,border:`1px solid ${C.border}`,cursor:'pointer'}}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
