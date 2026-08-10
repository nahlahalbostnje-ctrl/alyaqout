import AdminLayout from '../components/AdminLayout';
import ProfileEditPanel from '../components/ProfileEditPanel';
import { C } from '../theme/palette';

export default function AdminProfilePage() {
  return (
    <AdminLayout>
      <div style={{ padding: 24, maxWidth: 720, fontFamily: "'Cairo',sans-serif" }} dir="rtl">
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: '0 0 6px' }}>الملف الشخصي</h1>
        <p style={{ color: C.sub, fontSize: 13, margin: '0 0 18px' }}>تعديل بيانات حسابك في لوحة الإدارة</p>
        <ProfileEditPanel roleLabel="مدير دولة" showPassword />
      </div>
    </AdminLayout>
  );
}
