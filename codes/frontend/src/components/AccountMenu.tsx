import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { C } from '../theme/palette';

type Props = {
  profilePath: string;
  roleLabel?: string;
  showName?: boolean;
  /** أزرار أيقونات فقط (موبايل / مساحة ضيقة) */
  compact?: boolean;
  avatarGradient?: string;
  namePrefix?: string;
  /** هيدر أفقي (افتراضي) أو فوتر سايدبار عمودي */
  variant?: 'header' | 'sidebar';
  /** متوافق عكسي — غير مستخدم في الأزرار الظاهرة */
  triggerStyle?: CSSProperties;
  hideChevron?: boolean;
  menuAlign?: 'start' | 'end';
};

function initialsOf(name?: string | null) {
  if (!name?.trim()) return 'م';
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
}

const IconUser = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconLogout = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

/**
 * أزرار حساب موحّدة لكل الأدوار: الملف الشخصي + تسجيل الخروج (ظاهرة دائماً).
 * اختيار أبناء ولي الأمر منفصل في الرئيسية ولا يُدمج هنا.
 */
export default function AccountMenu({
  profilePath,
  roleLabel,
  showName = true,
  compact = false,
  avatarGradient,
  namePrefix = '',
  variant = 'header',
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const initials = initialsOf(user?.name);
  const grad = avatarGradient ?? C.goldGrad;
  const displayName = `${namePrefix}${user?.name ?? ''}`.trim() || 'حسابي';
  const iconOnly = variant === 'header' && (compact || isMobile);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (variant === 'sidebar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
          borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: grad, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0,
          }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, color: C.text, fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </p>
            {roleLabel && <p style={{ margin: '2px 0 0', color: C.primary, fontSize: 10.5 }}>{roleLabel}</p>}
          </div>
        </div>
        <button type="button" onClick={() => navigate(profilePath)} style={sidebarBtn(false)}>
          <IconUser size={15} /> الملف الشخصي
        </button>
        <button type="button" onClick={handleLogout} style={sidebarBtn(true)}>
          <IconLogout size={15} /> تسجيل الخروج
        </button>
      </div>
    );
  }

  const btnBase: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: iconOnly ? 6 : 8, flexShrink: 0 }}>
      {showName && !iconOnly && (
        <div style={{ textAlign: 'right', minWidth: 0, maxWidth: 120, marginInlineEnd: 2 }}>
          <p style={{
            color: C.text, fontWeight: 700, fontSize: 12, margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName}
          </p>
          {roleLabel && (
            <p style={{ color: C.primary, fontSize: 10, margin: 0 }}>{roleLabel}</p>
          )}
        </div>
      )}

      <div style={{
        width: iconOnly ? 32 : 34, height: iconOnly ? 32 : 34, borderRadius: '50%',
        background: grad, overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 11,
      }}>
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : initials}
      </div>

      <button
        type="button"
        onClick={() => navigate(profilePath)}
        title="الملف الشخصي"
        style={{
          ...btnBase,
          padding: iconOnly ? 0 : '8px 12px',
          width: iconOnly ? 36 : undefined,
          height: iconOnly ? 36 : undefined,
          border: `1px solid ${C.border}`,
          background: C.bg,
          color: C.text,
        }}
      >
        {iconOnly ? <IconUser /> : <>الملف الشخصي</>}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        title="تسجيل الخروج"
        style={{
          ...btnBase,
          padding: iconOnly ? 0 : '8px 12px',
          width: iconOnly ? 36 : undefined,
          height: iconOnly ? 36 : undefined,
          border: '1px solid rgba(224,122,122,0.4)',
          background: C.redBg,
          color: C.red,
        }}
      >
        {iconOnly ? <IconLogout /> : <>تسجيل الخروج</>}
      </button>
    </div>
  );
}

function sidebarBtn(danger: boolean): CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 12,
    border: danger ? '1px solid rgba(224,122,122,0.35)' : `1px solid ${C.border}`,
    background: danger ? C.redBg : C.card,
    color: danger ? C.red : C.text,
    fontWeight: 700,
    fontSize: 12.5,
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
  };
}
