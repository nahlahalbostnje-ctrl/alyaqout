import { useState } from 'react';
import { C } from '../theme/palette';


export default function NearestBranchWidget() {
  const [open, setOpen] = useState(false);
  const [detected, setDetected] = useState(false);
  const [loading, setLoading] = useState(false);

  const detect = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDetected(true); }, 1200);
  };

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', boxShadow:C.shadow }}>
      <button onClick={() => setOpen(p => !p)}
        style={{ width:'100%', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:`linear-gradient(135deg,${C.navy},#162144)`, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>📍</span>
          <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>أقرب مقر ياقوت</span>
        </div>
        <span style={{ color:'rgba(255,255,255,0.6)', fontSize:18 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding:'16px' }}>
          {!detected ? (
            <div style={{ textAlign:'center', padding:'12px 0' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🗺️</div>
              <p style={{ color:C.sub, fontSize:13, marginBottom:14 }}>اضغط لإيجاد أقرب فرع ياقوت لموقعك</p>
              <button onClick={detect} disabled={loading}
                style={{ padding:'11px 24px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", opacity:loading?0.7:1 }}>
                {loading ? '⏳ جاري التحديد...' : '📍 تحديد موقعي'}
              </button>
            </div>
          ) : (
            <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد بيانات حالياً.</p>
          )}
        </div>
      )}
    </div>
  );
}
