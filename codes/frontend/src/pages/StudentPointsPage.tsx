import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyPoints, fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';

const DK = {
  gold:   '#f5a623',
  goldL:  '#ffd166',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

const font = { fontFamily: "'Cairo', sans-serif" };

const ACTION_ICONS: Record<string, string> = {
  attend_class:    '🎯',
  submit_homework: '📝',
  submit_exam:     '📋',
  complete_video:  '▶️',
};

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  attend_class:    { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  submit_homework: { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
  submit_exam:     { bg: 'rgba(245,166,35,0.1)',  color: '#f5a623' },
  complete_video:  { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

export default function StudentPointsPage() {
  const dispatch = useAppDispatch();
  const { totalPoints, pointsTable, history, leaderboard, myRank, loading } =
    useAppSelector((s) => s.gamification);

  const [tab, setTab] = useState<'history' | 'leaderboard'>('history');

  useEffect(() => {
    dispatch(fetchMyPoints());
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const pointsGuide = [
    { action: 'attend_class',    label: 'حضور حصة مباشرة', pts: pointsTable.attend_class    ?? 10 },
    { action: 'submit_exam',     label: 'تسليم امتحان',     pts: pointsTable.submit_exam     ?? 15 },
    { action: 'submit_homework', label: 'تسليم واجب',       pts: pointsTable.submit_homework ?? 5  },
    { action: 'complete_video',  label: 'إتمام فيديو',      pts: pointsTable.complete_video  ?? 3  },
  ];

  return (
    <StudentLayout>
      <div className="p-7 min-h-screen" style={{ ...font }}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: DK.gold }}>نقاطي</p>
          <h1 className="font-black text-white" style={{ fontSize: '1.75rem' }}>نقاطي ومكافآتي</h1>
          <p className="text-sm mt-1" style={{ color: DK.dimTxt }}>اجمع النقاط وتصدّر قائمة الطلاب</p>
        </div>

        {/* Total Points Card */}
        <div className="relative overflow-hidden rounded-3xl p-7 mb-7"
          style={{ background: 'linear-gradient(135deg, #f5a623 0%, #d97706 60%, #b45309 100%)', boxShadow: '0 8px 32px rgba(245,166,35,0.25)' }}>
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>إجمالي نقاطك</p>
              <p className="text-white font-black" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{totalPoints}</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>نقطة مكتسبة</p>
            </div>
            {myRank && (
              <div className="text-center rounded-2xl px-5 py-4" style={{ background: 'rgba(4,10,24,0.25)', backdropFilter: 'blur(4px)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ترتيبك</p>
                <p className="text-white font-black" style={{ fontSize: '2.5rem', lineHeight: 1 }}>#{myRank}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>في دولتك</p>
              </div>
            )}
          </div>
        </div>

        {/* Points Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {pointsGuide.map((g) => {
            const c = ACTION_COLORS[g.action] ?? { bg: 'rgba(255,255,255,0.05)', color: DK.dimTxt };
            return (
              <div key={g.action} className="rounded-2xl p-4 text-center"
                style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.1)' }}>
                <p className="text-2xl mb-2">{ACTION_ICONS[g.action]}</p>
                <p className="font-black text-xl" style={{ color: c.color }}>{g.pts}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: DK.dimTxt }}>{g.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(['history', 'leaderboard'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }
                : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(245,166,35,0.15)' }}>
              {t === 'history' ? 'سجل النقاط' : 'لوحة الصدارة'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}

        {/* History */}
        {!loading && tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 && (
              <div className="text-center py-12 rounded-2xl"
                style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.1)' }}>
                <p className="text-4xl mb-3">🏆</p>
                <p className="font-semibold text-sm text-white">لم تكسب أي نقاط بعد</p>
                <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>احضر حصة أو سلّم واجب لتبدأ</p>
              </div>
            )}
            {history.map((item, i) => {
              const c = ACTION_COLORS[item.action] ?? { bg: 'rgba(255,255,255,0.05)', color: DK.dimTxt };
              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: c.bg }}>
                      {ACTION_ICONS[item.action] ?? '⭐'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{item.label}</p>
                      {item.description && (
                        <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{item.description}</p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{timeAgo(item.earned_at)}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-black text-lg" style={{ color: c.color }}>+{item.points}</span>
                    <p className="text-xs" style={{ color: DK.dimTxt }}>نقطة</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard */}
        {!loading && tab === 'leaderboard' && (
          <div className="space-y-2">
            {leaderboard.length === 0 && (
              <div className="text-center py-12 rounded-2xl"
                style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.1)' }}>
                <p className="font-semibold text-sm text-white">لا يوجد ترتيب بعد</p>
              </div>
            )}
            {leaderboard.map((entry) => {
              const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
              return (
                <div key={entry.rank} className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={entry.is_me
                    ? { background: 'rgba(245,166,35,0.1)', border: '1.5px solid rgba(245,166,35,0.4)', boxShadow: '0 4px 16px rgba(245,166,35,0.1)' }
                    : { background: '#070e22', border: '1px solid rgba(245,166,35,0.08)' }}>
                  <div className="w-10 text-center flex-shrink-0">
                    {medals[entry.rank]
                      ? <span className="text-2xl">{medals[entry.rank]}</span>
                      : <span className="font-black text-sm" style={{ color: DK.dimTxt }}>#{entry.rank}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: entry.is_me ? DK.gold : 'rgba(255,255,255,0.9)' }}>
                      {entry.name} {entry.is_me && <span className="text-xs" style={{ color: DK.dimTxt }}>(أنت)</span>}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-base" style={{ color: entry.is_me ? DK.gold : 'rgba(255,255,255,0.8)' }}>{entry.points}</p>
                    <p className="text-xs" style={{ color: DK.dimTxt }}>نقطة</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
