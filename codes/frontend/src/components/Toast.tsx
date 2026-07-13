import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastKind = 'error' | 'success' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  show: (message: string, kind?: ToastKind) => void;
}

type ToastListener = (message: string, kind: ToastKind) => void;

let toastListener: ToastListener | null = null;

/** Imperative toast — usable outside React components/hooks. */
export const toast: ToastApi = {
  show: (message, kind = 'info') => { toastListener?.(String(message || '').trim(), kind); },
  error: (message) => { toastListener?.(String(message || '').trim(), 'error'); },
  success: (message) => { toastListener?.(String(message || '').trim(), 'success'); },
  info: (message) => { toastListener?.(String(message || '').trim(), 'info'); },
};

const ToastContext = createContext<ToastApi>(toast);

const KIND_STYLE: Record<ToastKind, { bg: string; border: string; color: string; icon: string }> = {
  error: {
    bg: 'rgba(239,68,68,0.97)',
    border: 'rgba(185,28,28,0.9)',
    color: '#fff',
    icon: '⚠️',
  },
  success: {
    bg: 'rgba(22,163,74,0.97)',
    border: 'rgba(21,128,61,0.9)',
    color: '#fff',
    icon: '✓',
  },
  info: {
    bg: 'rgba(13,30,58,0.96)',
    border: 'rgba(197,147,65,0.55)',
    color: '#fff',
    icon: 'ℹ️',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const text = String(message || '').trim();
    if (!text) return;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev.slice(-4), { id, kind, message: text }]);
    window.setTimeout(() => dismiss(id), kind === 'error' ? 5500 : 3800);
  }, [dismiss]);

  useEffect(() => {
    toastListener = (message, kind) => show(message, kind);
    return () => { toastListener = null; };
  }, [show]);

  const api = useMemo<ToastApi>(() => ({
    show,
    error: (m) => show(m, 'error'),
    success: (m) => show(m, 'success'),
    info: (m) => show(m, 'info'),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 24,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
          padding: '0 16px',
          direction: 'rtl',
          fontFamily: "'Cairo',sans-serif",
        }}
      >
        {items.map((t) => {
          const st = KIND_STYLE[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              style={{
                pointerEvents: 'auto',
                maxWidth: 440,
                width: '100%',
                background: st.bg,
                border: `1px solid ${st.border}`,
                color: st.color,
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                animation: 'yaqootToastIn 0.22s ease-out',
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>{st.icon}</span>
              <p style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 700, lineHeight: 1.55 }}>
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="إغلاق"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes yaqootToastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
