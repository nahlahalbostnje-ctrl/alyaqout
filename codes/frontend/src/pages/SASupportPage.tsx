import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

export default function SASupportPage() {
  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>الدعم الفني</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>نظام تذاكر الدعم</p>
        </div>
        <button disabled title="غير متاح بعد" style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'not-allowed',opacity:0.55}}>+ فتح تذكرة جديدة</button>
      </div>

      <div style={card()}>
        <p style={{ textAlign:'center', color:'#6B7280', padding:48, fontWeight:700, fontSize:15 }}>لا توجد بيانات حالياً</p>
        <p style={{ textAlign:'center', color:'#9CA3AF', fontSize:13, marginTop:-32, paddingBottom:32 }}>سيتم تفعيل تذاكر الدعم عند بناء نظام التذاكر في الخادم.</p>
      </div>
    </SuperAdminShell>
  );
}
