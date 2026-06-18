import { useState } from 'react';
import api from '../services/axios';

const font = { fontFamily: "'Cairo', sans-serif" };

const SUBJECTS = [
  'رياضيات', 'فيزياء', 'كيمياء', 'أحياء', 'عربي', 'إنجليزي',
  'تاريخ', 'جغرافيا', 'تربية إسلامية', 'حاسوب', 'أخرى',
];

export default function EmergencyButton() {
  const [open, setOpen]       = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const reset = () => { setSubject(''); setMessage(''); setDone(false); setError(null); };

  const handleOpen = () => { reset(); setOpen(true); };
  const handleClose = () => { setOpen(false); reset(); };

  const handleSend = async () => {
    if (!subject) { setError('اختر المادة أولاً'); return; }
    setSending(true);
    setError(null);
    try {
      await api.post('/student/emergency', { subject, message: message || null });
      setDone(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        title="زر الطوارئ الدراسية"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: '#fff',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 4px 20px rgba(220,38,38,0.45)',
          ...font,
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="text-sm font-bold">طوارئ دراسية</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }} dir="rtl">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-black text-base" style={font}>زر الطوارئ الدراسية</p>
                    <p className="text-red-200 text-xs" style={font}>سيتواصل معك معلم مناوب فوراً</p>
                  </div>
                </div>
                <button onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition text-sm">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {done ? (
                /* Success State */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-black text-slate-800 text-lg mb-2" style={font}>تم إرسال طلبك!</p>
                  <p className="text-slate-500 text-sm mb-6" style={font}>
                    سيتواصل معك أحد المعلمين المناوبين في أقرب وقت ممكن عبر غرفة الواجبات
                  </p>
                  <button onClick={handleClose}
                    className="w-full bg-green-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-green-700 transition"
                    style={font}>
                    حسناً، شكراً!
                  </button>
                </div>
              ) : (
                /* Form */
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl" style={font}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block" style={font}>
                      المادة التي تحتاج مساعدة فيها <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => (
                        <button key={s} onClick={() => setSubject(s)}
                          className="text-xs px-3 py-1.5 rounded-xl border transition font-semibold"
                          style={{
                            ...font,
                            background: subject === s ? '#dc2626' : '#fff',
                            color:      subject === s ? '#fff'    : '#374151',
                            border:     subject === s ? '1px solid #dc2626' : '1px solid #e5e7eb',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block" style={font}>
                      وصف سريع للمشكلة (اختياري)
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="مثال: لا أفهم قانون أوم في الفيزياء..."
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                      style={font}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleSend} disabled={sending || !subject}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm text-white transition disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', ...font }}>
                      {sending ? 'جاري الإرسال...' : '🚨 إرسال طلب الطوارئ'}
                    </button>
                    <button onClick={handleClose}
                      className="px-5 py-3 rounded-2xl font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
                      style={font}>
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
