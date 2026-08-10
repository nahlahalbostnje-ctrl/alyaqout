import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme/palette';

export type RoleIconNavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  icon: string;
};

type Props = {
  items: RoleIconNavItem[];
  title?: string;
  excludeTo?: string;
  /** عدد أعمدة على الديسكتوب */
  columns?: number;
};

export default function RoleHomeIconGrid({
  items,
  title = 'الخدمات',
  excludeTo,
  columns,
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
        margin: '0 0 12px', color: C.text, fontSize: 16, fontWeight: 700, lineHeight: 1.4,
        fontFamily: "'Cairo',sans-serif",
      }}>
        {title}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 10 }}>
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
