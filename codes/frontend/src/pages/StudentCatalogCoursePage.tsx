import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCatalogDetail, fetchCatalogCourse } from '../features/student/catalogSlice';
import api from '../services/axios';
import StudentLayout from '../components/StudentLayout';
import { C } from '../theme/palette';

export default function StudentCatalogCoursePage() {
  const { courseId } = useParams();
  const id = Number(courseId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { detail, detailLoading, error } = useAppSelector((s) => s.catalog);

  const [avg, setAvg] = useState<number | null>(null);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [myRating, setMyRating] = useState<{ rating: number; comment: string | null } | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingMsg, setRatingMsg] = useState<string | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);
  const [purchasePendingLocal, setPurchasePendingLocal] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    dispatch(fetchCatalogCourse(id));
    return () => { dispatch(clearCatalogDetail()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await api.get(`/student/courses/${id}/rating`);
        if (cancelled) return;
        const d = r.data.data as {
          average: number | null;
          ratings_count: number;
          my_rating: { rating: number; comment: string | null } | null;
        };
        setAvg(d.average);
        setRatingsCount(d.ratings_count);
        setMyRating(d.my_rating);
        if (d.my_rating) {
          setStars(d.my_rating.rating);
          setComment(d.my_rating.comment ?? '');
        }
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const submitRating = async () => {
    setSavingRating(true);
    setRatingMsg(null);
    try {
      await api.post(`/student/courses/${id}/rating`, { rating: stars, comment: comment || null });
      setMyRating({ rating: stars, comment: comment || null });
      setRatingMsg('تم حفظ تقييمك');
      const r = await api.get(`/student/courses/${id}/rating`);
      setAvg(r.data.data.average);
      setRatingsCount(r.data.data.ratings_count);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setRatingMsg(err.response?.data?.message ?? 'تعذر حفظ التقييم');
    } finally {
      setSavingRating(false);
    }
  };

  const requestPurchase = async () => {
    setPurchaseBusy(true);
    setPurchaseMsg(null);
    try {
      const r = await api.post(`/student/catalog/${id}/purchase-request`);
      setPurchasePendingLocal(true);
      setPurchaseMsg(r.data.message ?? 'تم إرسال طلب الشراء');
      dispatch(fetchCatalogCourse(id));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setPurchaseMsg(err.response?.data?.message ?? 'تعذر إرسال طلب الشراء');
    } finally {
      setPurchaseBusy(false);
    }
  };

  const pendingPurchase = purchasePendingLocal || !!detail?.purchase_pending;
  const canBuy = !!detail?.can_request_purchase && !pendingPurchase;

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
                  {avg != null && (
                    <p style={{ margin: '8px 0 0', color: C.primary, fontSize: 12.5, fontWeight: 700 }}>
                      تقييم المساق: {avg} / 5 ({ratingsCount})
                    </p>
                  )}
                </div>
                <span style={{
                  padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                  background: detail.is_entitled ? C.greenBg : C.amberBg,
                  color: detail.is_entitled ? C.green : C.amber,
                }}>
                  {detail.is_entitled ? 'متاح لك' : pendingPurchase ? 'طلب شراء معلّق' : 'غير متاح'}
                </span>
              </div>

              {detail.description && (
                <p style={{ margin: '14px 0 0', color: C.text, fontSize: 13.5, lineHeight: 1.75 }}>{detail.description}</p>
              )}

              {!detail.is_free && (
                <p style={{ margin: '10px 0 0', color: C.primary, fontWeight: 800, fontSize: 14 }}>
                  السعر: {detail.price ?? '—'}
                </p>
              )}
              {detail.is_free && (
                <p style={{ margin: '10px 0 0', color: C.green, fontWeight: 800, fontSize: 13 }}>مجاني</p>
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
                    {pendingPurchase ? (
                      <strong style={{ color: C.amber }}>طلب الشراء بانتظار موافقة الإدارة.</strong>
                    ) : (
                      <>
                        <strong style={{ color: C.amber }}>الوصول عبر باقة أو شراء منفرد. </strong>
                        {detail.packages_hint}
                      </>
                    )}
                    {canBuy && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          disabled={purchaseBusy}
                          onClick={requestPurchase}
                          style={{
                            padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 13,
                            fontFamily: "'Cairo',sans-serif", opacity: purchaseBusy ? 0.6 : 1,
                          }}
                        >
                          {purchaseBusy ? '...' : 'طلب شراء المساق'}
                        </button>
                      </div>
                    )}
                    {purchaseMsg && <p style={{ margin: '8px 0 0', color: C.sub, fontSize: 12.5 }}>{purchaseMsg}</p>}
                  </div>
                )}
              </div>
            </div>

            {detail.is_entitled && detail.is_complete && (
              <div style={{
                background: C.card, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`,
                boxShadow: C.shadow, marginBottom: 14,
              }}>
                <h2 style={{ margin: '0 0 10px', color: C.text, fontSize: 15, fontWeight: 800 }}>قيّم المساق</h2>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setStars(n)} style={{
                      width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
                      background: n <= stars ? C.goldBg : C.bg, color: n <= stars ? C.primary : C.dim,
                      fontWeight: 900, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                    }}>{n}</button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="تعليق اختياري (حتى 500 حرف)"
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box', borderRadius: 12, border: `1px solid ${C.border}`,
                    padding: 12, fontFamily: "'Cairo',sans-serif", fontSize: 13, color: C.text, resize: 'vertical',
                  }}
                />
                <button type="button" disabled={savingRating} onClick={submitRating} style={{
                  marginTop: 10, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 13,
                  fontFamily: "'Cairo',sans-serif", opacity: savingRating ? 0.6 : 1,
                }}>{myRating ? 'تحديث التقييم' : 'إرسال التقييم'}</button>
                {ratingMsg && <p style={{ margin: '8px 0 0', color: C.sub, fontSize: 12.5 }}>{ratingMsg}</p>}
              </div>
            )}

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
