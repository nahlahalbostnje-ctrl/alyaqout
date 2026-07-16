import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';
import { useCurrency } from '../hooks/useCurrency';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', text: '#1B2038', sub: '#6B7280', border: '#EDE3CE',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6', orange: '#D97706', purple: '#8B5CF6',
};

type Tab = 'students' | 'content' | 'homeworks' | 'exams' | 'live';

interface Dossier {
  course: {
    id: number;
    title: string;
    description: string | null;
    price: string;
    is_free: boolean;
    is_active: boolean;
    approval_status?: string;
    subject?: { id: number; name: string; type: string } | null;
    grade?: { id: number; name: string } | null;
    teacher?: { id: number; name: string; phone?: string } | null;
  };
  content: {
    units_count: number;
    lessons_count: number;
    videos_count: number;
    units: { id: number; title: string; lessons_count: number }[];
  };
  homeworks: {
    id: number; title: string; status: string; due_date: string | null;
    archived: boolean; teacher: string | null; created_at: string | null;
  }[];
  exams: {
    id: number; title: string; status: string; duration: number | null;
    starts_at: string | null; archived: boolean; questions_count: number;
    teacher: string | null; created_at: string | null;
  }[];
  live_classes: {
    id: number; title: string; scheduled_at: string | null;
    duration_minutes: number; status: string; approval_status: string;
    session_type: string; teacher: string | null;
  }[];
  students: {
    id: number; name: string; phone: string | null; grade: string | null;
    is_active: boolean; access_via: string; package: string | null; ends_at: string | null;
  }[];
  counts: {
    students: number; homeworks: number; exams: number;
    live_classes: number; units: number;
  };
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 18,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `1px solid ${DK.border}`,
};

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}18`, color,
    }}>{label}</span>
  );
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso.slice(0, 16);
  }
}

export default function AdminCourseDossierPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { formatMoney } = useCurrency();
  const [data, setData] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('students');

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    api.get(`/admin/courses/${courseId}/dossier`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => setError('تعذّر تحميل ملف الدورة'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const tabs: { key: Tab; label: string; count?: number }[] = data ? [
    { key: 'students', label: 'الطلاب', count: data.counts.students },
    { key: 'content', label: 'المحتوى', count: data.counts.units },
    { key: 'homeworks', label: 'الواجبات', count: data.counts.homeworks },
    { key: 'exams', label: 'الامتحانات', count: data.counts.exams },
    { key: 'live', label: 'الحصص', count: data.counts.live_classes },
  ] : [];

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Link to="/admin/courses" style={{
            padding: '8px 14px', borderRadius: 10, border: `1px solid ${DK.border}`,
            background: '#fff', color: DK.sub, textDecoration: 'none', fontWeight: 700, fontSize: 13,
          }}>← الدورات</Link>
          {data && (
            <Link to={`/admin/courses/${data.course.id}/content`} style={{
              padding: '8px 14px', borderRadius: 10, background: DK.goldGrad,
              color: '#1B2038', textDecoration: 'none', fontWeight: 800, fontSize: 13,
            }}>إدارة المحتوى</Link>
          )}
        </div>

        {loading && <p style={{ color: DK.sub, textAlign: 'center', padding: 40 }}>جارٍ التحميل...</p>}
        {error && <p style={{ color: DK.red, fontWeight: 700 }}>{error}</p>}

        {data && (
          <>
            <div style={{ ...card, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: DK.text }}>{data.course.title}</h1>
                  <p style={{ margin: '0 0 10px', color: DK.sub, fontSize: 13, lineHeight: 1.6 }}>
                    {data.course.description || 'لا يوجد وصف'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {data.course.subject && <StatusPill label={data.course.subject.name} color={DK.blue} />}
                    {data.course.grade && <StatusPill label={data.course.grade.name} color={DK.purple} />}
                    <StatusPill label={data.course.is_active ? 'نشطة' : 'معطّلة'} color={data.course.is_active ? DK.green : DK.red} />
                    {data.course.approval_status === 'pending' && <StatusPill label="بانتظار الموافقة" color={DK.orange} />}
                    {data.course.is_free
                      ? <StatusPill label="مجانية" color={DK.green} />
                      : <StatusPill label={formatMoney(data.course.price)} color={DK.gold} />}
                  </div>
                </div>
                <div style={{ minWidth: 180 }}>
                  <p style={{ margin: 0, fontSize: 12, color: DK.sub }}>المعلم</p>
                  <p style={{ margin: '4px 0 0', fontWeight: 800, color: DK.text }}>{data.course.teacher?.name ?? '—'}</p>
                  {data.course.teacher?.phone && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: DK.sub }}>{data.course.teacher.phone}</p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))',
                gap: 10, marginTop: 18,
              }}>
                {[
                  { l: 'طلاب', v: data.counts.students, c: DK.blue },
                  { l: 'وحدات', v: data.content.units_count, c: DK.gold },
                  { l: 'دروس', v: data.content.lessons_count, c: DK.purple },
                  { l: 'فيديوهات', v: data.content.videos_count, c: DK.orange },
                  { l: 'واجبات', v: data.counts.homeworks, c: DK.green },
                  { l: 'امتحانات', v: data.counts.exams, c: DK.red },
                  { l: 'حصص', v: data.counts.live_classes, c: DK.blue },
                ].map((k) => (
                  <div key={k.l} style={{ background: '#F8F5EE', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 20, color: k.c }}>{k.v}</p>
                    <p style={{ margin: 0, fontSize: 11, color: DK.sub, fontWeight: 700 }}>{k.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{
                    padding: '8px 16px', borderRadius: 40, cursor: 'pointer',
                    fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 700,
                    background: active ? DK.goldGrad : '#fff',
                    color: active ? '#fff' : DK.sub,
                    border: active ? 'none' : `1px solid ${DK.border}`,
                  }}>
                    {t.label}{typeof t.count === 'number' ? ` (${t.count})` : ''}
                  </button>
                );
              })}
            </div>

            <div style={card}>
              {tab === 'students' && (
                data.students.length === 0 ? (
                  <p style={{ color: DK.sub, textAlign: 'center', margin: 0 }}>لا يوجد طلاب مخوّلون لهذه الدورة بعد (فعّل اشتراكاً يشملها).</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                      <thead>
                        <tr>
                          {['الطالب', 'الصف', 'الوصول', 'الباقة', 'ينتهي'].map((h) => (
                            <th key={h} style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, color: DK.sub, borderBottom: `1px solid ${DK.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.students.map((s) => (
                          <tr key={s.id}>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #F3EDE0' }}>
                              <p style={{ margin: 0, fontWeight: 700 }}>{s.name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: DK.sub }}>{s.phone ?? '—'}</p>
                            </td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #F3EDE0', fontSize: 13 }}>{s.grade ?? '—'}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #F3EDE0' }}>
                              <StatusPill label={s.access_via === 'free' ? 'مجاني' : 'اشتراك'} color={s.access_via === 'free' ? DK.green : DK.blue} />
                            </td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #F3EDE0', fontSize: 13 }}>{s.package ?? '—'}</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid #F3EDE0', fontSize: 13 }}>{s.ends_at ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {tab === 'content' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <p style={{ margin: 0, color: DK.sub, fontSize: 13 }}>
                      {data.content.units_count} وحدة · {data.content.lessons_count} درس · {data.content.videos_count} فيديو
                    </p>
                    <Link to={`/admin/courses/${data.course.id}/content`} style={{ color: DK.gold, fontWeight: 800, fontSize: 13 }}>فتح محرر المحتوى ←</Link>
                  </div>
                  {data.content.units.length === 0 ? (
                    <p style={{ color: DK.sub, textAlign: 'center', margin: 0 }}>لا يوجد محتوى بعد.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data.content.units.map((u, i) => (
                        <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#F8F5EE', borderRadius: 12 }}>
                          <span style={{ fontWeight: 700, color: DK.text }}>{i + 1}. {u.title}</span>
                          <span style={{ fontSize: 12, color: DK.sub, fontWeight: 700 }}>{u.lessons_count} درس</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === 'homeworks' && (
                data.homeworks.length === 0 ? (
                  <p style={{ color: DK.sub, textAlign: 'center', margin: 0 }}>لا توجد واجبات لهذه الدورة.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.homeworks.map((h) => (
                      <div key={h.id} style={{ padding: '12px 14px', background: '#F8F5EE', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, fontWeight: 800, color: DK.text }}>{h.title}</p>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <StatusPill label={h.status} color={h.status === 'approved' ? DK.green : DK.orange} />
                            {h.archived && <StatusPill label="مؤرشف" color={DK.sub} />}
                          </div>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: DK.sub }}>
                          استحقاق: {h.due_date ?? '—'} · معلم: {h.teacher ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {tab === 'exams' && (
                data.exams.length === 0 ? (
                  <p style={{ color: DK.sub, textAlign: 'center', margin: 0 }}>لا توجد امتحانات لهذه الدورة.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.exams.map((e) => (
                      <div key={e.id} style={{ padding: '12px 14px', background: '#F8F5EE', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, fontWeight: 800, color: DK.text }}>{e.title}</p>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <StatusPill label={e.status} color={e.status === 'approved' ? DK.green : DK.orange} />
                            {e.archived && <StatusPill label="مؤرشف" color={DK.sub} />}
                          </div>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: DK.sub }}>
                          {e.questions_count} سؤال · {e.duration ?? '—'} دقيقة · {fmtDate(e.starts_at)} · {e.teacher ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {tab === 'live' && (
                data.live_classes.length === 0 ? (
                  <p style={{ color: DK.sub, textAlign: 'center', margin: 0 }}>لا توجد حصص لهذه الدورة.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.live_classes.map((lc) => (
                      <div key={lc.id} style={{ padding: '12px 14px', background: '#F8F5EE', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, fontWeight: 800, color: DK.text }}>{lc.title}</p>
                          <StatusPill label={lc.approval_status} color={lc.approval_status === 'approved' ? DK.green : DK.orange} />
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: DK.sub }}>
                          {fmtDate(lc.scheduled_at)} · {lc.duration_minutes} د · {lc.session_type} · {lc.status} · {lc.teacher ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
