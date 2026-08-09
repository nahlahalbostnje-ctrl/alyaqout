import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme/palette';
import {
  STUDENT_PRIMARY_NAV,
  STUDENT_SECONDARY_NAV,
  typeScale,
  type StudentNavItem,
} from '../features/student/studentNav';

function IconTile({
  item,
  onClick,
}: {
  item: StudentNavItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
        fontFamily: typeScale.font,
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
        color: C.text, fontSize: typeScale.label.fontSize, fontWeight: 600,
        lineHeight: 1.3, textAlign: 'center',
      }}>
        {item.shortLabel}
      </span>
    </button>
  );
}

/** Icon grid under home cards — «المزيد» expands vertically on the same page. */
export default function StudentHomeShortcuts() {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <section style={{ marginTop: 4 }}>
      <p style={{
        margin: '0 0 12px', color: C.text, fontSize: typeScale.h2.fontSize,
        fontWeight: typeScale.h2.fontWeight, lineHeight: typeScale.h2.lineHeight,
      }}>
        اختصارات سريعة
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
        gap: 10,
      }}>
        {STUDENT_PRIMARY_NAV.map((item) => (
          <IconTile key={item.to} item={item} onClick={() => navigate(item.to)} />
        ))}
      </div>

      <div style={{
        marginTop: 14,
        borderTop: `1px solid ${C.border}`,
        paddingTop: 12,
      }}>
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: typeScale.font, color: C.primary, fontWeight: 700, fontSize: 13,
          }}
        >
          <span>{moreOpen ? 'إخفاء المزيد' : 'المزيد من الخدمات'}</span>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {moreOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            paddingBottom: 4,
            borderRight: `3px solid ${C.primarySoft}`,
            paddingInlineStart: 10,
            marginInlineStart: 2,
          }}>
            {STUDENT_SECONDARY_NAV.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 8px', borderRadius: 10, border: 'none',
                  background: C.card, cursor: 'pointer', textAlign: 'right',
                  fontFamily: typeScale.font, color: C.text, fontWeight: 600, fontSize: 13,
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: 9, background: C.bg, color: C.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </span>
                {item.shortLabel}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
