import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBroadcastHistory,
  sendBroadcast,
} from '../features/notifications/notificationsSlice';

const TARGET_TYPES = [
  { value: 'all',     label: 'الجميع (طلاب + معلمون + أولياء)' },
  { value: 'role',    label: 'دور محدد' },
];

const ROLE_OPTIONS = [
  { value: 'student', label: 'الطلاب' },
  { value: 'teacher', label: 'المعلمون' },
  { value: 'parent',  label: 'أولياء الأمور' },
];

function TargetBadge({ type, value }: { type: string; value: string | null }) {
  const map: Record<string, { label: string; color: string }> = {
    all:     { label: 'الجميع',      color: 'bg-teal-500/20 text-teal-300' },
    role:    { label: value ?? '-',  color: 'bg-indigo-500/20 text-indigo-300' },
    grade:   { label: value ?? '-',  color: 'bg-amber-500/20 text-amber-300' },
  };
  const meta = map[type] ?? { label: type, color: 'bg-gray-500/20 text-gray-300' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminNotificationsPage() {
  const dispatch = useAppDispatch();
  const { broadcasts, broadcastMeta, broadcastSending } = useAppSelector((s) => s.notifications);

  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [targetType, setTargetType]   = useState('all');
  const [targetValue, setTargetValue] = useState('');
  const [sent, setSent]           = useState(false);

  useEffect(() => {
    dispatch(fetchBroadcastHistory());
  }, [dispatch]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    await dispatch(sendBroadcast({
      title: title.trim(),
      body: body.trim(),
      target_type: targetType,
      target_value: targetType !== 'all' ? targetValue || null : null,
    }));

    setTitle('');
    setBody('');
    setTargetType('all');
    setTargetValue('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مركز الإشعارات</h1>
        <p className="text-gray-500 text-sm mt-1">إرسال إشعارات جماعية للمستخدمين</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Send form ── */}
        <div className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0d1f2d 0%, #0f3460 100%)' }}>

          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold">إرسال إشعار</h2>
                <p className="text-white/40 text-xs">يصل فوراً لجميع المستهدفين</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSend} className="p-6 space-y-4">

            {/* Success flash */}
            {sent && (
              <div className="flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-teal-300 text-sm">تم إرسال الإشعار بنجاح!</span>
              </div>
            )}

            {/* Target type */}
            <div>
              <label className="block text-white/60 text-xs mb-1.5">المستهدفون</label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setTargetType(t.value); setTargetValue(''); }}
                    className={`text-sm py-2.5 px-3 rounded-xl border transition-all text-center ${
                      targetType === t.value
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Role picker */}
            {targetType === 'role' && (
              <div>
                <label className="block text-white/60 text-xs mb-1.5">الدور</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setTargetValue(r.value)}
                      className={`text-sm py-2 px-2 rounded-xl border transition-all ${
                        targetValue === r.value
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/10 text-white/50 hover:border-white/20'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-white/60 text-xs mb-1.5">عنوان الإشعار</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: إعلان هام"
                maxLength={200}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-white/60 text-xs mb-1.5">نص الإشعار</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="اكتب رسالة الإشعار هنا..."
                maxLength={2000}
                rows={4}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-teal-500 transition resize-none"
              />
              <p className="text-white/20 text-xs mt-1 text-left">{body.length}/2000</p>
            </div>

            <button
              type="submit"
              disabled={broadcastSending || !title.trim() || !body.trim()}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              {broadcastSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  إرسال الإشعار
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Broadcast history ── */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">

          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-gray-800 font-semibold">سجل الإشعارات المرسلة</h2>
              <p className="text-gray-400 text-xs mt-0.5">{broadcastMeta.total} إشعار مرسل</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50">
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">لا توجد إشعارات مرسلة بعد</p>
              </div>
            ) : (
              broadcasts.map((b) => (
                <div key={b.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-800 font-medium text-sm">{b.title}</span>
                        <TargetBadge type={b.target_type} value={b.target_value} />
                      </div>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{b.body}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-gray-400 text-xs">{formatDate(b.sent_at)}</span>
                        {b.sent_by && (
                          <span className="text-gray-400 text-xs">بواسطة: {b.sent_by.name}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-teal-600">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {b.recipients_count} مستلم
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
