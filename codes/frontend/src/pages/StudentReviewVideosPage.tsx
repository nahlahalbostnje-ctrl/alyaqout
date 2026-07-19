import { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

interface ReviewVideo {
  id: number;
  title: string;
  duration: number;
  completed: boolean;
  course_id: number | null;
  course_title: string | null;
  lesson_title: string | null;
  unit_title: string | null;
}

const C = {
  card: '#FFFFFF', gold: '#C9952A', goldL: '#DDAD50',
  goldGrad: 'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: 'rgba(0,0,0,0.07)',
  shadow: '0 2px 14px rgba(0,0,0,0.07)', green: '#16A34A',
};
const font = { fontFamily: "'Cairo', sans-serif" };

function fmtDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function StudentReviewVideosPage() {
  const [videos, setVideos] = useState<ReviewVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<{
    id: number; title: string; video_url: string; duration: number;
  } | null>(null);
  const [watchBusy, setWatchBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/student/review-videos');
      setVideos(data.videos ?? []);
    } catch {
      setError('تعذّر تحميل فيديوهات المراجعة');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleWatch(videoId: number) {
    setWatchBusy(true);
    try {
      const { data } = await api.get(`/student/videos/${videoId}/watch`);
      setActive({ id: videoId, title: data.title, video_url: data.video_url, duration: data.duration });
    } catch {
      setError('تعذّر فتح الفيديو');
    } finally {
      setWatchBusy(false);
    }
  }

  async function handleComplete() {
    if (!active) return;
    try {
      await api.post(`/student/videos/${active.id}/complete`);
      setVideos((prev) => prev.map((v) => (v.id === active.id ? { ...v, completed: true } : v)));
      setActive(null);
    } catch {
      setError('تعذّر تسجيل الإتمام');
    }
  }

  const doneCount = videos.filter((v) => v.completed).length;

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0D1535 0%,#1B2038 60%,#162144 100%)',
          padding: '28px 24px 32px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>مراجعة محمية</p>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0 }}>فيديوهات المراجعة</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '8px 0 0', maxWidth: 420 }}>
            راجع دروسك عبر فيديوهات مخصّصة من دوراتك — بدون تحميل مباشر
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{
              padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 700,
            }}>
              {videos.length} فيديو · {doneCount} مكتمل
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 20px 40px' }}>
          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 13,
            }}>{error}</div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', margin: '0 auto',
                border: '3px solid rgba(201,149,42,0.2)', borderTopColor: C.gold,
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : videos.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 48, background: C.card, borderRadius: 18,
              boxShadow: C.shadow, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎬</div>
              <p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: '0 0 6px' }}>لا توجد فيديوهات مراجعة</p>
              <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
                يظهر هنا المحتوى الذي يعلّمه أدمن بلدك كـ «فيديو مراجعة» ضمن دوراتك
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {videos.map((v) => (
                <div key={v.id} style={{
                  background: C.card, borderRadius: 16, padding: 16, boxShadow: C.shadow,
                  border: `1px solid ${C.border}`,
                  borderRight: v.completed ? `4px solid ${C.green}` : '4px solid transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        {v.course_title && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: 'rgba(201,149,42,0.1)', color: C.gold,
                          }}>{v.course_title}</span>
                        )}
                        {v.completed && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: 'rgba(22,163,74,0.1)', color: C.green,
                          }}>✓ مكتمل</span>
                        )}
                      </div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: C.text }}>{v.title}</h3>
                      <p style={{ margin: 0, fontSize: 12, color: C.sub }}>
                        {[v.unit_title, v.lesson_title].filter(Boolean).join(' · ')}
                        {v.duration > 0 ? ` · ${fmtDuration(v.duration)}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => void handleWatch(v.id)}
                      disabled={watchBusy}
                      style={{
                        flexShrink: 0, padding: '10px 16px', borderRadius: 12, border: 'none',
                        background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 12,
                        cursor: 'pointer', ...font, opacity: watchBusy ? 0.7 : 1,
                      }}
                    >
                      مشاهدة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {active && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.72)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            }}
            onClick={() => setActive(null)}
          >
            <div
              style={{
                width: '100%', maxWidth: 720, background: '#0D1535', borderRadius: 18,
                overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: 15, fontWeight: 800 }}>{active.title}</h3>
                <button onClick={() => setActive(null)} style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                  fontSize: 22, cursor: 'pointer', lineHeight: 1,
                }}>×</button>
              </div>
              <div
                style={{ background: '#000', aspectRatio: '16/9' }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <video
                  src={active.video_url}
                  controls
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  style={{ width: '100%', height: '100%', display: 'block' }}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              <div style={{ padding: 14, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setActive(null)} style={{
                  padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: 'rgba(255,255,255,0.7)', fontWeight: 700,
                  cursor: 'pointer', ...font,
                }}>إغلاق</button>
                <button onClick={() => void handleComplete()} style={{
                  padding: '10px 18px', borderRadius: 12, border: 'none',
                  background: C.goldGrad, color: '#1B2038', fontWeight: 800, cursor: 'pointer', ...font,
                }}>تمّت المشاهدة</button>
              </div>
            </div>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}
