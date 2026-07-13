import { useState, useEffect } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const TABS = [
  {id:'platform', label:'معلومات المنصة', icon:'🏛️'},
  {id:'payment',  label:'بوابات الدفع',   icon:'💳'},
  {id:'branches', label:'الفروع والمناطق',icon:'🗺️'},
  {id:'api',      label:'الربط الخارجي',  icon:'🔗'},
];

export default function SASettingsPage() {
  const [activeTab, setActiveTab] = useState('platform');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const empty = (title: string, hint: string) => (
    <div style={card()}>
      <p style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:12}}>{title}</p>
      <p style={{ textAlign:'center', color:'#6B7280', padding:40, fontSize:13 }}>{hint}</p>
    </div>
  );

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الإعدادات العامة</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة إعدادات منصة الياقوت</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',gap:16}}>
        <div style={card({padding:'10px 8px'})}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'10px 12px',borderRadius:11,border:'none',cursor:'pointer',fontSize:12.5,fontWeight:activeTab===t.id?700:500,background:activeTab===t.id?C.goldGrad:'transparent',color:activeTab===t.id?'#1B2038':C.sub,textAlign:'right',marginBottom:3}}>
              <span style={{fontSize:15}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab==='platform' && empty('🏛️ معلومات المنصة', 'حفظ إعدادات المنصة العامة غير متاح بعد — لا تُعرض بيانات وهمية.')}
          {activeTab==='payment' && empty('💳 بوابات الدفع', 'لا توجد بوابات دفع مُعدّة من هذه الواجهة حالياً.')}
          {activeTab==='branches' && empty('🗺️ الفروع والمناطق', 'إدارة المناطق عبر السوبر أدمن غير متاحة بعد — استخدم صفحة الأفرع أو لوحة أدمن كل دولة.')}
          {activeTab==='api' && empty('🔗 الربط الخارجي', 'لا توجد تكاملات مُعدّة من واجهة السوبر أدمن حالياً.')}
        </div>
      </div>
    </SuperAdminShell>
  );
}
