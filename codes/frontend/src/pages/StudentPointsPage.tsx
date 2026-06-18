import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchMyPoints, fetchLeaderboard } from '../features/student/gamificationSlice';
import StudentLayout from '../components/StudentLayout';

const font = { fontFamily: "'Cairo', sans-serif" };

const ACTION_ICONS: Record<string, string> = {
  attend_class:    '🎯',
  submit_homework: '📝',
  submit_exam:     '📋',
  complete_video:  '▶️',
};

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  attend_class:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  submit_homework: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  submit_exam:     { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  complete_video:  { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
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
  const dispatch   = useAppDispatch();
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
      <div className="p-7 min-h-screen" style={{ background: '#f5f4ff' }}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1" style={font}>نقاطي</p>
          <h1 className="text-slate-800 font-black" style={{ fontSize: '1.75rem', ...font }}>نقاطي ومكافآتي</h1>
          <p className="text-slate-400 text-sm mt-1" style={font}>اجمع النقاط وتصدّر قائمة الطلاب</p>
        </div>

        {/* Total Points Card */}
        <div className="relative overflow-hidden rounded-3xl p-7 mb-7"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 60%, #4338ca 100%)', boxShadow: '0 8px 32px rgba(109,40,217,0.3)' }}>
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-2" style={font}>إجمالي نقاطك</p>
              <p className="text-white font-black" style={{ fontSize: '3.5rem', lineHeight: 1, ...font }}>{totalPoints}</p>
              <p className="text-purple-200/70 text-sm mt-1" style={font}>نقطة مكتسبة</p>
            </div>
            {myRank && (
              <div className="text-center rounded-2xl px-5 py-4 bg-white/15 backdrop-blur-sm">
                <p className="text-purple-200/70 text-xs mb-1" style={font}>ترتيبك</p>
                <p className="text-white font-black" style={{ fontSize: '2.5rem', lineHeight: 1, ...font }}>#{myRank}</p>
                <p className="text-purple-200/70 text-xs mt-1" style={font}>في دولتك</p>
              </div>
            )}
          </div>
        </div>

        {/* Points Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {pointsGuide.map((g) => {
            const c = ACTION_COLORS[g.action];
            return (
              <div key={g.action} className="rounded-2xl p-4 text-center"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <p className="text-2xl mb-2">{ACTION_ICONS[g.action]}</p>
                <p className="font-black text-xl" style={{ color: c.text, ...font }}>{g.pts}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: c.text, ...font }}>{g.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(['history', 'leaderboard'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                fontFamily: "'Cairo', sans-serif",
                background: tab === t ? '#7c3aed' : '#fff',
                color:      tab === t ? '#fff'    : '#6b7280',
                border:     tab === t ? 'none'    : '1px solid #e5e7eb',
                boxShadow:  tab === t ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
              }}>
              {t === 'history' ? 'سجل النقاط' : 'لوحة الصدارة'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
          </div>
        )}

        {/* History */}
        {!loading && tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 && (
              <div className="text-center py-12 rounded-2xl bg-white" style={{ border: '1px solid #ede9fe' }}>
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-slate-400 font-semibold text-sm" style={font}>لم تكسب أي نقاط بعد</p>
                <p className="text-slate-300 text-xs mt-1" style={font}>احضر حصة أو سلّم واجب لتبدأ</p>
              </div>
            )}
            {history.map((item, i) => {
              const c = ACTION_COLORS[item.action] ?? { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' };
              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white transition-all hover:shadow-sm"
                  style={{ border: '1px solid #ede9fe' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      {ACTION_ICONS[item.action] ?? '⭐'}
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm" style={font}>{item.label}</p>
                      {item.description && (
                        <p className="text-slate-400 text-xs mt-0.5" style={font}>{item.description}</p>
                      )}
                      <p className="text-slate-300 text-xs mt-0.5" style={font}>{timeAgo(item.earned_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg" style={{ color: c.text, ...font }}>+{item.points}</span>
                    <p className="text-xs text-slate-300" style={font}>نقطة</p>
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
              <div className="text-center py-12 rounded-2xl bg-white" style={{ border: '1px solid #ede9fe' }}>
                <p className="text-slate-400 font-semibold text-sm" style={font}>لا يوجد ترتيب بعد</p>
              </div>
            )}
            {leaderboard.map((entry) => {
              const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
              return (
                <div key={entry.rank}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: entry.is_me ? 'linear-gradient(135deg, #ede9fe, #ddd6fe)' : '#fff',
                    border:     entry.is_me ? '1.5px solid #7c3aed' : '1px solid #ede9fe',
                    boxShadow:  entry.is_me ? '0 4px 16px rgba(124,58,237,0.15)' : 'none',
                  }}>
                  <div className="w-10 text-center flex-shrink-0">
                    {medals[entry.rank]
                      ? <span className="text-2xl">{medals[entry.rank]}</span>
                      : <span className="font-black text-slate-400 text-base" style={font}>#{entry.rank}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: entry.is_me ? '#5b21b6' : '#1e293b', ...font }}>
                      {entry.name} {entry.is_me && <span className="text-xs text-purple-400">(أنت)</span>}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-base" style={{ color: entry.is_me ? '#7c3aed' : '#374151', ...font }}>{entry.points}</p>
                    <p className="text-xs text-slate-400" style={font}>نقطة</p>
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
