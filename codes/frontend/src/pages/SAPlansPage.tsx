import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const PLANS = [
  {
    id:'basic', name:'الأساسية', nameEn:'Basic', icon:'🌱', color:C.teal,
    price:'299', period:'شهرياً', branches:1, users:100, storage:'5 GB',
    features:['لوحة تحكم أساسية','5 دورات تدريبية','دعم بالبريد الإلكتروني','تقارير شهرية','تطبيق الجوال'],
    disabled:['الحصص المباشرة','مركز التطوير','API متقدمة','دعم مخصص'],
    active:5, badge:null, vip:false,
  },
  {
    id:'standard', name:'المتميزة', nameEn:'Standard', icon:'⭐', color:C.blue,
    price:'699', period:'شهرياً', branches:3, users:500, storage:'25 GB',
    features:['لوحة تحكم متكاملة','50 دورة تدريبية','حصص مباشرة','دعم فوري 24/7','تقارير تفصيلية','تطبيق الجوال','إشعارات ذكية'],
    disabled:['مركز التطوير','API متقدمة'],
    active:18, badge:'الأكثر طلباً', vip:false,
  },
  {
    id:'premium', name:'الاحترافية', nameEn:'Premium', icon:'🚀', color:C.purple,
    price:'1,299', period:'شهرياً', branches:10, users:2000, storage:'100 GB',
    features:['لوحة قيادة متقدمة','دورات غير محدودة','حصص مباشرة HD','دعم مخصص','تقارير وتحليلات AI','تطبيق الجوال المخصص','API أساسية','تخصيص الهوية البصرية'],
    disabled:['مركز التطوير الكامل'],
    active:12, badge:null, vip:false,
  },
  {
    id:'vip', name:'الياقوت VIP', nameEn:'Yaqoot VIP', icon:'💎', color:C.gold,
    price:'2,999', period:'شهرياً', branches:999, users:999999, storage:'غير محدود',
    features:['وصول كامل لكل الميزات','دورات ومحتوى غير محدود','خادم مخصص (Dedicated)','مدير حساب شخصي','تقارير وتحليلات متقدمة','تطبيق جوال مخصص بالكامل','API كاملة + Webhooks','مركز التطوير الكامل','SLA 99.99%','تدريب مجاني للكوادر'],
    disabled:[], active:7, badge:'الأفضل قيمة', vip:true,
  },
];

export default function SAPlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly'|'yearly'>('monthly');

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
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:22}}>
        {[
          {label:'إجمالي الاشتراكات النشطة',value:'42',icon:'✅',color:C.green},
          {label:'إيرادات الاشتراكات',        value:'184,550',icon:'💰',color:C.gold,suffix:'ر.س'},
          {label:'اشتراكات VIP',              value:'7',icon:'💎',color:C.purple},
          {label:'تجديد هذا الشهر',           value:'12',icon:'🔄',color:C.blue},
        ].map((s,i)=>(
          <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:12})}>
            <div style={{width:40,height:40,borderRadius:12,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
            <div>
              <p style={{color:C.text,fontWeight:900,fontSize:19}}>{s.value} {'suffix' in s?<span style={{fontSize:11,color:C.sub}}>{(s as {suffix:string}).suffix}</span>:null}</p>
              <p style={{color:C.sub,fontSize:11}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:22}}>
        {PLANS.map(plan=>(
          <div key={plan.id} style={{...card({padding:'22px',position:'relative',overflow:'hidden'}), ...(plan.vip?{border:`2px solid ${C.gold}`,boxShadow:`0 4px 24px rgba(201,149,42,0.2)`}:{})}}>
            {plan.badge&&(
              <div style={{position:'absolute',top:14,left:14,padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700,background:plan.id==='standard'?C.blue:C.goldGrad,color:plan.id==='standard'?'#fff':'#1B2038'}}>
                {plan.badge}
              </div>
            )}
            {plan.vip&&(
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(201,149,42,0.04),rgba(221,173,80,0.06))',pointerEvents:'none'}}/>
            )}
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:18,background:plan.vip?C.goldGrad:`${plan.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 12px'}}>{plan.icon}</div>
              <p style={{color:plan.vip?C.gold:plan.color,fontWeight:900,fontSize:16}}>{plan.name}</p>
              <p style={{color:C.dim,fontSize:11,marginTop:2}}>{plan.nameEn}</p>
            </div>
            <div style={{textAlign:'center',marginBottom:18,padding:'14px 0',borderTop:`1px dashed ${C.border}`,borderBottom:`1px dashed ${C.border}`}}>
              <span style={{color:C.text,fontWeight:900,fontSize:30}}>{billingCycle==='monthly'?plan.price:Math.floor(Number(plan.price.replace(',',''))*12*0.8).toLocaleString()}</span>
              <span style={{color:C.sub,fontSize:12}}> ر.س / {billingCycle==='monthly'?'شهر':'سنة'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:14,fontSize:11,color:C.sub}}>
              <span>🌍 {plan.branches===999?'غير محدود':plan.branches} فرع</span>
              <span>👥 {plan.users===999999?'غير محدود':plan.users.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:18}}>
              {plan.features.map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:7}}>
                  <span style={{color:C.green,fontSize:13,flexShrink:0}}>✓</span>
                  <span style={{color:C.text,fontSize:12}}>{f}</span>
                </div>
              ))}
              {plan.disabled.map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:7}}>
                  <span style={{color:C.dim,fontSize:13,flexShrink:0}}>✕</span>
                  <span style={{color:C.dim,fontSize:12}}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:12,color:C.sub,textAlign:'center',marginBottom:12}}>
              <span style={{color:plan.vip?C.gold:plan.color,fontWeight:700,fontSize:15}}>{plan.active}</span> اشتراك نشط حالياً
            </div>
            <button style={{width:'100%',padding:'11px',borderRadius:13,border:'none',cursor:'pointer',fontWeight:800,fontSize:13,background:plan.vip?C.goldGrad:plan.id==='standard'?C.blue:`${plan.color}18`,color:plan.vip?'#1B2038':plan.id==='standard'?'#fff':plan.color,boxShadow:plan.vip?'0 4px 14px rgba(201,149,42,0.3)':'none'}}>
              {plan.vip?'💎 إدارة خطة VIP':'إدارة الخطة'}
            </button>
          </div>
        ))}
      </div>

      {/* Active subscriptions table */}
      <div style={card()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <p style={{color:C.text,fontWeight:800,fontSize:14}}>الاشتراكات النشطة</p>
          <button style={{color:C.gold,fontSize:11,fontWeight:600,border:'none',background:'none',cursor:'pointer'}}>عرض الكل</button>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(0,0,0,0.03)'}}>
              {['الفرع / الدولة','الخطة','تاريخ الاشتراك','تاريخ التجديد','الحالة'].map((h,i)=>(
                <th key={i} style={{padding:'10px 12px',textAlign:'right',color:C.sub,fontSize:11,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {branch:'🇵🇸 فرع فلسطين',plan:'الياقوت VIP',planColor:C.gold,start:'2026-01-01',end:'2027-01-01',status:'نشط'},
              {branch:'🇸🇦 فرع السعودية',plan:'الاحترافية',planColor:C.purple,start:'2026-02-15',end:'2027-02-15',status:'نشط'},
              {branch:'🇪🇬 فرع مصر',    plan:'المتميزة',  planColor:C.blue,  start:'2026-03-01',end:'2027-03-01',status:'نشط'},
            ].map((s,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:'11px 12px',color:C.text,fontWeight:700,fontSize:13}}>{s.branch}</td>
                <td style={{padding:'11px 12px'}}><span style={{color:s.planColor,fontWeight:700,fontSize:12}}>{s.plan}</span></td>
                <td style={{padding:'11px 12px',color:C.sub,fontSize:12}}>{s.start}</td>
                <td style={{padding:'11px 12px',color:C.sub,fontSize:12}}>{s.end}</td>
                <td style={{padding:'11px 12px'}}><span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(22,163,74,0.12)',color:C.green}}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminShell>
  );
}
