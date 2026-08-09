import { useNavigate } from 'react-router-dom';
import { C } from '../theme/palette';

export type RoleIconNavItem = {
  to: string;
  label: string;
  /** تسمية قصيرة تحت الأيقونة */
  shortLabel?: string;
  /** مسار SVG stroke path */
  icon: string;
};

type Props = {
  items: RoleIconNavItem[];
  title?: string;
  /** استبعاد مسار الحالية (مثل الرئيسية) */
  excludeTo?: string;
};

/**
 * شبكة أيقونات موحّدة لرئيسية الأدوار — بدون قوائم «المزيد» النصية.
 */
export default function RoleHomeIconGrid({
  items,
  title = 'الخدمات',
  excludeTo,
}: Props) {
  const navigate = useNavigate();
  const list = excludeTo ? items.filter((i) => i.to !== excludeTo) : items;

  if (list.length === 0) return null;

  return (
    <section style={{ marginTop: 4 }}>
      <p style={{
        margin: '0 0 12px', color: C.text, fontSize: 16, fontWeight: 700, lineHeight: 1.4,
        fontFamily: "'Cairo',sans-serif",
      }}>
        {title}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
        gap: 10,
      }}>
        {list.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '14px 8px',
              borderRadius: 14,
              border: `1px solid ${C.border}`,
              background: C.card,
              cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif",
              minHeight: 88,
            }}
          >
            <span style={{
              width: 42, height: 42, borderRadius: 12, background: C.goldBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary,
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </span>
            <span style={{
              color: C.text, fontSize: 11, fontWeight: 600, lineHeight: 1.3, textAlign: 'center',
            }}>
              {item.shortLabel ?? item.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
