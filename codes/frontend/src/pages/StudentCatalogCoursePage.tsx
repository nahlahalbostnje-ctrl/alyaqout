import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCatalogDetail, fetchCatalogCourse } from '../features/student/catalogSlice';
import StudentLayout from '../components/StudentLayout';
import { C } from '../theme/palette';

export default function StudentCatalogCoursePage() {
  const { courseId } = useParams();
  const id = Number(courseId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { detail, detailLoading, error } = useAppSelector((s) => s.catalog);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    dispatch(fetchCatalogCourse(id));
    return () => { dispatch(clearCatalogDetail()); };
  }, [dispatch, id]);

  return (
    <StudentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: '20px 16px', maxWidth: 820 }}>
        <button type="button" onClick={() => navigate('/student/catalog')} style={{
          background: 'none', border: 'none', color: C.primary, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Cairo',sans-serif", padding: 0, marginBottom: 14, fontSize: 13,
        }}>← العودة للكتالوج</button>

        {detailLoading && <p style={{ color: C.dim, textAlign: 'center', padding: 40 }}>جاري التحميل...</p>}
        {error && <p style={{ color: C.red }}>{error}</p>}

        {detail && !detailLoading && (
          <>
            <div style={{
              background: C.card, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`,
              boxShadow: C.shadow, marginBottom: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ margin: 0, color: C.text, fontSize: 20, fontWeight: 900 }}>{detail.title}</h1>
                  <p style={{ margin: '8px 0 0', color: C.sub, fontSize: 13 }}>
                    {detail.teacher?.name ?? '—'}
                    {detail.subject?.name ? ` · ${detail.subject.name}` : ''}
                    {detail.grade?.name ? ` · ${detail.grade.name}` : ''}
                  </p>
                </div>
                <span style={{
                  padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                  background: detail.is_entitled ? C.greenBg : C.amberBg,
                  color: detail.is_entitled ? C.green : C.amber,
                }}>
                  {detail.is_entitled ? 'متاح لك' : 'يتطلب باقة'}
                </span>
              </div>

              {detail.description && (
                <p style={{ margin: '14px 0 0', color: C.text, fontSize: 13.5, lineHeight: 1.75 }}>{detail.description}</p>
              )}

              {detail.is_entitled && typeof detail.progress === 'number' && (
                <p style={{ margin: '12px 0 0', color: C.primary, fontWeight: 700, fontSize: 13 }}>
                  تقدّمك: {detail.progress}%
                  {detail.total_videos != null ? ` (${detail.total_videos} عنصر محتوى)` : ''}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {detail.is_entitled && detail.content_path ? (
                  <Link to={detail.content_path} style={{
                    padding: '10px 18px', borderRadius: 12, background: C.goldGrad, color: '#fff',
                    fontWeight: 800, fontSize: 13, textDecoration: 'none',
                  }}>ابدأ التعلم</Link>
                ) : (
                  <div style={{
                    width: '100%', background: C.amberBg, borderRadius: 12, padding: '12px 14px',
                    color: C.text, fontSize: 13, lineHeight: 1.65,
                  }}>
                    <strong style={{ color: C.amber }}>يتطلب باقة نشطة. </strong>
                    {detail.packages_hint}
                  </div>
                )}
              </div>
            </div>

            <h2 style={{ margin: '0 0 10px', color: C.text, fontSize: 16, fontWeight: 800 }}>محتوى المساق</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {detail.units.map((unit) => (
                <div key={unit.id} style={{
                  background: C.card, borderRadius: 14, padding: 14, border: `1px solid ${C.border}`,
                  opacity: unit.locked ? 0.92 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 14 }}>{unit.title}</p>
                    {unit.locked && <span style={{ color: C.amber, fontSize: 11, fontWeight: 700 }}>مقفل</span>}
                  </div>
                  <ul style={{ margin: '10px 0 0', paddingInlineStart: 18 }}>
                    {unit.lessons.map((lesson) => (
                      <li key={lesson.id} style={{ color: C.sub, fontSize: 13, marginBottom: 4 }}>
                        {lesson.title}
                        <span style={{ color: C.dim }}> · {lesson.videos_count} عنصر</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {detail.units.length === 0 && (
                <p style={{ color: C.dim, textAlign: 'center', padding: 24 }}>لا وحدات منشورة بعد</p>
              )}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
