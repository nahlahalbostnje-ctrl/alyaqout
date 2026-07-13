import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchUnits, addUnit, deleteUnit,
  fetchLessons, addLesson, deleteLesson,
  fetchVideos, addVideo, deleteVideo,
  clearContent,
} from '../features/admin/courseContentSlice';

type ContentType = 'video' | 'pdf' | 'attachment';

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
  inputStyle: {
    background: '#FFFFFF',
    border: '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties,
};

const TYPE_LABELS: Record<ContentType, string> = { video: 'فيديو', pdf: 'PDF', attachment: 'مرفق' };

function TypeIcon({ type }: { type: ContentType }) {
  if (type === 'pdf') return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
  if (type === 'attachment') return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function fmtDuration(secs: number): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const cId = Number(courseId);
  const dispatch = useAppDispatch();
  const { units, lessons, videos, loading, saving } = useAppSelector((s) => s.courseContent);

  const [openUnits, setOpenUnits]     = useState<Set<number>>(new Set());
  const [openLessons, setOpenLessons] = useState<Set<number>>(new Set());

  const [unitModal, setUnitModal]     = useState(false);
  const [unitTitle, setUnitTitle]     = useState('');

  const [lessonModal, setLessonModal] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');

  const [videoModal, setVideoModal]   = useState<number | null>(null);
  const [videoForm, setVideoForm]     = useState({ title: '', video_url: '', type: 'video' as ContentType, duration: '' });
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: 'unit'; id: number; label: string; courseId: number }
    | { kind: 'lesson'; id: number; label: string; unitId: number }
    | { kind: 'video'; id: number; label: string; lessonId: number }
    | null
  >(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  useEffect(() => {
    dispatch(clearContent());
    dispatch(fetchUnits(cId));
  }, [dispatch, cId]);

  function toggleUnit(id: number) {
    const next = new Set(openUnits);
    if (next.has(id)) { next.delete(id); }
    else { next.add(id); if (!lessons[id]) dispatch(fetchLessons(id)); }
    setOpenUnits(next);
  }

  function toggleLesson(id: number) {
    const next = new Set(openLessons);
    if (next.has(id)) { next.delete(id); }
    else { next.add(id); if (!videos[id]) dispatch(fetchVideos(id)); }
    setOpenLessons(next);
  }


  async function confirmPendingDelete() {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      if (pendingDelete.kind === 'unit') {
        await dispatch(deleteUnit({ courseId: pendingDelete.courseId, unitId: pendingDelete.id }));
      } else if (pendingDelete.kind === 'lesson') {
        await dispatch(deleteLesson({ unitId: pendingDelete.unitId, lessonId: pendingDelete.id }));
      } else {
        await dispatch(deleteVideo({ lessonId: pendingDelete.lessonId, videoId: pendingDelete.id }));
      }
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر الحذف');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!unitTitle.trim()) return;
    await dispatch(addUnit({ courseId: cId, title: unitTitle.trim() }));
    setUnitTitle('');
    setUnitModal(false);
  }

  async function handleAddLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonTitle.trim() || lessonModal === null) return;
    await dispatch(addLesson({ unitId: lessonModal, title: lessonTitle.trim() }));
    setLessonTitle('');
    setLessonModal(null);
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.video_url.trim() || videoModal === null) return;
    await dispatch(addVideo({
      lessonId: videoModal,
      title: videoForm.title.trim(),
      video_url: videoForm.video_url.trim(),
      type: videoForm.type,
      duration: videoForm.duration ? parseInt(videoForm.duration) * 60 : 0,
    }));
    setVideoForm({ title: '', video_url: '', type: 'video', duration: '' });
    setVideoModal(null);
  }

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }} dir="rtl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.65 }}>إدارة المحتوى</span>
              </div>
              <h1 className="text-2xl font-black" style={{ color: '#1B2038' }}>محتوى الكورس</h1>
              <p className="text-sm mt-1" style={{ color: DK.dimTxt }}>إدارة الوحدات والدروس والمحتوى</p>
            </div>
            <button
              onClick={() => setUnitModal(true)}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff', boxShadow: '0 4px 18px rgba(201,149,42,0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              إضافة وحدة
            </button>
          </div>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,149,42,0.2), transparent)' }} />
        </div>

        {/* Content tree */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: DK.gold }} />
          </div>
        ) : units.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid #EDE3CE' }}>
              <svg className="w-8 h-8" fill="none" stroke="rgba(201,149,42,0.4)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: DK.dimTxt }}>لا توجد وحدات بعد — أضف الوحدة الأولى</p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit, uIdx) => (
              <div key={unit.id} className="rounded-2xl overflow-hidden" style={DK.card}>
                {/* Unit row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors"
                  onClick={() => toggleUnit(unit.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                    >
                      {uIdx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#1B2038' }}>{unit.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{unit.lessons_count} درس</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setLessonModal(unit.id); if (!openUnits.has(unit.id)) toggleUnit(unit.id); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-80"
                      style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      + درس
                    </button>
                    <button
                      onClick={() => { setDeleteError(null); setPendingDelete({ kind: 'unit', id: unit.id, label: unit.title, courseId: cId }); }}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg transition hover:opacity-80"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
                    >
                      حذف
                    </button>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openUnits.has(unit.id) ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="rgba(201,149,42,0.5)" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Lessons */}
                {openUnits.has(unit.id) && (
                  <div style={{ borderTop: '1px solid #EDE3CE', background: '#F9FAFB' }}>
                    {(lessons[unit.id] ?? []).length === 0 ? (
                      <p className="text-center py-5 text-xs" style={{ color: DK.dimTxt }}>لا توجد دروس</p>
                    ) : (
                      (lessons[unit.id] ?? []).map((lesson, lIdx) => (
                        <div key={lesson.id} style={{ borderBottom: '1px solid #EDE3CE' }}>
                          <div
                            className="flex items-center justify-between px-8 py-3.5 cursor-pointer transition-colors"
                            onClick={() => toggleLesson(lesson.id)}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs w-5 text-center flex-shrink-0" style={{ color: DK.dimTxt }}>
                                {lIdx + 1}
                              </span>
                              <svg
                                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${openLessons.has(lesson.id) ? 'rotate-90' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="rgba(201,149,42,0.5)" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-sm font-semibold" style={{ color: '#1B2038' }}>{lesson.title}</span>
                              <span className="text-xs" style={{ color: DK.dimTxt }}>({lesson.videos_count} محتوى)</span>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setVideoModal(lesson.id); if (!openLessons.has(lesson.id)) toggleLesson(lesson.id); }}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                                style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.15)' }}
                              >
                                + محتوى
                              </button>
                              <button
                                onClick={() => { setDeleteError(null); setPendingDelete({ kind: 'lesson', id: lesson.id, label: lesson.title, unitId: unit.id }); }}
                                className="text-xs font-bold px-2 py-1 rounded-lg transition hover:opacity-80"
                                style={{ color: '#EF4444' }}
                              >
                                حذف
                              </button>
                            </div>
                          </div>

                          {/* Videos */}
                          {openLessons.has(lesson.id) && (
                            <div className="px-14 py-2 space-y-1">
                              {(videos[lesson.id] ?? []).length === 0 ? (
                                <p className="text-xs py-2" style={{ color: DK.dimTxt }}>لا يوجد محتوى</p>
                              ) : (
                                (videos[lesson.id] ?? []).map((v) => (
                                  <div
                                    key={v.id}
                                    className="flex items-center justify-between py-2 px-3 rounded-xl group transition-colors"
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <TypeIcon type={v.type} />
                                      <span className="text-sm" style={{ color: '#1B2038' }}>{v.title}</span>
                                      {v.duration > 0 && (
                                        <span className="text-xs dir-ltr" style={{ color: DK.dimTxt }}>{fmtDuration(v.duration)}</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => { setDeleteError(null); setPendingDelete({ kind: 'video', id: v.id, label: v.title, lessonId: lesson.id }); }}
                                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                      style={{ color: '#EF4444' }}
                                    >
                                      حذف
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Unit */}
      {unitModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          dir="rtl"
          onClick={() => setUnitModal(false)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: '#1B2038' }}>إضافة وحدة جديدة</h3>
              <button onClick={() => setUnitModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none transition-all hover:bg-black/5"
                style={{ color: DK.dimTxt }}>×</button>
            </div>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <input
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="اسم الوحدة (مثال: الوحدة الأولى — المقدمة)"
                autoFocus
                style={DK.inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving || !unitTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setUnitModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {lessonModal !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          dir="rtl"
          onClick={() => setLessonModal(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: '#1B2038' }}>إضافة درس</h3>
              <button onClick={() => setLessonModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none transition-all hover:bg-black/5"
                style={{ color: DK.dimTxt }}>×</button>
            </div>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="اسم الدرس"
                autoFocus
                style={DK.inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving || !lessonTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setLessonModal(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Video/Content */}
      {videoModal !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          dir="rtl"
          onClick={() => setVideoModal(null)}
        >
          <div
            className="w-full max-w-lg p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: '#1B2038' }}>إضافة محتوى</h3>
              <button onClick={() => setVideoModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none transition-all hover:bg-black/5"
                style={{ color: DK.dimTxt }}>×</button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'pdf', 'attachment'] as ContentType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setVideoForm({ ...videoForm, type: t })}
                    className="py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={videoForm.type === t
                      ? { background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }
                      : { background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }
                    }
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              <input
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="عنوان المحتوى"
                style={DK.inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
              />
              <input
                value={videoForm.video_url}
                onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                placeholder="رابط الفيديو / الملف"
                dir="ltr"
                style={DK.inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
              />
              {videoForm.type === 'video' && (
                <input
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                  placeholder="المدة بالدقائق (اختياري)"
                  type="number"
                  min="0"
                  dir="ltr"
                  style={DK.inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#C9952A')}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE3CE')}
                />
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving || !videoForm.title.trim() || !videoForm.video_url.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: '#fff' }}
                >
                  {saving ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setVideoModal(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </AdminLayout>
  );
}
