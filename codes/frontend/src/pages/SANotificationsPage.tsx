import { useState, useEffect } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCountries } from '../features/countries/countriesSlice';
import api from '../services/axios';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface Notif {
  id:number; title:string; body:string; time:string;
  type:'alert'|'info'|'success'|'warning'; read:boolean; icon:string;
}

const INITIAL:Notif[] = [
  {id:1,  title:'انخفاض في حضور الطلاب',       body:'18 طالب من مدارس الياقوت العالمية غابوا عن 3 حصص متتالية',            time:'منذ 10 دقائق',icon:'🚨',type:'alert',  read:false},
  {id:2,  title:'اعتمادات بانتظار المراجعة',    body:'120 عنصر محتوى بانتظار اعتمادك — واجبات، اختبارات، وملفات',           time:'منذ 30 دقيقة',icon:'⏳',type:'warning',read:false},
  {id:3,  title:'معلم جديد انضم للمنصة',        body:'أ. سارة عبدالرحمن انضمت كمدربة للرياضيات في مدارس الياقوت الأهلية',   time:'منذ ساعة',   icon:'👩‍🏫',type:'info', read:false},
  {id:4,  title:'نسخة احتياطية مكتملة',         body:'تم إجراء النسخة الاحتياطية اليومية لقاعدة البيانات بنجاح',            time:'منذ 2 ساعة', icon:'✅',type:'success',read:false},
  {id:5,  title:'اشتراك مدارس الياقوت الدولية', body:'طلب ترقية الاشتراك من الخطة المتميزة إلى خطة الياقوت VIP',             time:'منذ 3 ساعات',icon:'💎',type:'info', read:true},
  {id:6,  title:'تقرير الأداء الشهري جاهز',     body:'تقرير مايو 2026 متاح للتنزيل — نمو 18% في الإيرادات',                time:'منذ 5 ساعات',icon:'📊',type:'success',read:true},
  {id:7,  title:'تحديث النظام بنجاح',           body:'تم تثبيت تحديث النظام v3.2.1 بنجاح على جميع الخوادم',                time:'منذ 7 ساعات',icon:'🔄',type:'success',read:true},
  {id:8,  title:'تذكرة دعم جديدة',              body:'مدير مدارس الياقوت التقنية يطلب المساعدة في إعدادات الحصص المباشرة',  time:'منذ يوم',    icon:'🎫',type:'warning',read:true},
  {id:9,  title:'بلوغ حد التخزين',             body:'مدارس الياقوت الثانوية استخدمت 92% من سعة التخزين المخصصة',           time:'منذ يومين',  icon:'💾',type:'alert',  read:true},
  {id:10, title:'اجتماع إداري مجدول',          body:'اجتماع مجلس الإدارة الفصلي غداً الساعة 10:00 صباحاً',               time:'منذ 3 أيام', icon:'📅',type:'info', read:true},
];

const TYPE_COLOR = {alert:C.red,warning:C.orange,info:C.blue,success:C.green};
const TYPE_BG = {alert:'rgba(239,68,68,0.08)',warning:'rgba(217,119,6,0.08)',info:'rgba(37,99,235,0.08)',success:'rgba(22,163,74,0.08)'};

export default function SANotificationsPage() {
  const dispatch = useAppDispatch();
  const { list: countries } = useAppSelector((s) => s.countries);
  useEffect(() => { if (countries.length === 0) dispatch(fetchCountries()); }, [dispatch, countries.length]);

  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [typeFilter, setTypeFilter] = useState<'all'|Notif['type']>('all');
  const [readFilter, setReadFilter] = useState<'all'|'unread'|'read'>('all');

  // Composer
  const [showComposer, setShowComposer] = useState(false);
  const [composeCountry, setComposeCountry] = useState('');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTarget, setComposeTarget] = useState<'all'|'role'|'grade'>('all');
  const [composeRole, setComposeRole] = useState('student');
  const [composeBusy, setComposeBusy] = useState(false);
  const [composeError, setComposeError] = useState('');
  const [composeDone, setComposeDone] = useState('');

  const openComposer = () => {
    setComposeCountry(countries[0] ? String(countries[0].id) : '');
    setComposeTitle(''); setComposeBody(''); setComposeTarget('all'); setComposeRole('student');
    setComposeError(''); setComposeDone('');
    setShowComposer(true);
  };

  const sendBroadcast = async () => {
    if (!composeCountry || !composeTitle.trim() || !composeBody.trim()) return;
    setComposeBusy(true);
    setComposeError('');
    try {
      const { data } = await api.post('/super-admin/notifications/broadcast', {
        country_id: Number(composeCountry),
        title: composeTitle.trim(),
        body: composeBody.trim(),
        target_type: composeTarget,
        target_value: composeTarget === 'role' ? composeRole : null,
      });
      setComposeDone(`تم الإرسال إلى ${data.broadcast?.recipients_count ?? 0} مستخدم بنجاح.`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setComposeError(err.response?.data?.message ?? 'تعذّر إرسال الإشعار.');
    } finally {
      setComposeBusy(false);
    }
  };

  const filtered = notifs.filter(n=>
    (typeFilter==='all'||n.type===typeFilter)&&
    (readFilter==='all'||(readFilter==='unread'&&!n.read)||(readFilter==='read'&&n.read))
  );
  const unreadCount = notifs.filter(n=>!n.read).length;

  const toggleSelect = (id:number) => setSelected(prev=>{const s=new Set(prev);if(s.has(id))s.delete(id);else s.add(id);return s;});
  const selectAll = () => setSelected(new Set(filtered.map(n=>n.id)));
  const clearSelect = () => setSelected(new Set());
  const markRead = () => { setNotifs(prev=>prev.map(n=>selected.has(n.id)?{...n,read:true}:n)); clearSelect(); };
  const deleteSelected = () => { setNotifs(prev=>prev.filter(n=>!selected.has(n.id))); clearSelect(); };
  const markAllRead = () => setNotifs(prev=>prev.map(n=>({...n,read:true})));

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>نظام التنبيهات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>{unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          {unreadCount>0&&<button onClick={markAllRead} style={{padding:'9px 16px',borderRadius:12,background:C.bg,color:C.text,fontWeight:700,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>✓ تعليم الكل كمقروء</button>}
          <button onClick={openComposer} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إرسال إشعار جديد</button>
        </div>
      </div>

      {/* Filters + Bulk Actions */}
      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as typeof typeFilter)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          <option value="all">كل الأنواع</option>
          <option value="alert">تنبيه عاجل</option>
          <option value="warning">تحذير</option>
          <option value="info">معلومات</option>
          <option value="success">نجاح</option>
        </select>
        <select value={readFilter} onChange={e=>setReadFilter(e.target.value as typeof readFilter)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          <option value="all">الكل</option>
          <option value="unread">غير مقروء</option>
          <option value="read">مقروء</option>
        </select>
        <div style={{flex:1}}/>
        {selected.size>0&&(
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:C.sub,fontSize:12}}>{selected.size} محدد</span>
            <button onClick={markRead} style={{padding:'7px 14px',borderRadius:10,background:'rgba(22,163,74,0.12)',color:C.green,fontWeight:700,fontSize:12,border:'none',cursor:'pointer'}}>✓ تعليم كمقروء</button>
            <button onClick={deleteSelected} style={{padding:'7px 14px',borderRadius:10,background:'rgba(239,68,68,0.12)',color:C.red,fontWeight:700,fontSize:12,border:'none',cursor:'pointer'}}>🗑️ حذف</button>
            <button onClick={clearSelect} style={{padding:'7px 14px',borderRadius:10,background:C.bg,color:C.sub,fontWeight:600,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>إلغاء</button>
          </div>
        )}
        {selected.size===0&&<button onClick={selectAll} style={{padding:'7px 14px',borderRadius:10,background:C.bg,color:C.sub,fontWeight:600,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>تحديد الكل</button>}
      </div>

      {/* Notifications List */}
      <div style={card({padding:0,overflow:'hidden'})}>
        {filtered.length===0?(
          <div style={{textAlign:'center',padding:'48px',color:C.sub,fontSize:14}}>
            <div style={{fontSize:48,marginBottom:12}}>🔔</div>
            <p>لا توجد إشعارات</p>
          </div>
        ):(
          filtered.map((n,i)=>(
            <div key={n.id} onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',borderBottom:i<filtered.length-1?`1px solid ${C.border}`:'none',background:n.read?'transparent':TYPE_BG[n.type],cursor:'pointer',transition:'background 0.15s'}}>
              <input type="checkbox" checked={selected.has(n.id)} onChange={e=>{e.stopPropagation();toggleSelect(n.id);}} onClick={e=>e.stopPropagation()} style={{marginTop:2,cursor:'pointer',accentColor:C.gold}}/>
              <div style={{width:42,height:42,borderRadius:13,background:`${TYPE_COLOR[n.type]}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{n.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <p style={{color:C.text,fontWeight:n.read?600:800,fontSize:13.5}}>{n.title}</p>
                  {!n.read&&<div style={{width:8,height:8,borderRadius:'50%',background:TYPE_COLOR[n.type],flexShrink:0}}/>}
                </div>
                <p style={{color:C.sub,fontSize:12,lineHeight:1.5}}>{n.body}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8,flexShrink:0}}>
                <span style={{color:C.dim,fontSize:11}}>{n.time}</span>
                <span style={{padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:`${TYPE_COLOR[n.type]}15`,color:TYPE_COLOR[n.type]}}>{n.type==='alert'?'عاجل':n.type==='warning'?'تحذير':n.type==='info'?'معلومة':'نجاح'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowComposer(false)}>
          <div dir="rtl" style={{background:'#fff',borderRadius:20,padding:26,width:460,maxWidth:'92vw',fontFamily:"'Cairo',sans-serif"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:C.text,fontWeight:900,fontSize:17,marginBottom:18}}>إرسال إشعار جديد</h3>

            {composeDone ? (
              <div style={{textAlign:'center',padding:'10px 0'}}>
                <div style={{fontSize:48,marginBottom:10}}>✅</div>
                <p style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:18}}>{composeDone}</p>
                <button onClick={()=>setShowComposer(false)} style={{padding:'10px 24px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>إغلاق</button>
              </div>
            ) : (
              <>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:C.sub,marginBottom:6}}>الدولة</label>
                <select value={composeCountry} onChange={e=>setComposeCountry(e.target.value)}
                  style={{width:'100%',padding:'10px 14px',borderRadius:12,border:`1px solid ${C.border}`,fontSize:13,marginBottom:14,fontFamily:"'Cairo',sans-serif"}}>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <label style={{display:'block',fontSize:12,fontWeight:700,color:C.sub,marginBottom:6}}>الفئة المستهدفة</label>
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  {([['all','الجميع'],['role','دور محدد']] as const).map(([v,l]) => (
                    <button key={v} onClick={()=>setComposeTarget(v)} style={{flex:1,padding:'8px',borderRadius:10,border:'none',cursor:'pointer',fontSize:12.5,fontWeight:700,background:composeTarget===v?C.goldGrad:C.bg,color:composeTarget===v?'#1B2038':C.sub}}>{l}</button>
                  ))}
                </div>
                {composeTarget==='role' && (
                  <select value={composeRole} onChange={e=>setComposeRole(e.target.value)}
                    style={{width:'100%',padding:'10px 14px',borderRadius:12,border:`1px solid ${C.border}`,fontSize:13,marginBottom:14,fontFamily:"'Cairo',sans-serif"}}>
                    <option value="student">الطلاب</option>
                    <option value="teacher">المعلمون</option>
                    <option value="parent">أولياء الأمور</option>
                  </select>
                )}

                <label style={{display:'block',fontSize:12,fontWeight:700,color:C.sub,marginBottom:6}}>عنوان الإشعار</label>
                <input value={composeTitle} onChange={e=>setComposeTitle(e.target.value)} placeholder="مثلاً: تذكير بالاختبار النهائي"
                  style={{width:'100%',padding:'10px 14px',borderRadius:12,border:`1px solid ${C.border}`,fontSize:13,marginBottom:14,fontFamily:"'Cairo',sans-serif",boxSizing:'border-box'}} />

                <label style={{display:'block',fontSize:12,fontWeight:700,color:C.sub,marginBottom:6}}>نص الإشعار</label>
                <textarea value={composeBody} onChange={e=>setComposeBody(e.target.value)} rows={4} placeholder="اكتب محتوى الإشعار..."
                  style={{width:'100%',padding:'10px 14px',borderRadius:12,border:`1px solid ${C.border}`,fontSize:13,marginBottom:18,fontFamily:"'Cairo',sans-serif",resize:'none',boxSizing:'border-box'}} />

                {composeError && (
                  <p style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',borderRadius:10,padding:'10px 14px',fontSize:13,marginBottom:14}}>{composeError}</p>
                )}

                <div style={{display:'flex',gap:10}}>
                  <button onClick={sendBroadcast} disabled={composeBusy || !composeCountry || !composeTitle.trim() || !composeBody.trim()}
                    style={{flex:1,padding:'11px',borderRadius:12,background:C.goldGrad,border:'none',color:'#1B2038',fontWeight:800,fontSize:13,cursor:'pointer',opacity:(composeBusy||!composeCountry||!composeTitle.trim()||!composeBody.trim())?0.6:1}}>
                    {composeBusy?'جارٍ الإرسال...':'إرسال الإشعار'}
                  </button>
                  <button onClick={()=>setShowComposer(false)} style={{flex:1,padding:'11px',borderRadius:12,border:`1px solid ${C.border}`,background:'#fff',color:C.sub,fontWeight:700,fontSize:13,cursor:'pointer'}}>إلغاء</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
