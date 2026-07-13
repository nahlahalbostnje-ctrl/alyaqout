import ParentLayout from '../components/ParentLayout';

export default function ParentCounselingPage() {
  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily:"'Cairo',sans-serif", padding:24 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:'linear-gradient(135deg,#C59341,#D4A65A)' }} />
            <h1 style={{ color:'#1B2038', fontWeight:900, fontSize:22, margin:0 }}>طلب جلسة إرشاد</h1>
          </div>
          <p style={{ color:'#6B7280', fontSize:13, margin:0 }}>احجز جلسة مع المرشدين والمستشارين التربويين لمتابعة أبنائك</p>
        </div>
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#6B7280' }}>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>لا توجد بيانات حالياً</p>
          <p style={{ fontSize:13 }}>سيتم تفعيل هذا القسم عند توفر البيانات من النظام.</p>
        </div>
      </div>
    </ParentLayout>
  );
}
