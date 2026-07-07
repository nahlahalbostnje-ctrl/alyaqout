import { useState, useEffect } from 'react';

const STORAGE_KEY = 'yaqoot_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{ position: 'fixed', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 50, padding: 16 }}
      dir="rtl"
    >
      <div style={{
        maxWidth: 672, margin: '0 auto', background: '#fff', border: '1px solid #E5E7EB',
        borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>نستخدم ملفات تعريف الارتباط (Cookies)</p>
          <p style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع. بالنقر على «قبول» توافق على سياسة الخصوصية الخاصة بنا.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={accept}
            style={{
              flex: 1, minHeight: 44, padding: '10px 20px', background: '#9333ea', color: '#fff',
              fontSize: 13.5, fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            قبول
          </button>
          <button
            onClick={decline}
            style={{
              flex: 1, minHeight: 44, padding: '10px 20px', background: '#fff', color: '#4b5563',
              fontSize: 13.5, fontWeight: 700, borderRadius: 12, border: '1px solid #E5E7EB', cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            رفض
          </button>
        </div>
      </div>
    </div>
  );
}
