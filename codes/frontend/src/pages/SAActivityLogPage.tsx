import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

type ActionType = 'إضافة'|'تعديل'|'حذف'|'تسجيل دخول'|'تصدير'|'اعتماد'|'رفض';
interface LogEntry {
  id:number; user:string; role:string; action:ActionType; screen:string;
  detail:string; ip:string; datetime:string;
}

const ACTION_COLOR:Record<ActionType,string> = {
  'إضافة':'rgba(22,163,74,0.1)','تعديل':'rgba(37,99,235,0.1)','حذف':'rgba(239,68,68,0.1)',
  'تسجيل دخول':'rgba(124,58,237,0.1)','تصدير':'rgba(14,116,144,0.1)',
  'اعتماد':'rgba(22,163,74,0.1)','رفض':'rgba(239,68,68,0.1)',
};
const ACTION_TEXT:Record<ActionType,string> = {
  'إضافة':C.green,'تعديل':C.blue,'حذف':C.red,'تسجيل دخول':C.purple,'تصدير':C.teal,'اعتماد':C.green,'رفض':C.red,
};

const LOGS:LogEntry[] = [
  {id:1,  user:'عبدالله الشمري', role:'سوبر أدمن', action:'اعتماد',       screen:'المحتوى والاعتمادات', detail:'اعتمد فيديو: محاضرة الميكانيكا الكلاسيكية',   ip:'192.168.1.1', datetime:'2026-06-23 15:42:11'},
  {id:2,  user:'عمر الشهري',    role:'مدير',       action:'إضافة',        screen:'إدارة المدارس',        detail:'أضاف مدرسة جديدة: مدارس الياقوت الدولية',      ip:'192.168.1.24',datetime:'2026-06-23 15:38:05'},
  {id:3,  user:'فاطمة الحربي',  role:'مدير',       action:'تعديل',        screen:'الخطط والاشتراكات',    detail:'حدّث اشتراك: مدارس الياقوت الأهلية → VIP',      ip:'192.168.1.31',datetime:'2026-06-23 15:30:22'},
  {id:4,  user:'محمد السالم',   role:'مدرب',       action:'إضافة',        screen:'المحتوى والاعتمادات', detail:'رفع واجب: الفصل الثاني - الرياضيات',             ip:'10.0.0.15',   datetime:'2026-06-23 15:22:48'},
  {id:5,  user:'سارة العمر',    role:'مدربة',      action:'تسجيل دخول',  screen:'لوحة القيادة',         detail:'دخلت من متصفح Chrome على Windows',               ip:'10.0.0.18',   datetime:'2026-06-23 15:15:00'},
  {id:6,  user:'عبدالله الشمري',role:'سوبر أدمن',  action:'تصدير',        screen:'التقارير والتحليلات',  detail:'صدّر تقرير مالي بصيغة Excel - مايو 2026',       ip:'192.168.1.1', datetime:'2026-06-23 14:50:33'},
  {id:7,  user:'سلمى القحطاني', role:'موظفة',      action:'رفض',          screen:'المحتوى والاعتمادات', detail:'رفضت واجب: البلاغة العربية (سبب: محتوى غير مكتمل)',ip:'192.168.1.55',datetime:'2026-06-23 14:42:17'},
  {id:8,  user:'خالد المنصور',  role:'مدرب',       action:'إضافة',        screen:'المحتوى والاعتمادات', detail:'أنشأ اختباراً: منتصف الفصل - اللغة الإنجليزية',  ip:'10.0.0.22',   datetime:'2026-06-23 14:30:09'},
  {id:9,  user:'عمر الشهري',    role:'مدير',       action:'حذف',          screen:'المستخدمون',           detail:'حذف حساب: طالب غير مفعّل (ID #4821)',             ip:'192.168.1.24',datetime:'2026-06-23 14:18:55'},
  {id:10, user:'عبدالله الشمري',role:'سوبر أدمن',  action:'تعديل',        screen:'الإعدادات العامة',     detail:'حدّث بوابة الدفع: أضاف مفتاح Stripe الجديد',    ip:'192.168.1.1', datetime:'2026-06-23 14:05:41'},
  {id:11, user:'نورة الزهراني', role:'مدربة',      action:'إضافة',        screen:'المحتوى والاعتمادات', detail:'رفعت ملف PDF: قراءات - علم الأحياء',              ip:'10.0.0.19',   datetime:'2026-06-23 13:55:20'},
  {id:12, user:'أحمد الغامدي',  role:'موظف',       action:'تسجيل دخول',  screen:'لوحة القيادة',         detail:'دخل من تطبيق الجوال - iOS',                     ip:'10.0.1.45',   datetime:'2026-06-23 13:42:00'},
];

export default function SAActivityLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<'الكل'|ActionType>('الكل');
  const [date, setDate] = useState('2026-06-23');

  const filtered = LOGS.filter(l=>
    (search===''||l.user.includes(search)||l.detail.includes(search)||l.screen.includes(search))&&
    (actionFilter==='الكل'||l.action===actionFilter)
  );

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
        <p style={{color:C.sub,fontSize:12,flexShrink:0}}>{filtered.length} سجل</p>
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
            {filtered.map((log,i)=>(
              <tr key={log.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'#FAFAFA':'#FFFFFF'}}>
                <td style={{padding:'9px 12px',color:C.dim,fontSize:11}}>{log.id}</td>
                <td style={{padding:'9px 12px',color:C.text,fontWeight:700,whiteSpace:'nowrap'}}>{log.user}</td>
                <td style={{padding:'9px 12px',color:C.sub}}>{log.role}</td>
                <td style={{padding:'9px 12px'}}>
                  <span style={{padding:'3px 10px',borderRadius:20,fontSize:10.5,fontWeight:700,background:ACTION_COLOR[log.action],color:ACTION_TEXT[log.action],whiteSpace:'nowrap'}}>{log.action}</span>
                </td>
                <td style={{padding:'9px 12px',color:C.sub,whiteSpace:'nowrap'}}>{log.screen}</td>
                <td style={{padding:'9px 12px',color:C.text,maxWidth:280}}>
                  <p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{log.detail}</p>
                </td>
                <td style={{padding:'9px 12px',color:C.dim,fontFamily:'monospace',fontSize:11}}>{log.ip}</td>
                <td style={{padding:'9px 12px',color:C.dim,fontFamily:'monospace',fontSize:10.5,whiteSpace:'nowrap'}}>{log.datetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}
