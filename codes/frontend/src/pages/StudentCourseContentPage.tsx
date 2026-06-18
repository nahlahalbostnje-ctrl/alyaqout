import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchCourseContent,
  openVideo,
  completeVideo,
  closeVideo,
} from '../features/student/courseProgressSlice';

function ProgressRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#7c3aed" strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

function fmtDuration(secs: number): string {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function StudentCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const cId = Number(courseId);
  const dispatch = useAppDispatch();
  const { course, units, loading, activeVideo } = useAppSelector((s) => s.courseProgress);

  const [openUnits, setOpenUnits]     = useState<Set<number>>(new Set());
  const [openLessons, setOpenLessons] = useState<Set<number>>(new Set());

  useEffect(() => {
    dispatch(fetchCourseContent(cId));
  }, [dispatch, cId]);

  function toggleUnit(id: number) {
    const next = new Set(openUnits);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenUnits(next);
  }

  function toggleLesson(id: number) {
    const next = new Set(openLessons);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenLessons(next);
  }

  async function handleWatch(videoId: number) {
    await dispatch(openVideo(videoId));
  }

  async function handleComplete() {
    if (!activeVideo) return;
    await dispatch(completeVideo({ videoId: activeVideo.id }));
    dispatch(closeVideo());
  }

  return (
    <StudentLayout>
      <div className="p-6" dir="rtl">
        {/* Course header */}
        {course && (
          <div className="mb-6 rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-purple-200 text-sm mt-1">نسبة إنجازك الكلية</p>
              </div>
              <div className="relative">
                <ProgressRing pct={course.progress} size={60} />
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {course.progress}%
                </span>
              </div>
            </div>
            {/* Overall progress bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all duration-700"
                style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        )}

        {/* Units tree */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : units.length === 0 ? (
          <p className="text-center text-gray-400 py-16">لا يوجد محتوى في هذا الكورس حتى الآن</p>
        ) : (
          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleUnit(unit.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <ProgressRing pct={unit.progress} size={44} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-purple-700">
                        {unit.progress}%
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold">{unit.title}</p>
                      <p className="text-gray-400 text-xs">{unit.lessons.length} درس</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${openUnits.has(unit.id) ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {openUnits.has(unit.id) && (
                  <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                    {unit.lessons.map((lesson) => (
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
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                              <div className="h-1.5 bg-purple-500 rounded-full transition-all"
                                style={{ width: `${lesson.progress}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{lesson.progress}%</span>
                          </div>
                        </div>

                        {openLessons.has(lesson.id) && (
                          <div className="px-12 py-2 space-y-1">
                            {lesson.videos.map((v) => (
                              <div key={v.id}
                                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white transition group cursor-pointer"
                                onClick={() => handleWatch(v.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {v.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-purple-400 transition" />
                                  )}
                                  <span className={`text-sm ${v.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {v.title}
                                  </span>
                                  {v.duration > 0 && (
                                    <span className="text-xs text-gray-400">{fmtDuration(v.duration)}</span>
                                  )}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  v.type === 'pdf' ? 'bg-red-50 text-red-500' :
                                  v.type === 'attachment' ? 'bg-blue-50 text-blue-500' :
                                  'bg-purple-50 text-purple-600'
                                }`}>
                                  {v.type === 'video' ? 'فيديو' : v.type === 'pdf' ? 'PDF' : 'مرفق'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video viewer modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-gray-800 font-semibold">{activeVideo.title}</h3>
              <button onClick={() => dispatch(closeVideo())}
                className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              {activeVideo.type === 'video' ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <iframe
                    src={activeVideo.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href={activeVideo.video_url} target="_blank" rel="noreferrer"
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)' }}>
                    فتح الملف
                  </a>
                </div>
              )}
            </div>

            <div className="px-5 pb-5">
              <button onClick={handleComplete}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                تحديد كمكتمل والمتابعة
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
