import SuperAdminShell, { C } from '../components/SuperAdminShell';
import ProfileEditPanel from '../components/ProfileEditPanel';

export default function SuperAdminProfilePage() {
  return (
    <SuperAdminShell>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>الملف الشخصي</h1>
        <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>إدارة بيانات حسابك الشخصي</p>
      </div>
      <ProfileEditPanel
        roleLabel="سوبر أدمن"
        showPassword={false}
        authHint="تسجيل الدخول يتم عبر رمز OTP على واتساب — لا توجد كلمة مرور. تأكد من صحة رقم الهاتف."
      />
    </SuperAdminShell>
  );
}
