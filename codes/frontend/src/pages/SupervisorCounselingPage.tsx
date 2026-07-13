import SupervisorLayout from '../components/SupervisorLayout';

export default function SupervisorCounselingPage() {
  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ color:'#1B2038', fontWeight:900, fontSize:22, margin:0 }}>جلسات الإرشاد</h1>
          <p style={{ color:'#6B7280', fontSize:13, marginTop:4 }}>جلسات الإرشاد المباشر مع أولياء الأمور والطلاب</p>
        </div>
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#6B7280', background:'#fff', borderRadius:18, border:'1px solid #EDE3CE' }}>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>لا توجد بيانات حالياً</p>
          <p style={{ fontSize:13 }}>سيتم تفعيل غرف الإرشاد عند ربطها بخدمة البث.</p>
        </div>
      </div>
    </SupervisorLayout>
  );
}
