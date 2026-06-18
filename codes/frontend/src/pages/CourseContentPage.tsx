import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchUnits, addUnit, deleteUnit,
  fetchLessons, addLesson, deleteLesson,
  fetchVideos, addVideo, deleteVideo,
  clearContent,
} from '../features/admin/courseContentSlice';

type ContentType = 'video' | 'pdf' | 'attachment';

function TypeIcon({ type }: { type: ContentType }) {
  if (type === 'pdf') return (
    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
  if (type === 'attachment') return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
  return (
    <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

  // expanded sets
  const [openUnits, setOpenUnits]     = useState<Set<number>>(new Set());
  const [openLessons, setOpenLessons] = useState<Set<number>>(new Set());

  // modals
  const [unitModal, setUnitModal]     = useState(false);
  const [unitTitle, setUnitTitle]     = useState('');

  const [lessonModal, setLessonModal] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');

  const [videoModal, setVideoModal]   = useState<number | null>(null);
  const [videoForm, setVideoForm]     = useState({ title: '', video_url: '', type: 'video' as ContentType, duration: '' });

  useEffect(() => {
    dispatch(clearContent());
    dispatch(fetchUnits(cId));
  }, [dispatch, cId]);

  function toggleUnit(id: number) {
    const next = new Set(openUnits);
    if (next.has(id)) { next.delete(id); }
    else {
      next.add(id);
      if (!lessons[id]) dispatch(fetchLessons(id));
    }
    setOpenUnits(next);
  }

  function toggleLesson(id: number) {
    const next = new Set(openLessons);
    if (next.has(id)) { next.delete(id); }
    else {
      next.add(id);
      if (!videos[id]) dispatch(fetchVideos(id));
    }
    setOpenLessons(next);
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
      <div className="p-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">محتوى الكورس</h1>
            <p className="text-gray-400 text-sm mt-0.5">إدارة الوحدات والدروس والفيديوهات</p>
          </div>
          <button
            onClick={() => setUnitModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            إضافة وحدة
          </button>
        </div>

        {/* Content tree */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : units.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-400">لا توجد وحدات بعد — أضف الوحدة الأولى</p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Unit row */}
                <div
                  className="flex items-center justify-between px-5 py-4 bg-white cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleUnit(unit.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                      <svg className={`w-4 h-4 text-teal-600 transition-transform ${openUnits.has(unit.id) ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold">{unit.title}</p>
                      <p className="text-gray-400 text-xs">{unit.lessons_count} درس</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setLessonModal(unit.id); if (!openUnits.has(unit.id)) toggleUnit(unit.id); }}
                      className="text-xs text-teal-600 hover:text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition"
                    >
                      + درس
                    </button>
                    <button
                      onClick={() => dispatch(deleteUnit({ courseId: cId, unitId: unit.id }))}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {openUnits.has(unit.id) && (
                  <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                    {(lessons[unit.id] ?? []).length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">لا توجد دروس</p>
                    ) : (
                      (lessons[unit.id] ?? []).map((lesson) => (
                        <div key={lesson.id}>
                          <div
                            className="flex items-center justify-between px-8 py-3 cursor-pointer hover:bg-white transition"
                            onClick={() => toggleLesson(lesson.id)}
                          >
                            <div className="flex items-center gap-3">
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${openLessons.has(lesson.id) ? 'rotate-90' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-gray-700 text-sm font-medium">{lesson.title}</span>
                              <span className="text-gray-400 text-xs">({lesson.videos_count} محتوى)</span>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setVideoModal(lesson.id); if (!openLessons.has(lesson.id)) toggleLesson(lesson.id); }}
                                className="text-xs text-teal-600 hover:text-teal-800 px-2 py-1 rounded-lg hover:bg-teal-50 transition"
                              >
                                + محتوى
                              </button>
                              <button
                                onClick={() => dispatch(deleteLesson({ unitId: unit.id, lessonId: lesson.id }))}
                                className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                              >
                                حذف
                              </button>
                            </div>
                          </div>

                          {/* Videos */}
                          {openLessons.has(lesson.id) && (
                            <div className="px-12 py-2 space-y-1">
                              {(videos[lesson.id] ?? []).length === 0 ? (
                                <p className="text-gray-400 text-xs py-2">لا يوجد محتوى</p>
                              ) : (
                                (videos[lesson.id] ?? []).map((v) => (
                                  <div key={v.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white transition group">
                                    <div className="flex items-center gap-3">
                                      <TypeIcon type={v.type} />
                                      <span className="text-gray-700 text-sm">{v.title}</span>
                                      {v.duration > 0 && (
                                        <span className="text-gray-400 text-xs">{fmtDuration(v.duration)}</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => dispatch(deleteVideo({ lessonId: lesson.id, videoId: v.id }))}
                                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة وحدة جديدة</h3>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <input
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="اسم الوحدة (مثال: الوحدة الأولى — المقدمة)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" disabled={saving || !unitTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setUnitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lesson */}
      {lessonModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة درس</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="اسم الدرس"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" disabled={saving || !lessonTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setLessonModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Video */}
      {videoModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة محتوى</h3>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">نوع المحتوى</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['video', 'pdf', 'attachment'] as ContentType[]).map((t) => (
                    <button key={t} type="button"
                      onClick={() => setVideoForm({ ...videoForm, type: t })}
                      className={`py-2 rounded-xl text-sm border transition ${videoForm.type === t ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}>
                      {t === 'video' ? 'فيديو' : t === 'pdf' ? 'PDF' : 'مرفق'}
                    </button>
                  ))}
                </div>
              </div>
              <input
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="عنوان المحتوى"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
              <input
                value={videoForm.video_url}
                onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                placeholder="رابط الفيديو / الملف"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                dir="ltr"
              />
              {videoForm.type === 'video' && (
                <input
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                  placeholder="المدة بالدقائق (اختياري)"
                  type="number" min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                />
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={saving || !videoForm.title.trim() || !videoForm.video_url.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setVideoModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
