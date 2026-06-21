import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBroadcastHistory,
  sendBroadcast,
} from '../features/notifications/notificationsSlice';

const DK = {
  gold:   '#C9952A',
  goldL:  '#DDAD50',
  navy:   '#fff',
  dimTxt: '#6B7280',
};

const TARGET_TYPES = [
  { value: 'all',  label: 'الجميع (طلاب + معلمون + أولياء)' },
  { value: 'role', label: 'دور محدد' },
];

const ROLE_OPTIONS = [
  { value: 'student', label: 'الطلاب' },
  { value: 'teacher', label: 'المعلمون' },
  { value: 'parent',  label: 'أولياء الأمور' },
];

function TargetBadge({ type, value }: { type: string; value: string | null }) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    all:   { label: 'الجميع',     style: { background: 'rgba(201,149,42,0.08)', color: '#C9952A' } },
    role:  { label: value ?? '-', style: { background: 'rgba(96,165,250,0.12)', color: '#60a5fa' } },
    grade: { label: value ?? '-', style: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' } },
  };
  const meta = map[type] ?? { label: type, style: { background: '#F9FAFB', color: DK.dimTxt } };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={meta.style}>
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

  const [title, setTitle]             = useState('');
  const [body, setBody]               = useState('');
  const [targetType, setTargetType]   = useState('all');
  const [targetValue, setTargetValue] = useState('');
  const [sent, setSent]               = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchBroadcastHistory()); }, [dispatch]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await dispatch(sendBroadcast({
      title: title.trim(),
      body: body.trim(),
      target_type: targetType,
      target_value: targetType !== 'all' ? targetValue || null : null,
    }));
    setTitle(''); setBody(''); setTargetType('all'); setTargetValue('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    background: '#FFFFFF',
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  });

  return (
    <div className="p-6 space-y-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1B2038' }}>مركز الإشعارات</h1>
          <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>إرسال إشعارات جماعية للمستخدمين</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Send form */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #EDE3CE' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#fff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: '#1B2038' }}>إرسال إشعار</h2>
                <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>يصل فوراً لجميع المستهدفين</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSend} className="p-6 space-y-4">
            {sent && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#10B981' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm" style={{ color: '#10B981' }}>تم إرسال الإشعار بنجاح!</span>
              </div>
            )}

            {/* Target type */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: DK.dimTxt }}>المستهدفون</label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_TYPES.map((t) => (
                  <button key={t.value} type="button"
                    onClick={() => { setTargetType(t.value); setTargetValue(''); }}
                    className="text-sm py-2.5 px-3 rounded-xl transition-all text-center"
                    style={targetType === t.value
                      ? { background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.2)', color: DK.gold }
                      : { background: '#F9FAFB', border: '1px solid #EDE3CE', color: DK.dimTxt }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Role picker */}
            {targetType === 'role' && (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: DK.dimTxt }}>الدور</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button key={r.value} type="button" onClick={() => setTargetValue(r.value)}
                      className="text-sm py-2 px-2 rounded-xl transition-all"
                      style={targetValue === r.value
                        ? { background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }
                        : { background: '#F9FAFB', border: '1px solid #EDE3CE', color: DK.dimTxt }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: DK.dimTxt }}>عنوان الإشعار</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: إعلان هام" maxLength={200} required
                onFocus={() => setFocusedInput('title')} onBlur={() => setFocusedInput(null)}
                style={inputStyle('title')} />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: DK.dimTxt }}>نص الإشعار</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="اكتب رسالة الإشعار هنا..." maxLength={2000} rows={4} required
                onFocus={() => setFocusedInput('body')} onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('body'), resize: 'none' }} />
              <p className="text-xs mt-1 text-left" style={{ color: '#9CA3AF' }}>{body.length}/2000</p>
            </div>

            <button type="submit" disabled={broadcastSending || !title.trim() || !body.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
              {broadcastSending ? (
                <>
                  <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
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

        {/* Broadcast history */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EDE3CE' }}>
            <div>
              <h2 className="font-semibold" style={{ color: '#1B2038' }}>سجل الإشعارات المرسلة</h2>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{broadcastMeta.total} إشعار مرسل</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,149,42,0.08)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: DK.gold }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#F9FAFB' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#9CA3AF' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: DK.dimTxt }}>لا توجد إشعارات مرسلة بعد</p>
              </div>
            ) : (
              broadcasts.map((b) => (
                <div key={b.id} className="px-6 py-4 transition-colors"
                  style={{ borderBottom: '1px solid #EDE3CE' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: '#1B2038' }}>{b.title}</span>
                      <TargetBadge type={b.target_type} value={b.target_value} />
                    </div>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: DK.dimTxt }}>{b.body}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs" style={{ color: DK.dimTxt }}>{formatDate(b.sent_at)}</span>
                      {b.sent_by && (
                        <span className="text-xs" style={{ color: DK.dimTxt }}>بواسطة: {b.sent_by.name}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {b.recipients_count} مستلم
                      </span>
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
