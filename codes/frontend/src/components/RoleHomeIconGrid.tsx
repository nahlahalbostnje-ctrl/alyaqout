import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme/palette';

export type RoleIconNavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  icon: string;
  emoji?: string;
};

type Props = {
  items: RoleIconNavItem[];
  title?: string;
  excludeTo?: string;
  /** عدد أعمدة على الديسكتوب */
  columns?: number;
  /**
   * emoji = ثيم الوصول السريع للطالب (إيموجي ملون بدون دائرة ذهبية)
   * svg = الافتراضي للأدوار الأخرى
   */
  variant?: 'svg' | 'emoji';
};

export default function RoleHomeIconGrid({
  items,
  title = 'الخدمات',
  excludeTo,
  columns,
  variant = 'svg',
}: Props) {
  const navigate = useNavigate();
  const list = excludeTo ? items.filter((i) => i.to !== excludeTo) : items;
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (list.length === 0) return null;

  const useEmoji = variant === 'emoji';

  let colCount: number | null = columns ?? null;
  if (colCount) {
    if (width < 520) colCount = Math.min(colCount, 3);
    else if (width < 900) colCount = Math.min(colCount, 4);
  }

  const gridCols = colCount
    ? `repeat(${colCount}, minmax(0, 1fr))`
    : 'repeat(auto-fill, minmax(88px, 1fr))';

  return (
    <section style={{ marginTop: 4 }}>
      <p style={{
        margin: '0 0 12px', color: C.text, fontSize: useEmoji ? 15 : 16, fontWeight: useEmoji ? 800 : 700, lineHeight: 1.4,
        fontFamily: "'Cairo',sans-serif",
      }}>
        {title}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: useEmoji ? 8 : 10 }}>
        {list.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: useEmoji ? 6 : 8,
              padding: useEmoji ? '12px 4px' : '14px 8px',
              borderRadius: useEmoji ? 16 : 14,
              border: `1px solid ${C.border}`,
              background: useEmoji ? C.bg : C.card,
              cursor: 'pointer',
              fontFamily: "'Cairo',sans-serif",
              minHeight: useEmoji ? 76 : 88,
            }}
          >
            {useEmoji && item.emoji ? (
              <span style={{ fontSize: 22, lineHeight: 1 }}>{item.emoji}</span>
            ) : (
              <span style={{
                width: 42, height: 42, borderRadius: 12, background: C.goldBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary,
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </span>
            )}
            <span style={{
              color: C.text,
              fontSize: useEmoji ? 10.5 : 11,
              fontWeight: useEmoji ? 700 : 600,
              lineHeight: 1.25,
              textAlign: 'center',
            }}>
              {item.shortLabel ?? item.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
