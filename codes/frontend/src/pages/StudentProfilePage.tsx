import StudentLayout from '../components/StudentLayout';
import ProfileEditPanel from '../components/ProfileEditPanel';
import { ST } from '../theme/studentTheme';

export default function StudentProfilePage() {
  return (
    <StudentLayout>
      <div style={{ padding: 20, maxWidth: 720, margin: '0 auto', fontFamily: ST.font }} dir="rtl">
        <h1 style={{ color: ST.navy, fontWeight: 900, fontSize: 20, margin: '0 0 6px' }}>الملف الشخصي</h1>
        <p style={{ color: ST.sub, fontSize: 13, margin: '0 0 18px' }}>تعديل بياناتك وإضافة صورة شخصية</p>
        <ProfileEditPanel
          roleLabel="طالب"
          showPassword
          authHint="يمكنك تسجيل الدخول برقم الهاتف عبر OTP أو بالبريد وكلمة المرور إن وُجدت."
        />
      </div>
    </StudentLayout>
  );
}
