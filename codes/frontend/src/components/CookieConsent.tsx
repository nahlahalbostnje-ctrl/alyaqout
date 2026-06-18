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
      className="fixed bottom-0 inset-x-0 z-50 p-4"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 mb-1">نستخدم ملفات تعريف الارتباط (Cookies)</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع. بالنقر على «قبول» توافق على سياسة الخصوصية الخاصة بنا.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition"
          >
            قبول
          </button>
          <button
            onClick={decline}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            رفض
          </button>
        </div>
      </div>
    </div>
  );
}
