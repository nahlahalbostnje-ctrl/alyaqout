import { useState, useEffect, useCallback } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCountries } from '../features/countries/countriesSlice';
import api from '../services/axios';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface BroadcastRow {
  id: number;
  country: string | null;
  title: string;
  body: string;
  target_type: string;
  target_value: string | null;
  recipients_count: number;
  sent_by: { id: number; name: string } | null;
  sent_at: string | null;
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function SANotificationsPage() {
  const dispatch = useAppDispatch();
  const { list: countries } = useAppSelector((s) => s.countries);
  useEffect(() => { if (countries.length === 0) dispatch(fetchCountries()); }, [dispatch, countries.length]);

  const [rows, setRows] = useState<BroadcastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState('');

  const [showComposer, setShowComposer] = useState(false);
  const [composeCountry, setComposeCountry] = useState('');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTarget, setComposeTarget] = useState<'all'|'role'|'grade'>('all');
  const [composeRole, setComposeRole] = useState('student');
  const [composeBusy, setComposeBusy] = useState(false);
  const [composeError, setComposeError] = useState('');
  const [composeDone, setComposeDone] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/notifications/history', {
        params: countryFilter ? { country_id: Number(countryFilter) } : {},
      });
      const list = data.data?.data ?? data.data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch {
      setError('فشل جلب سجل الإشعارات');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [countryFilter]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

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
      await loadHistory();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setComposeError(err.response?.data?.message ?? 'تعذّر إرسال الإشعار.');
    } finally {
      setComposeBusy(false);
    }
  };

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>نظام التنبيهات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>سجل البث الفعلي عبر المنصة</p>
        </div>
        <button onClick={openComposer} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إرسال إشعار جديد</button>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      <div style={card({marginBottom:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12})}>
        <select value={countryFilter} onChange={e=>setCountryFilter(e.target.value)} style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:12,outline:'none',cursor:'pointer'}}>
          <option value="">كل الدول</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={loadHistory} style={{padding:'8px 14px',borderRadius:10,background:C.bg,color:C.sub,fontWeight:600,fontSize:12,border:`1px solid ${C.border}`,cursor:'pointer'}}>تحديث</button>
      </div>

      <div style={card({padding:0,overflow:'hidden'})}>
        {loading ? (
          <div style={{textAlign:'center',padding:'48px',color:C.sub,fontSize:14}}>جارٍ التحميل...</div>
        ) : rows.length===0 ? (
          <div style={{textAlign:'center',padding:'48px',color:C.sub,fontSize:14}}>
            <div style={{fontSize:48,marginBottom:12}}>🔔</div>
            <p style={{fontWeight:700}}>لا توجد إشعارات مرسلة</p>
            <p style={{fontSize:12,marginTop:6,color:C.dim}}>استخدم «إرسال إشعار جديد» لبث تنبيه عبر دولة.</p>
          </div>
        ) : (
          rows.map((n,i)=>(
            <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',borderBottom:i<rows.length-1?`1px solid ${C.border}`:'none'}}>
              <div style={{width:42,height:42,borderRadius:13,background:`${C.blue}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📢</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                  <p style={{color:C.text,fontWeight:800,fontSize:13.5}}>{n.title}</p>
                  {n.country && <span style={{padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:700,background:C.goldBg,color:C.gold}}>{n.country}</span>}
                </div>
                <p style={{color:C.sub,fontSize:12,lineHeight:1.5}}>{n.body}</p>
                <p style={{color:C.dim,fontSize:11,marginTop:6}}>
                  المستلمون: {n.recipients_count}
                  {n.sent_by ? ` · بواسطة ${n.sent_by.name}` : ''}
                  {n.target_type === 'role' && n.target_value ? ` · دور: ${n.target_value}` : ''}
                </p>
              </div>
              <span style={{color:C.dim,fontSize:11,flexShrink:0}}>{fmtTime(n.sent_at)}</span>
            </div>
          ))
        )}
      </div>

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
