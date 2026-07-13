import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchPackages } from '../features/admin/packagesSlice';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

export default function SAPlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly'|'yearly'>('monthly');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: packages, loading } = useAppSelector((s) => s.packages);

  useEffect(() => { dispatch(fetchPackages()); }, [dispatch]);

  const activeCount = packages.filter((p) => p.is_active).length;

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الخطط والاشتراكات</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة خطط وباقات منصة الياقوت</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 6px',borderRadius:12,background:C.bg,border:`1px solid ${C.border}`}}>
          {(['monthly','yearly'] as const).map(c=>(
            <button key={c} onClick={()=>setBillingCycle(c)} style={{padding:'7px 16px',borderRadius:10,border:'none',cursor:'pointer',fontSize:12.5,fontWeight:700,background:billingCycle===c?C.goldGrad:'transparent',color:billingCycle===c?'#1B2038':C.sub,transition:'all 0.15s'}}>
              {c==='monthly'?'شهري':'سنوي (-20%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats mini */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:22}}>
        {[
          {label:'إجمالي الباقات', value: loading ? '…' : String(packages.length), icon:'📦', color:C.green},
          {label:'الباقات النشطة', value: loading ? '…' : String(activeCount), icon:'✅', color:C.gold},
          {label:'اشتراكات نشطة', value:'—', icon:'💎', color:C.purple},
          {label:'تجديد هذا الشهر', value:'—', icon:'🔄', color:C.blue},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:12})}>
            <div style={{width:40,height:40,borderRadius:12,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
            <div>
              <p style={{color:C.text,fontWeight:900,fontSize:19}}>{s.value}</p>
              <p style={{color:C.sub,fontSize:11}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Cards from packages API */}
      {loading ? (
        <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>جاري التحميل...</p>
      ) : packages.length === 0 ? (
        <div style={card({marginBottom:22})}>
          <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:22}}>
          {packages.map((plan)=>(
            <div key={plan.id} style={card({padding:'22px',position:'relative',overflow:'hidden'})}>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{width:56,height:56,borderRadius:18,background:`${C.gold}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 12px'}}>📦</div>
                <p style={{color:C.gold,fontWeight:900,fontSize:16}}>{plan.name}</p>
                {!plan.is_active && (
                  <span style={{padding:'2px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:'rgba(0,0,0,0.06)',color:C.dim}}>معطّلة</span>
                )}
              </div>
              <div style={{textAlign:'center',marginBottom:18,padding:'14px 0',borderTop:`1px dashed ${C.border}`,borderBottom:`1px dashed ${C.border}`}}>
                <span style={{color:C.text,fontWeight:900,fontSize:30}}>
                  {billingCycle==='monthly'
                    ? Number(plan.price).toLocaleString()
                    : Math.floor(Number(plan.price)*12*0.8).toLocaleString()}
                </span>
                <span style={{color:C.sub,fontSize:12}}> ر.س / {billingCycle==='monthly'?'شهر':'سنة'}</span>
              </div>
              {plan.description && (
                <p style={{color:C.sub,fontSize:12,textAlign:'center',marginBottom:14,lineHeight:1.5}}>{plan.description}</p>
              )}
              <p style={{color:C.dim,fontSize:11,textAlign:'center',marginBottom:14}}>المدة: {plan.duration_days} يوم</p>
              <button onClick={()=>navigate('/dashboard/billing')} style={{width:'100%',padding:'11px',borderRadius:13,border:'none',cursor:'pointer',fontWeight:800,fontSize:13,background:C.goldGrad,color:'#1B2038',boxShadow:'0 4px 14px rgba(201,149,42,0.3)'}}>
                عرض المالية
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active subscriptions table */}
      <div style={card()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <p style={{color:C.text,fontWeight:800,fontSize:14}}>الاشتراكات النشطة</p>
          <button disabled title="غير متاح بعد" style={{color:C.dim,fontSize:11,fontWeight:600,border:'none',background:'none',cursor:'not-allowed',opacity:0.55}}>عرض الكل</button>
        </div>
        <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:560}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['الفرع / الدولة','الخطة','تاريخ الاشتراك','تاريخ التجديد','الحالة'].map((h,i)=>(
                <th key={i} style={{padding:'10px 12px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5}>
                <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </SuperAdminShell>
  );
}
