import SupervisorLayout from '../components/SupervisorLayout';
import { C } from '../theme/palette';


export default function SupervisorAssignmentsPage() {
  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>غرف الواجبات</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>مراجعة واجبات الطلاب المشرف عليهم</p>
        </div>

        <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, padding:'56px 24px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
          <p style={{ color:C.text, fontSize:15, fontWeight:800, margin:'0 0 8px' }}>لا توجد واجبات للمراجعة حالياً</p>
          <p style={{ color:C.dim, fontSize:13, margin:0, maxWidth:420, marginInline:'auto', lineHeight:1.7 }}>
            ستظهر تسليمات الطلاب هنا عند تفعيل مسار مراجعة المشرف وربطه بواجبات المعلمين.
          </p>
        </div>
      </div>
    </SupervisorLayout>
  );
}
