import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { C } from '../theme/palette';

type Props = {
  profilePath: string;
  roleLabel?: string;
  /** Show full name next to avatar (desktop) */
  showName?: boolean;
  /** Compact trigger (avatar only) */
  compact?: boolean;
  /** Override accent for avatar gradient */
  avatarGradient?: string;
  /** Optional name prefix e.g. "أ. " */
  namePrefix?: string;
  /** Extra class/style on trigger */
  triggerStyle?: CSSProperties;
  /** Hide chevron */
  hideChevron?: boolean;
  /** Align dropdown to the right edge (LTR left in RTL = start) */
  menuAlign?: 'start' | 'end';
  children?: ReactNode;
};

function initialsOf(name?: string | null, fallback = 'م') {
  if (!name?.trim()) return fallback;
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
}

export default function AccountMenu({
  profilePath,
  roleLabel,
  showName = true,
  compact = false,
  avatarGradient,
  namePrefix = '',
  triggerStyle,
  hideChevron = false,
  menuAlign = 'start',
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = () => setOpen(false);
    const t = window.setTimeout(() => document.addEventListener('click', onDoc), 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('click', onDoc);
    };
  }, [open]);

  const initials = initialsOf(user?.name);
  const grad = avatarGradient ?? C.goldGrad;
  const displayName = `${namePrefix}${user?.name ?? ''}`.trim() || 'حسابي';

  const handleLogout = () => {
    setOpen(false);
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="الحساب"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 0 : 8,
          padding: compact ? 4 : '4px 6px 4px 10px',
          borderRadius: 14,
          border: open ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
          background: open ? C.goldBg : C.card,
          cursor: 'pointer',
          fontFamily: "'Cairo', sans-serif",
          ...triggerStyle,
        }}
      >
        <div
          style={{
            width: compact ? 34 : 36,
            height: compact ? 34 : 36,
            borderRadius: '50%',
            background: grad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 12,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        {showName && !isMobile && !compact && (
          <div style={{ textAlign: 'right', minWidth: 0 }}>
            <p
              style={{
                color: C.text,
                fontWeight: 700,
                fontSize: 12.5,
                margin: 0,
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </p>
            {roleLabel && (
              <p style={{ color: C.primary, fontSize: 10.5, margin: 0 }}>{roleLabel}</p>
            )}
          </div>
        )}
        {!hideChevron && !compact && (
          <span
            style={{
              color: '#9CA3AF',
              fontSize: 10,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          >
            ▼
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [menuAlign === 'end' ? 'right' : 'left']: 0,
            minWidth: 200,
            background: '#fff',
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
            padding: 6,
            zIndex: 70,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate(profilePath);
            }}
            style={itemStyle(C.text)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.goldBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: 15 }}>👤</span>
            الملف الشخصي
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            style={itemStyle('#EF4444')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: 15 }}>🚪</span>
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

function itemStyle(color: string): CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 12px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    textAlign: 'right',
  };
}
