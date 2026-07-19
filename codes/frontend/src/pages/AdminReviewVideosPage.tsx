import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

interface ReviewVideoRow {
  id: number;
  title: string;
  video_url: string;
  duration: number;
  type: string;
  is_review: boolean;
  course_id: number | null;
  course_title: string | null;
  lesson_id: number | null;
  lesson_title: string | null;
  unit_title: string | null;
}

const DK = {
  gold: '#C9952A', goldL: '#DDAD50', dimTxt: '#6B7280',
  card: { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
};

function fmtDuration(secs: number): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AdminReviewVideosPage() {
  const [rows, setRows] = useState<ReviewVideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/review-videos');
      setRows(data.data ?? []);
    } catch {
      setError('تعذّر جلب فيديوهات المراجعة');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function removeFromReview(id: number) {
    setBusyId(id);
    try {
      await api.patch(`/admin/videos/${id}/review`, { is_review: false });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('تعذّر إزالة الفيديو من المراجعة');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }} dir="rtl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.65 }}>أدمن البلد</span>
          </div>
          <h1 className="text-2xl font-black m-0" style={{ color: '#1B2038' }}>فيديوهات المراجعة</h1>
          <p className="text-sm mt-1 m-0" style={{ color: DK.dimTxt }}>
            الفيديوهات المعلّمة كمراجعة من محتوى الدورات — عدّل العلامة من صفحة محتوى الكورس
          </p>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.2), transparent)' }} />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: DK.gold }} />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={DK.card}>
            <p className="font-bold text-base m-0 mb-2" style={{ color: '#1B2038' }}>لا توجد فيديوهات مراجعة بعد</p>
            <p className="text-sm m-0 mb-4" style={{ color: DK.dimTxt }}>
              من الدورات ← محتوى الكورس ← عند إضافة/تعديل فيديو فعّل «فيديو مراجعة»
            </p>
            <Link to="/admin/courses"
              className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}>
              الذهاب للدورات
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap" style={DK.card}>
                <div className="min-w-0">
                  <p className="font-bold text-sm m-0 mb-1" style={{ color: '#1B2038' }}>{r.title}</p>
                  <p className="text-xs m-0" style={{ color: DK.dimTxt }}>
                    {r.course_title ?? '—'} · {[r.unit_title, r.lesson_title].filter(Boolean).join(' · ') || '—'}
                    {' · '}{fmtDuration(r.duration)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.course_id != null && (
                    <Link
                      to={`/admin/courses/${r.course_id}/content`}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ color: DK.gold, border: '1px solid rgba(201,149,42,0.3)' }}
                    >
                      محتوى الكورس
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => void removeFromReview(r.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                    style={{ color: '#EF4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    {busyId === r.id ? '...' : 'إزالة من المراجعة'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
