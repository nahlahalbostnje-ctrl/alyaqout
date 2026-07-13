import StudentLayout from '../components/StudentLayout';

export default function StudentStudy24Page() {
  return (
    <StudentLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:'linear-gradient(135deg,#C59341,#D4A65A)' }} />
            <h1 style={{ color:'#1B2038', fontWeight:900, fontSize:22, margin:0 }}>غرفة الدراسة 24/7</h1>
          </div>
          <p style={{ color:'#6B7280', fontSize:13, margin:0 }}>دعم مباشر من معلمين متخصصين في أي وقت</p>
        </div>
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#6B7280' }}>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>لا توجد بيانات حالياً</p>
          <p style={{ fontSize:13 }}>سيتم تفعيل هذا القسم عند توفر البيانات من النظام.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
