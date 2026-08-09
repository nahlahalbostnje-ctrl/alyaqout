import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/axios';
import BrandLogo from '../components/BrandLogo';
import { C, brand } from '../theme/palette';

interface VerifyData {
  valid: boolean;
  code: string;
  student_name: string;
  course_title: string;
  issued_at: string | null;
}

export default function CertificateVerifyPage() {
  const { code = '' } = useParams();
  const [data, setData] = useState<VerifyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await api.get(`/certificates/verify/${encodeURIComponent(code)}`);
        if (!cancelled) setData(r.data.data as VerifyData);
      } catch {
        if (!cancelled) {
          setData(null);
          setError('رمز الشهادة غير صالح أو غير موجود');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', background: C.bg, fontFamily: "'Cairo',sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: 'min(480px, 100%)', background: C.card, borderRadius: 18,
        border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: 28, textAlign: 'center',
      }}>
        <BrandLogo size={48} style={{ margin: '0 auto 12px', borderRadius: 12 }} />
        <p style={{ margin: 0, color: brand.gold, fontWeight: 800, fontSize: 12 }}>التحقق من الشهادة</p>
        <h1 style={{ margin: '8px 0 20px', color: C.text, fontSize: 20, fontWeight: 900 }}>مصادقة شهادة إتمام</h1>

        {loading && <p style={{ color: C.dim }}>جاري التحقق...</p>}
        {error && (
          <div style={{ background: C.redBg, color: C.red, borderRadius: 12, padding: 14, fontWeight: 700 }}>
            {error}
          </div>
        )}
        {data && (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: C.greenBg, color: C.green, borderRadius: 12, padding: '10px 14px',
              fontWeight: 800, textAlign: 'center', marginBottom: 16,
            }}>شهادة سارية</div>
            <p style={{ margin: '0 0 8px', color: C.sub, fontSize: 13 }}>الطالب</p>
            <p style={{ margin: '0 0 14px', color: C.text, fontWeight: 800, fontSize: 17 }}>{data.student_name}</p>
            <p style={{ margin: '0 0 8px', color: C.sub, fontSize: 13 }}>المساق</p>
            <p style={{ margin: '0 0 14px', color: C.text, fontWeight: 800, fontSize: 16 }}>{data.course_title}</p>
            <p style={{ margin: '0 0 8px', color: C.sub, fontSize: 13 }}>تاريخ الإصدار</p>
            <p style={{ margin: '0 0 14px', color: C.text, fontWeight: 700 }}>{data.issued_at ?? '—'}</p>
            <p style={{ margin: 0, color: C.primary, fontWeight: 800, letterSpacing: 1 }}>{data.code}</p>
          </div>
        )}

        <Link to="/" style={{ display: 'inline-block', marginTop: 22, color: C.primary, fontWeight: 800, textDecoration: 'none' }}>
          العودة للمنصة
        </Link>
      </div>
    </div>
  );
}
