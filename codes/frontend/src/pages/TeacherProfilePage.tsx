import TeacherLayout from '../components/TeacherLayout';
import ProfileEditPanel from '../components/ProfileEditPanel';
import { C } from '../theme/palette';

export default function TeacherProfilePage() {
  return (
    <TeacherLayout>
      <div style={{ padding: 24, maxWidth: 720, fontFamily: "'Cairo',sans-serif" }} dir="rtl">
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: '0 0 6px' }}>الملف الشخصي</h1>
        <p style={{ color: C.sub, fontSize: 13, margin: '0 0 18px' }}>تعديل بياناتك وإضافة صورة شخصية</p>
        <ProfileEditPanel roleLabel="معلم" showPassword />
      </div>
    </TeacherLayout>
  );
}
