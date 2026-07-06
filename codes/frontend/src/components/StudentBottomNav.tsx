import { useNavigate } from 'react-router-dom';

export const C = {
  bg:       '#F5EDD8',
  card:     '#FFFFFF',
  navy:     '#0D1535',
  navy2:    '#1B2038',
  gold:     '#C9952A',
  goldL:    '#DDAD50',
  goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:   'rgba(201,149,42,0.09)',
  goldBdr:  'rgba(201,149,42,0.22)',
  text:     '#1B2038',
  sub:      '#6B7280',
  dim:      '#9CA3AF',
  border:   'rgba(0,0,0,0.07)',
  shadow:   '0 2px 12px rgba(0,0,0,0.06)',
  red:      '#DC2626',
  blue:     '#2563EB',
  green:    '#16A34A',
  purple:   '#7C3AED',
  amber:    '#D97706',
};

export const BH = 66;

const NAV = [
  { label: 'الامتحانات',       emoji: '📝', to: '/student/exams' },
  { label: 'الواجبات',          emoji: '📚', to: '/student/homework' },
  { label: 'جدول الحصص',       emoji: '📅', to: '/student/live-classes' },
  { label: 'دوري الياقوت',     emoji: '🏆', to: '/student/league' },
  { label: 'مستوى التطور',     emoji: '📊', to: '/student/report' },
  { label: 'غرفة الطوارئ',     emoji: '🆘', to: '/student/emergency' },
  { label: 'معلمي الذكي',       emoji: '🤖', to: '/student/study-room' },
  { label: 'دوري الزملاء',     emoji: '⚔️', to: '/student/peer-league' },
  { label: 'الرسائل',           emoji: '✉️', to: '/student/messages' },
  { label: 'النتائج',           emoji: '🏅', to: '/student/points' },
  { label: '24/7',              emoji: '🎧', to: '/student/study-24' },
  { label: 'نقاطي',             emoji: '⭐', to: '/student/points' },
  { label: 'تواصل مع المعلم',  emoji: '👨‍🏫', to: '/student/teacher-contact' },
];

export default function StudentBottomNav({ cur = '' }: { cur?: string }) {
  const nav = useNavigate();
  return (
    <div dir="rtl" style={{ position:'fixed', bottom:0, left:0, right:0, height:BH, background:C.card, borderTop:`1px solid ${C.border}`, zIndex:100, display:'flex', alignItems:'center', overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' as 'touch', padding:'0 4px', gap:2 }}>
      {NAV.map((item,i) => {
        const active = item.to === cur;
        return (
          <button key={i} onClick={()=>item.to&&nav(item.to)} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 12px', border:'none', background:'none', cursor:item.to?'pointer':'default', fontFamily:"'Cairo',sans-serif" }}>
            <span style={{ fontSize:21 }}>{item.emoji}</span>
            <span style={{ fontSize:9, fontWeight:active?700:500, color:active?C.gold:C.dim, whiteSpace:'nowrap' }}>{item.label}</span>
            {active&&<div style={{ width:16, height:2.5, borderRadius:2, background:C.goldGrad }} />}
          </button>
        );
      })}
    </div>
  );
}
