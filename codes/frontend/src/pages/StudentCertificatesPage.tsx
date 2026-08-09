import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentCertificates, type StudentCertificate } from '../features/student/certificatesSlice';
import StudentLayout from '../components/StudentLayout';
import { C, brand } from '../theme/palette';

function CertificateCard({ cert, onPrint }: { cert: StudentCertificate; onPrint: () => void }) {
  const issued = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`,
      boxShadow: C.shadow,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, color: brand.gold, fontSize: 11, fontWeight: 700 }}>شهادة إتمام</p>
          <h3 style={{ margin: '6px 0 4px', color: C.text, fontSize: 16, fontWeight: 800 }}>{cert.course_title}</h3>
          <p style={{ margin: 0, color: C.sub, fontSize: 13 }}>{cert.student_name}</p>
          <p style={{ margin: '8px 0 0', color: C.dim, fontSize: 12 }}>صدرت: {issued}</p>
          <p style={{ margin: '4px 0 0', color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{cert.code}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button type="button" onClick={onPrint} style={{
          padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: C.goldGrad, color: '#fff', fontWeight: 700, fontSize: 12.5, fontFamily: "'Cairo',sans-serif",
        }}>عرض / طباعة</button>
        <Link to={cert.verify_path} style={{
          padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
          background: C.bg, color: C.text, fontWeight: 700, fontSize: 12.5, textDecoration: 'none',
        }}>رابط التحقق</Link>
      </div>
    </div>
  );
}

function PrintView({ cert, onClose }: { cert: StudentCertificate; onClose: () => void }) {
  const issued = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(36,55,70,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 100%)', background: '#fff', borderRadius: 18, padding: '36px 28px',
          border: `2px solid ${C.primary}`, textAlign: 'center', fontFamily: "'Cairo',sans-serif",
        }}
      >
        <p style={{ margin: 0, color: brand.gold, fontWeight: 800, fontSize: 13 }}>منصة تعليمية</p>
        <h2 style={{ margin: '10px 0 6px', color: C.text, fontSize: 22, fontWeight: 900 }}>شهادة إتمام مساق</h2>
        <p style={{ margin: '0 0 20px', color: C.sub, fontSize: 13 }}>تُمنح هذه الشهادة إلى</p>
        <p style={{ margin: '0 0 8px', color: C.primary, fontSize: 22, fontWeight: 900 }}>{cert.student_name}</p>
        <p style={{ margin: '0 0 20px', color: C.text, fontSize: 15, lineHeight: 1.7 }}>
          لإتمام مساق <strong>{cert.course_title}</strong> بنجاح
        </p>
        <p style={{ margin: 0, color: C.dim, fontSize: 12 }}>تاريخ الإصدار: {issued}</p>
        <p style={{ margin: '6px 0 0', color: C.sub, fontSize: 12, fontWeight: 700 }}>{cert.code}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 22 }} className="no-print">
          <button type="button" onClick={() => window.print()} style={{
            padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: C.goldGrad, color: '#fff', fontWeight: 800, fontFamily: "'Cairo',sans-serif",
          }}>طباعة</button>
          <button type="button" onClick={onClose} style={{
            padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`, cursor: 'pointer',
            background: C.bg, color: C.text, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
          }}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

export default function StudentCertificatesPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.certificates);
  const [active, setActive] = useState<StudentCertificate | null>(null);

  useEffect(() => { dispatch(fetchStudentCertificates()); }, [dispatch]);

  return (
    <StudentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>شهاداتي</h1>
        </div>
        <p style={{ margin: '0 0 18px', color: C.sub, fontSize: 13.5 }}>
          تصدر الشهادة تلقائيًا عند إتمام كل دروس المساق.
        </p>

        {loading && <p style={{ color: C.dim, textAlign: 'center', padding: 40 }}>جاري التحميل...</p>}
        {error && <p style={{ color: C.red, textAlign: 'center' }}>{error}</p>}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <p style={{ color: C.text, fontWeight: 700, margin: 0 }}>لا شهادات بعد</p>
            <p style={{ color: C.sub, fontSize: 13, marginTop: 8 }}>أكمل مساقًا من دوراتي لتحصل على شهادتك.</p>
            <Link to="/student/courses" style={{ display: 'inline-block', marginTop: 14, color: C.primary, fontWeight: 800 }}>انتقل لدوراتي</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} onPrint={() => setActive(cert)} />
          ))}
        </div>
      </div>
      {active && <PrintView cert={active} onClose={() => setActive(null)} />}
    </StudentLayout>
  );
}
