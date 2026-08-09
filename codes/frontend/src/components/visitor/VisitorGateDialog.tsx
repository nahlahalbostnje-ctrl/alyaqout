import { Link } from 'react-router-dom';
import { C, brand } from '../../theme/palette';

const FONT = "'Cairo','Tajawal',sans-serif";

type Props = {
  open: boolean;
  onContinue: () => void;
  onClose?: () => void;
};

/** Shown when a visitor tries a locked (account-required) action. */
export default function VisitorGateDialog({ open, onContinue, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-gate-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(36,55,70,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        fontFamily: FONT, direction: 'rtl',
      }}
      onClick={onContinue}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20,
          padding: '28px 24px', boxShadow: '0 24px 60px rgba(36,55,70,0.25)',
          border: `1px solid ${C.border}`,
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: 28, textAlign: 'center' }}>🔐</p>
        <h2 id="visitor-gate-title" style={{
          margin: '0 0 10px', fontSize: 18, fontWeight: 900, color: C.text, textAlign: 'center',
        }}>
          هذه الخدمة متاحة للمستخدمين المسجلين
        </h2>
        <p style={{
          margin: '0 0 22px', fontSize: 14, lineHeight: 1.7, color: C.sub, textAlign: 'center',
        }}>
          أنشئ حسابك للمتابعة والاستفادة من الخدمة.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            to="/register"
            style={{
              display: 'block', textAlign: 'center', textDecoration: 'none',
              padding: '13px 16px', borderRadius: 14, fontWeight: 800, fontSize: 14.5,
              color: '#fff', background: C.goldGrad,
              boxShadow: '0 6px 20px rgba(59,130,160,0.35)',
            }}
          >
            إنشاء حساب
          </Link>
          <button
            type="button"
            onClick={onContinue}
            style={{
              padding: '12px 16px', borderRadius: 14, fontWeight: 700, fontSize: 14,
              fontFamily: FONT, cursor: 'pointer',
              background: C.bg, color: C.text, border: `1px solid ${C.border}`,
            }}
          >
            متابعة كزائر
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 8, border: 'none', background: 'transparent',
                color: C.dim, fontSize: 12, fontFamily: FONT, cursor: 'pointer',
              }}
            >
              إغلاق
            </button>
          )}
        </div>
        <p style={{
          margin: '16px 0 0', fontSize: 11, color: brand.gold, textAlign: 'center', fontWeight: 600,
        }}>
          منصة الياقوت لخدمات التعليم
        </p>
      </div>
    </div>
  );
}
