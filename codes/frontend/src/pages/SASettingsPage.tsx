import { useState, useEffect } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const TABS = [
  {id:'platform', label:'معلومات المنصة', icon:'🏛️'},
  {id:'payment',  label:'بوابات الدفع',   icon:'💳'},
  {id:'branches', label:'الفروع والمناطق',icon:'🗺️'},
  {id:'api',      label:'الربط الخارجي',  icon:'🔗'},
];

const inputStyle = (focused:boolean) => ({
  width:'100%', padding:'10px 14px', borderRadius:11, fontSize:13, outline:'none',
  fontFamily:"'Cairo',sans-serif", color:C.text, boxSizing:'border-box' as const,
  border:`1.5px solid ${focused?C.gold:C.border}`, background:focused?'#FEFDF9':C.bg,
  transition:'border-color 0.2s',
});

function Field({label, value, placeholder='', type='text'}:{label:string;value:string;placeholder?:string;type?:string}) {
  const [v, setV] = useState(value);
  const [focus, setFocus] = useState(false);
  return (
    <div style={{marginBottom:16}}>
      <label style={{color:C.sub,fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>{label}</label>
      <input type={type} value={v} onChange={e=>setV(e.target.value)} placeholder={placeholder} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} style={inputStyle(focus)}/>
    </div>
  );
}

export default function SASettingsPage() {
  const [activeTab, setActiveTab] = useState('platform');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الإعدادات العامة</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة إعدادات منصة الياقوت</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',gap:16}}>
        {/* Vertical Tabs */}
        <div style={card({padding:'10px 8px'})}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'10px 12px',borderRadius:11,border:'none',cursor:'pointer',fontSize:12.5,fontWeight:activeTab===t.id?700:500,background:activeTab===t.id?C.goldGrad:'transparent',color:activeTab===t.id?'#1B2038':C.sub,textAlign:'right',marginBottom:3,transition:'all 0.15s'}}>
              <span style={{fontSize:15}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab==='platform'&&(
            <div style={card()}>
              <p style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:20}}>🏛️ معلومات المنصة</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:0}}>
                <div style={{paddingLeft:16}}>
                  <Field label="اسم المنصة" value="منصة الياقوت لخدمات التعليم"/>
                  <Field label="البريد الإلكتروني الرسمي" value="info@yaqoot.sa" type="email"/>
                  <Field label="رقم الهاتف" value="+966 11 234 5678"/>
                  <Field label="الموقع الإلكتروني" value="https://yaqoot.sa"/>
                </div>
                <div>
                  <Field label="عنوان المقر الرئيسي" value="الرياض، المملكة العربية السعودية"/>
                  <Field label="رقم السجل التجاري" value="1010XXXXXXX"/>
                  <div style={{marginBottom:16}}>
                    <label style={{color:C.sub,fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>وصف المنصة</label>
                    <textarea defaultValue="منصة الياقوت هي منصة تعليمية متكاملة تهدف إلى تقديم أفضل تجربة تعليمية رقمية." rows={3} style={{...inputStyle(false),resize:'none'}}/>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button disabled title="غير متاح بعد" style={{padding:'11px 24px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'not-allowed',opacity:0.55,boxShadow:'none'}}>💾 حفظ التغييرات</button>
                <button style={{padding:'11px 24px',borderRadius:12,background:C.bg,color:C.sub,fontWeight:600,fontSize:13,border:`1px solid ${C.border}`,cursor:'pointer'}}>إلغاء</button>
              </div>
            </div>
          )}

          {activeTab==='payment'&&(
            <div style={card()}>
              <p style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:20}}>💳 بوابات الدفع</p>
              {[
                {name:'Stripe', icon:'💳', color:'#635BFF', active:true, fields:[{l:'المفتاح العام (Public Key)',v:'pk_live_...'},{ l:'المفتاح الخاص (Secret Key)',v:'sk_live_...'}]},
                {name:'PayTabs',icon:'🏦', color:'#00A651', active:true, fields:[{l:'Profile ID',v:'12345'},{l:'Server Key',v:'XXXXXXXX'}]},
                {name:'Moyasar', icon:'💚', color:'#00C56C', active:false,fields:[{l:'API Key',v:''},{l:'Secret Key',v:''}]},
              ].map((gw,i)=>(
                <div key={i} style={{padding:'16px',borderRadius:14,border:`1px solid ${C.border}`,marginBottom:14,background:gw.active?'transparent':'rgba(0,0,0,0.02)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:gw.active?14:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:22}}>{gw.icon}</span>
                      <div>
                        <p style={{color:C.text,fontWeight:700,fontSize:14}}>{gw.name}</p>
                        <span style={{padding:'2px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:gw.active?'rgba(22,163,74,0.12)':'rgba(0,0,0,0.06)',color:gw.active?C.green:C.dim}}>{gw.active?'مفعّل':'معطّل'}</span>
                      </div>
                    </div>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                      <span style={{fontSize:12,color:C.sub}}>{gw.active?'تعطيل':'تفعيل'}</span>
                      <div style={{width:40,height:22,borderRadius:11,background:gw.active?C.green:'rgba(0,0,0,0.15)',position:'relative',transition:'background 0.2s'}}>
                        <div style={{width:16,height:16,borderRadius:'50%',background:'#fff',position:'absolute',top:3,right:gw.active?20:4,transition:'right 0.2s'}}/>
                      </div>
                    </label>
                  </div>
                  {gw.active&&gw.fields.map((f,j)=><Field key={j} label={f.l} value={f.v} type="password"/>)}
                </div>
              ))}
            </div>
          )}

          {activeTab==='branches'&&(
            <div style={card()}>
              <p style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:20}}>🗺️ الفروع والمناطق</p>
              {['الرياض','جدة','الدمام','مكة المكرمة','المدينة المنورة','الطائف','أبها'].map((city,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:12,border:`1px solid ${C.border}`,marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:20}}>🏙️</span>
                    <div>
                      <p style={{color:C.text,fontWeight:700,fontSize:13}}>{city}</p>
                      <p style={{color:C.sub,fontSize:11}}>{Math.floor(Math.random()*8+1)} مدارس</p>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button disabled title="غير متاح بعد" style={{padding:'6px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:'transparent',color:C.dim,fontSize:12,cursor:'not-allowed',opacity:0.55}}>تعديل</button>
                    <button disabled title="غير متاح بعد" style={{padding:'6px 14px',borderRadius:9,border:'none',background:C.goldBg,color:C.gold,fontSize:12,fontWeight:700,cursor:'not-allowed',opacity:0.55}}>إدارة</button>
                  </div>
                </div>
              ))}
              <button disabled title="غير متاح بعد" style={{width:'100%',padding:'11px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'not-allowed',opacity:0.55,marginTop:8}}>+ إضافة منطقة جديدة</button>
            </div>
          )}

          {activeTab==='api'&&(
            <div style={card()}>
              <p style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:20}}>🔗 الربط الخارجي</p>
              {[
                {name:'Google Analytics', icon:'📊', status:'متصل',   key:'UA-XXXXXXXX-X'},
                {name:'Firebase',         icon:'🔥', status:'متصل',   key:'AIzaSyXXXXXXXXXX'},
                {name:'Agora SDK',        icon:'🎥', status:'متصل',   key:'xxxxxxxx...'},
                {name:'Twilio SMS',       icon:'📱', status:'غير متصل',key:''},
                {name:'SendGrid Email',   icon:'📧', status:'متصل',   key:'SG.XXXXXXXXX'},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'14px',borderRadius:13,border:`1px solid ${C.border}`,marginBottom:10}}>
                  <span style={{fontSize:22,flexShrink:0}}>{s.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <p style={{color:C.text,fontWeight:700,fontSize:13}}>{s.name}</p>
                      <span style={{padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:s.status==='متصل'?'rgba(22,163,74,0.12)':'rgba(239,68,68,0.1)',color:s.status==='متصل'?C.green:C.red}}>{s.status}</span>
                    </div>
                    {s.key&&<p style={{color:C.dim,fontSize:11,fontFamily:'monospace'}}>{s.key.substring(0,20)}...</p>}
                  </div>
                  <button disabled title="غير متاح بعد" style={{padding:'7px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:'transparent',color:C.dim,fontSize:12,cursor:'not-allowed',opacity:0.55,flexShrink:0}}>{s.status==='متصل'?'إعادة الضبط':'ربط'}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SuperAdminShell>
  );
}
