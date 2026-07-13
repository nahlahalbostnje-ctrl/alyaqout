import { useState, useEffect, useCallback } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';
import { useToast } from '../components/Toast';
import { getApiError } from '../utils/apiError';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

type ContentStatus = 'pending'|'approved'|'rejected';
type ContentKind = 'exam'|'homework';

interface ContentItem {
  id: number;
  kind: ContentKind;
  title: string;
  course: string | null;
  country: string | null;
  teacher: string | null;
  status: ContentStatus;
  created_at: string | null;
  due_date?: string | null;
}

interface Meta {
  pending_exams: number;
  pending_homeworks: number;
  approved_exams: number;
  approved_homeworks: number;
  rejected_exams: number;
  rejected_homeworks: number;
}

const KIND_INFO = {
  exam:     { icon:'📝', label:'اختبار', color:C.purple },
  homework: { icon:'📚', label:'واجب',  color:C.orange },
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ar-EG');
  } catch {
    return iso.slice(0, 10);
  }
}

export default function SAContentApprovalsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'all'|ContentStatus>('pending');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [meta, setMeta] = useState<Meta>({
    pending_exams: 0, pending_homeworks: 0,
    approved_exams: 0, approved_homeworks: 0,
    rejected_exams: 0, rejected_homeworks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<ContentItem|null>(null);
  const [busyId, setBusyId] = useState<string|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = activeTab === 'all' ? 'all' : activeTab;
      const { data } = await api.get('/super-admin/approvals', { params: { status } });
      setItems(data.data ?? []);
      if (data.meta) setMeta(data.meta);
    } catch {
      setError('فشل جلب قائمة الاعتمادات');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const pendingTotal = meta.pending_exams + meta.pending_homeworks;
  const approvedTotal = meta.approved_exams + meta.approved_homeworks;
  const rejectedTotal = meta.rejected_exams + meta.rejected_homeworks;

  const decide = async (item: ContentItem, status: 'approved'|'rejected') => {
    const key = `${item.kind}-${item.id}`;
    setBusyId(key);
    try {
      const path = item.kind === 'exam'
        ? `/super-admin/approvals/exams/${item.id}`
        : `/super-admin/approvals/homeworks/${item.id}`;
      await api.patch(path, { status });
      setRejectModal(null);
      await load();
    } catch (err: unknown) {
      toast.error(getApiError(err, 'تعذّر تحديث حالة المحتوى'));
    } finally {
      setBusyId(null);
    }
  };

  const TABS:{key:'all'|ContentStatus;label:string;color:string}[] = [
    {key:'pending',label:`بانتظار الاعتماد (${pendingTotal})`,color:C.orange},
    {key:'approved',label:`معتمدة (${approvedTotal})`,color:C.green},
    {key:'rejected',label:`مرفوضة (${rejectedTotal})`,color:C.red},
    {key:'all',label:`الكل`,color:C.text},
  ];

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>المحتوى والاعتمادات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>اعتماد الامتحانات والواجبات عبر كل الدول</p>
        </div>
        {pendingTotal > 0 && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:12,background:'rgba(217,119,6,0.1)',border:'1px solid rgba(217,119,6,0.25)'}}>
            <span style={{fontSize:18}}>⚠️</span>
            <span style={{color:C.orange,fontWeight:700,fontSize:13}}>{pendingTotal} بانتظار المراجعة</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ ...card(), marginBottom:12, background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.25)`, color:C.red, fontSize:13, fontWeight:600 }}>
          {error}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:14}}>
        {[
          {label:'بانتظار الاعتماد',value:pendingTotal,icon:'⏳',color:C.orange},
          {label:'امتحانات معلّقة',value:meta.pending_exams,icon:'📝',color:C.purple},
          {label:'واجبات معلّقة',value:meta.pending_homeworks,icon:'📚',color:C.teal},
          {label:'معتمد',value:approvedTotal,icon:'✅',color:C.green},
          {label:'مرفوض',value:rejectedTotal,icon:'❌',color:C.red},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'12px',display:'flex',alignItems:'center',gap:10})}>
            <div style={{width:38,height:38,borderRadius:11,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{s.icon}</div>
            <div>
              <p style={{color:C.text,fontWeight:900,fontSize:18}}>{loading ? '…' : s.value}</p>
              <p style={{color:C.sub,fontSize:10.5}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:`1px solid ${C.border}`,paddingBottom:0,flexWrap:'wrap'}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:'9px 18px',border:'none',background:'transparent',cursor:'pointer',fontSize:12.5,fontWeight:700,color:activeTab===t.key?t.color:C.sub,borderBottom:activeTab===t.key?`2px solid ${t.color}`:'2px solid transparent'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={card({padding:0,overflowX:'auto'})}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:620}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['النوع','العنوان','الدورة','الدولة','المعلم','التاريخ','الحالة','إجراءات'].map((h,i)=>(
                <th key={i} style={{padding:'12px 14px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>جارٍ التحميل...</p></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8}><p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً</p></td></tr>
            ) : items.map((item,i)=>{
              const ti = KIND_INFO[item.kind];
              const busy = busyId === `${item.kind}-${item.id}`;
              return (
                <tr key={`${item.kind}-${item.id}`} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?'transparent':'rgba(0,0,0,0.015)'}}>
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:32,height:32,borderRadius:9,background:`${ti.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{ti.icon}</div>
                      <span style={{color:ti.color,fontSize:11,fontWeight:700}}>{ti.label}</span>
                    </div>
                  </td>
                  <td style={{padding:'12px 14px',color:C.text,fontWeight:700,fontSize:12.5,maxWidth:220}}>
                    <p style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</p>
                  </td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{item.course || '—'}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{item.country || '—'}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{item.teacher || '—'}</td>
                  <td style={{padding:'12px 14px',color:C.sub,fontSize:12}}>{fmtDate(item.created_at)}</td>
                  <td style={{padding:'12px 14px'}}>
                    {item.status==='pending'&&<span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(217,119,6,0.12)',color:C.orange}}>بانتظار الاعتماد</span>}
                    {item.status==='approved'&&<span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(22,163,74,0.12)',color:C.green}}>معتمد</span>}
                    {item.status==='rejected'&&<span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(239,68,68,0.12)',color:C.red}}>مرفوض</span>}
                  </td>
                  <td style={{padding:'12px 14px'}}>
                    {item.status==='pending'&&(
                      <div style={{display:'flex',gap:5}}>
                        <button disabled={busy} onClick={()=>decide(item,'approved')} title="اعتماد" style={{width:30,height:30,borderRadius:8,border:'none',background:'rgba(22,163,74,0.15)',color:C.green,cursor:'pointer',fontSize:14,fontWeight:700,opacity:busy?0.5:1}}>✓</button>
                        <button disabled={busy} onClick={()=>setRejectModal(item)} title="رفض" style={{width:30,height:30,borderRadius:8,border:'none',background:'rgba(239,68,68,0.12)',color:C.red,cursor:'pointer',fontSize:14,fontWeight:700,opacity:busy?0.5:1}}>✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rejectModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setRejectModal(null)}>
          <div style={{background:C.card,borderRadius:20,padding:28,width:440,maxWidth:'92vw'}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:C.text,fontWeight:900,fontSize:17,marginBottom:8}}>رفض المحتوى</h2>
            <p style={{color:C.sub,fontSize:13,marginBottom:16,lineHeight:1.6}}>
              هل تريد رفض «{rejectModal.title}»؟ سيتم إخفاؤه عن الطلاب.
            </p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>decide(rejectModal,'rejected')} style={{flex:1,padding:'11px',borderRadius:12,background:'linear-gradient(135deg,#DC2626,#EF4444)',color:'#fff',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>تأكيد الرفض</button>
              <button onClick={()=>setRejectModal(null)} style={{flex:1,padding:'11px',borderRadius:12,background:C.bg,color:C.sub,fontWeight:600,fontSize:13,border:`1px solid ${C.border}`,cursor:'pointer'}}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminShell>
  );
}
