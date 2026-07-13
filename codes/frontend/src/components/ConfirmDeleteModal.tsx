import type { CSSProperties, ReactNode } from 'react';

const C = {
  card: '#FFFFFF',
  bg: '#F8F5EE',
  text: '#1B2038',
  sub: '#6B7280',
  border: 'rgba(0,0,0,0.08)',
  red: '#EF4444',
};

export interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  itemLabel?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = 'تأكيد الحذف',
  itemLabel,
  message,
  confirmText = 'نعم، احذف',
  cancelText = 'إلغاء',
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Cairo',sans-serif",
    direction: 'rtl',
  };

  return (
    <div style={overlay} onClick={() => { if (!busy) onCancel(); }}>
      <div
        style={{
          background: C.card,
          borderRadius: 20,
          padding: 28,
          width: 420,
          maxWidth: '92vw',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ color: C.text, fontWeight: 900, fontSize: 18, marginBottom: 10 }}>{title}</h2>
        {message ? (
          <div style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>{message}</div>
        ) : (
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            هل أنت متأكد من حذف
            {itemLabel ? (
              <> <strong style={{ color: C.text }}>«{itemLabel}»</strong></>
            ) : (
              ' هذا العنصر'
            )}
            ؟
          </p>
        )}
        <p style={{ color: C.red, fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>
          لا يمكن التراجع عن هذا الإجراء.
        </p>
        {error && (
          <p
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: C.red,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 14,
              textAlign: 'right',
            }}
          >
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg,#DC2626,#EF4444)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 13,
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.7 : 1,
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            {busy ? 'جارٍ الحذف...' : confirmText}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              background: C.bg,
              color: C.sub,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
