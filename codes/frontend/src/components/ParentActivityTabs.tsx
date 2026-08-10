import { useNavigate } from 'react-router-dom';
import { C } from '../theme/palette';

/** تبويبات موحّدة لدمج دوري الآباء والتحديات تحت أيقونة واحدة */
export default function ParentActivityTabs({ active }: { active: 'league' | 'challenges' }) {
  const navigate = useNavigate();

  const btn = (key: 'league' | 'challenges', label: string, to: string) => {
    const on = active === key;
    return (
      <button
        type="button"
        onClick={() => navigate(to)}
        style={{
          flex: 1,
          padding: '10px 12px',
          borderRadius: 12,
          border: on ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
          background: on ? C.goldBg : C.card,
          color: on ? C.primary : C.text,
          fontWeight: on ? 800 : 600,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: "'Cairo',sans-serif",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {btn('league', 'الدوري', '/parent/league')}
      {btn('challenges', 'التحديات', '/parent/challenges')}
    </div>
  );
}
