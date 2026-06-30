import { useState } from 'react';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  navy:'#0D1E3A', card:'#fff', border:'#E8EDF5', sub:'#64748B',
  text:'#1E293B', goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.25)',
  shadow:'0 2px 8px rgba(13,30,58,0.06)', green:'#25D366',
};

const BRANCHES = [
  { city:'الرياض',    area:'حي النخيل',      phone:'0500000001', maps:'https://maps.google.com/?q=الرياض+حي+النخيل' },
  { city:'جدة',       area:'حي السلامة',      phone:'0500000002', maps:'https://maps.google.com/?q=جدة+حي+السلامة'  },
  { city:'الدمام',    area:'حي الشاطئ',       phone:'0500000003', maps:'https://maps.google.com/?q=الدمام+حي+الشاطئ' },
  { city:'مكة المكرمة','area':'حي العزيزية',  phone:'0500000004', maps:'https://maps.google.com/?q=مكة+العزيزية'    },
  { city:'المدينة المنورة', area:'حي قباء',    phone:'0500000005', maps:'https://maps.google.com/?q=المدينة+قباء'    },
];

export default function NearestBranchWidget() {
  const [open, setOpen] = useState(false);
  const [detected, setDetected] = useState(false);
  const [loading, setLoading] = useState(false);

  const detect = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDetected(true); }, 1200);
  };

  const nearest = BRANCHES[0]; // in production: sort by geolocation distance

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
            <div>
              <div style={{ background:C.goldBg, border:`1px solid ${C.goldBdr}`, borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <p style={{ color:C.navy, fontWeight:800, fontSize:15, marginBottom:2 }}>فرع {nearest.city}</p>
                    <p style={{ color:C.sub, fontSize:13 }}>📌 {nearest.area}</p>
                    <p style={{ color:C.sub, fontSize:12, marginTop:4 }}>📞 {nearest.phone}</p>
                  </div>
                  <span style={{ background:C.gold, color:'#fff', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>الأقرب</span>
                </div>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <a href={nearest.maps} target="_blank" rel="noreferrer"
                  style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', textDecoration:'none', textAlign:'center', fontFamily:"'Cairo',sans-serif" }}>
                  🗺️ خرائط جوجل
                </a>
                <a href={`https://wa.me/${nearest.phone.replace(/^0/, '966')}?text=مرحباً، أرغب في زيارة فرع ياقوت في ${nearest.city}`}
                  target="_blank" rel="noreferrer"
                  style={{ flex:1, padding:'11px', borderRadius:12, background:C.green, color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', textDecoration:'none', textAlign:'center', fontFamily:"'Cairo',sans-serif" }}>
                  💬 واتساب
                </a>
              </div>

              <div style={{ marginTop:14 }}>
                <p style={{ color:C.sub, fontSize:12, fontWeight:600, marginBottom:8 }}>جميع الفروع</p>
                {BRANCHES.slice(1).map((b, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderTop:`1px solid ${C.border}` }}>
                    <div>
                      <p style={{ color:C.text, fontWeight:600, fontSize:13 }}>{b.city} — {b.area}</p>
                      <p style={{ color:C.sub, fontSize:11 }}>{b.phone}</p>
                    </div>
                    <a href={`https://wa.me/${b.phone.replace(/^0/,'966')}?text=مرحباً ياقوت`} target="_blank" rel="noreferrer"
                      style={{ padding:'5px 12px', borderRadius:8, background:'rgba(37,211,102,0.1)', color:C.green, fontWeight:700, fontSize:12, textDecoration:'none', border:'1px solid rgba(37,211,102,0.25)' }}>
                      واتساب
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
