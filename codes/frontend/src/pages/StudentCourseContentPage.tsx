import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchCourseContent, openVideo, completeVideo, closeVideo,
} from '../features/student/courseProgressSlice';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  goldL:  '#DDAD50',
  dimTxt: '#9CA3AF',
};

function ProgressRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={DK.gold} strokeWidth={5}
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

  useEffect(() => { dispatch(fetchCourseContent(cId)); }, [dispatch, cId]);

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

  async function handleWatch(videoId: number) { await dispatch(openVideo(videoId)); }

  async function handleComplete() {
    if (!activeVideo) return;
    await dispatch(completeVideo({ videoId: activeVideo.id }));
    dispatch(closeVideo());
  }

  return (
    <StudentLayout>
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100%' }}>
        {/* Course header */}
        {course && (
          <div className="mb-6 rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)', border: '1px solid rgba(201,149,42,0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#fff' }}>{course.title}</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>نسبة إنجازك الكلية</p>
              </div>
              <div className="relative">
                <ProgressRing pct={course.progress} size={60} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#fff' }}>
                  {course.progress}%
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-full h-2" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <div className="rounded-full h-2 transition-all duration-700"
                style={{ width: `${course.progress}%`, background: 'rgba(255,255,255,0.8)' }} />
            </div>
          </div>
        )}

        {/* Units tree */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        ) : units.length === 0 ? (
          <p className="text-center py-16" style={{ color: DK.dimTxt }}>لا يوجد محتوى في هذا الكورس حتى الآن</p>
        ) : (
          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="rounded-2xl overflow-hidden" style={DK.card}>
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer transition"
                  style={{ borderBottom: openUnits.has(unit.id) ? '1px solid #EDE3CE' : 'none' }}
                  onClick={() => toggleUnit(unit.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <ProgressRing pct={unit.progress} size={44} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: DK.gold }}>
                        {unit.progress}%
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#1B2038' }}>{unit.title}</p>
                      <p className="text-xs" style={{ color: DK.dimTxt }}>{unit.lessons.length} درس</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 transition-transform ${openUnits.has(unit.id) ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: DK.dimTxt }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {openUnits.has(unit.id) && (
                  <div style={{ background: '#F9FAFB' }}>
                    {unit.lessons.map((lesson) => (
                      <div key={lesson.id} style={{ borderTop: '1px solid #EDE3CE' }}>
                        <div className="flex items-center justify-between px-8 py-3 cursor-pointer transition"
                          onClick={() => toggleLesson(lesson.id)}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                          <div className="flex items-center gap-3">
                            <svg className={`w-4 h-4 transition-transform ${openLessons.has(lesson.id) ? 'rotate-90' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: DK.dimTxt }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-sm font-medium" style={{ color: '#1B2038' }}>{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full" style={{ background: '#EDE3CE' }}>
                              <div className="h-1.5 rounded-full transition-all"
                                style={{ width: `${lesson.progress}%`, background: 'linear-gradient(90deg, #C9952A, #DDAD50)' }} />
                            </div>
                            <span className="text-xs" style={{ color: DK.dimTxt }}>{lesson.progress}%</span>
                          </div>
                        </div>

                        {openLessons.has(lesson.id) && (
                          <div className="px-12 py-2 space-y-1">
                            {lesson.videos.map((v) => (
                              <div key={v.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition cursor-pointer"
                                onClick={() => handleWatch(v.id)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.05)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                                <div className="flex items-center gap-3">
                                  {v.completed ? (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ background: 'rgba(16,185,129,0.15)' }}>
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: '#10B981' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                                      style={{ borderColor: 'rgba(201,149,42,0.3)' }} />
                                  )}
                                  <span className="text-sm" style={{ color: v.completed ? DK.dimTxt : '#1B2038', textDecoration: v.completed ? 'line-through' : 'none' }}>
                                    {v.title}
                                  </span>
                                  {v.duration > 0 && (
                                    <span className="text-xs" style={{ color: DK.dimTxt }}>{fmtDuration(v.duration)}</span>
                                  )}
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                  style={v.type === 'pdf'
                                    ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                                    : v.type === 'attachment'
                                    ? { background: 'rgba(59,130,246,0.08)', color: '#3B82F6' }
                                    : { background: 'rgba(201,149,42,0.08)', color: DK.gold }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl"
          style={{ background: 'rgba(27,32,56,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #EDE3CE' }}>
              <h3 className="font-semibold" style={{ color: '#1B2038' }}>{activeVideo.title}</h3>
              <button onClick={() => dispatch(closeVideo())} className="transition" style={{ color: DK.dimTxt }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              {activeVideo.type === 'video' ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <iframe src={activeVideo.video_url} className="w-full h-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.2)' }}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: DK.gold }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href={activeVideo.video_url} target="_blank" rel="noreferrer"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                    فتح الملف
                  </a>
                </div>
              )}
            </div>

            <div className="px-5 pb-5">
              <button onClick={handleComplete}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
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
