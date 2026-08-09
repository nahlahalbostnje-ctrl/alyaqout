import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCatalog } from '../features/student/catalogSlice';
import StudentLayout from '../components/StudentLayout';
import { C } from '../theme/palette';

type Filter = 'all' | 'entitled' | 'locked';

export default function StudentCatalogPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useAppSelector((s) => s.catalog);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { dispatch(fetchCatalog()); }, [dispatch]);

  const list = useMemo(() => items.filter((c) => {
    if (filter === 'entitled' && !c.is_entitled) return false;
    if (filter === 'locked' && c.is_entitled) return false;
    const hay = `${c.title} ${c.teacher?.name ?? ''} ${c.category?.name ?? ''} ${c.subject?.name ?? ''}`;
    return !q || hay.includes(q);
  }), [items, filter, q]);

  return (
    <StudentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>كتالوج المساقات</h1>
        </div>
        <p style={{ margin: '0 0 16px', color: C.sub, fontSize: 13.5 }}>
          تصفّح المساقات المعتمدة في دولتك. المخوّلون يبدأون التعلم مباشرة، وغير المخوَلين يرون التفاصيل وطلب التفعيل عبر الباقة.
        </p>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن مساق أو معلم..."
          style={{
            width: '100%', boxSizing: 'border-box', marginBottom: 12, padding: '11px 14px',
            borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.card,
            fontFamily: "'Cairo',sans-serif", fontSize: 13, color: C.text, outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {([
            ['all', 'الكل'],
            ['entitled', 'متاح لي'],
            ['locked', 'يتطلب باقة'],
          ] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setFilter(id)} style={{
              padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif", fontSize: 12.5, fontWeight: filter === id ? 800 : 600,
              background: filter === id ? C.goldGrad : C.card,
              color: filter === id ? '#fff' : C.sub,
              boxShadow: filter === id ? 'none' : C.shadow,
            }}>{label}</button>
          ))}
        </div>

        {loading && <p style={{ textAlign: 'center', color: C.dim, padding: 40 }}>جاري التحميل...</p>}
        {error && <p style={{ textAlign: 'center', color: C.red }}>{error}</p>}

        {!loading && list.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.text, fontWeight: 700, margin: 0 }}>لا مساقات مطابقة</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => navigate(`/student/catalog/${course.id}`)}
              style={{
                textAlign: 'right', background: C.card, borderRadius: 16, padding: 16,
                border: `1px solid ${C.border}`, boxShadow: C.shadow, cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 15 }}>{course.title}</p>
                  <p style={{ margin: '6px 0 0', color: C.sub, fontSize: 12.5 }}>
                    {course.teacher?.name ?? '—'}
                    {course.subject?.name ? ` · ${course.subject.name}` : ''}
                    {course.grade?.name ? ` · ${course.grade.name}` : ''}
                  </p>
                  {course.description && (
                    <p style={{
                      margin: '8px 0 0', color: C.dim, fontSize: 12.5, lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{course.description}</p>
                  )}
                  <p style={{ margin: '10px 0 0', color: C.dim, fontSize: 11.5 }}>
                    {course.units_count} وحدة
                    {course.is_free ? ' · مجاني' : ''}
                    {course.is_entitled && typeof course.progress === 'number' ? ` · تقدّم ${course.progress}%` : ''}
                  </p>
                </div>
                <span style={{
                  flexShrink: 0, padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                  background: course.is_entitled ? C.greenBg : C.amberBg,
                  color: course.is_entitled ? C.green : C.amber,
                }}>
                  {course.is_entitled ? 'متاح' : 'باقة'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
