import ParentLayout from '../components/ParentLayout';
import ProfileEditPanel from '../components/ProfileEditPanel';
import { C } from '../theme/palette';

export default function ParentSettingsPage() {
  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding: 24, fontFamily: "'Cairo',sans-serif", maxWidth: 720 }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>الملف الشخصي والإعدادات</h1>
          <p style={{ color: C.sub, fontSize: 13, margin: '6px 0 0' }}>تعديل بياناتك وإضافة صورة شخصية</p>
        </div>
        <ProfileEditPanel roleLabel="ولي أمر" showPassword />
      </div>
    </ParentLayout>
  );
}
