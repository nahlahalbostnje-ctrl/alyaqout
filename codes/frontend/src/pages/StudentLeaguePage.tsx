import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchLeagues, joinLeague, fetchLeagueDetail, clearActiveLeague,
  type League,
} from '../features/student/leagueSlice';
import StudentLayout from '../components/StudentLayout';

const font = { fontFamily: "'Cairo', sans-serif" };

function StatusBadge({ status }: { status: League['status'] }) {
  if (status === 'active')  return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">جارٍ الآن</span>;
  if (status === 'pending') return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">قريباً</span>;
  return <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-semibold">منتهٍ</span>;
}

function TypeBadge({ type }: { type: League['type'] }) {
  if (type === '1v1') return <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold border border-red-100">⚔️ 1v1</span>;
  return <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold border border-purple-100">👥 جماعي</span>;
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
}

const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function StudentLeaguePage() {
  const dispatch = useAppDispatch();
  const { leagues, activeLeague, loading, error } = useAppSelector((s) => s.league);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchLeagues());
    return () => { dispatch(clearActiveLeague()); };
  }, [dispatch]);

  const handleJoin = async (leagueId: number) => {
    setJoiningId(leagueId);
    setJoinError(null);
    const res = await dispatch(joinLeague(leagueId));
    if (joinLeague.rejected.match(res)) {
      setJoinError(res.payload as string);
    }
    setJoiningId(null);
  };

  const handleOpen = (leagueId: number) => {
    dispatch(fetchLeagueDetail(leagueId));
  };

  return (
    <StudentLayout>
      <div className="p-7 min-h-screen" style={{ background: '#f5f4ff' }}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1" style={font}>دوري ياقوت</p>
          <h1 className="text-slate-800 font-black" style={{ fontSize: '1.75rem', ...font }}>دوري ياقوت</h1>
          <p className="text-slate-400 text-sm mt-1" style={font}>تنافس مع طلاب بلدك واكسب نقاطاً أكثر</p>
        </div>

        {joinError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl" style={font}>
            {joinError}
          </div>
        )}

        {loading && !activeLeague && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm" style={font}>{error}</div>
        )}

        {/* League Detail Modal */}
        {activeLeague && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={activeLeague.league.status} />
                      <TypeBadge type={activeLeague.league.type} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mt-2" style={font}>{activeLeague.league.name}</h2>
                    <p className="text-xs text-slate-400 mt-1" style={font}>
                      {formatDate(activeLeague.league.starts_at)} — {formatDate(activeLeague.league.ends_at)}
                    </p>
                  </div>
                  <button onClick={() => dispatch(clearActiveLeague())}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 flex-shrink-0 transition">
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <span className="text-xs text-slate-500" style={font}>
                    👥 {activeLeague.league.participants_count} مشارك
                    {activeLeague.league.max_participants && ` / ${activeLeague.league.max_participants}`}
                  </span>
                  {!activeLeague.league.i_joined && activeLeague.league.status !== 'ended' && (
                    <button
                      onClick={() => handleJoin(activeLeague.league.id)}
                      disabled={!!joiningId}
                      className="mr-auto text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      style={font}
                    >
                      {joiningId === activeLeague.league.id ? 'جاري...' : 'انضم للدوري'}
                    </button>
                  )}
                  {activeLeague.league.i_joined && (
                    <span className="mr-auto text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-lg" style={font}>✓ مشارك</span>
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="overflow-y-auto flex-1 p-4">
                {activeLeague.leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-2">🏁</p>
                    <p className="text-slate-400 text-sm" style={font}>لا يوجد مشاركون بعد</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeLeague.leaderboard.map((entry) => (
                      <div key={entry.student_id}
                        className="flex items-center gap-3 p-3 rounded-2xl transition"
                        style={{
                          background: entry.is_me ? 'linear-gradient(135deg, #ede9fe, #ddd6fe)' : '#f9fafb',
                          border:     entry.is_me ? '1.5px solid #7c3aed' : '1px solid #f3f4f6',
                        }}>
                        <div className="w-9 text-center flex-shrink-0">
                          {medals[entry.rank]
                            ? <span className="text-xl">{medals[entry.rank]}</span>
                            : <span className="font-black text-slate-400 text-sm" style={font}>#{entry.rank}</span>}
                        </div>
                        <p className="flex-1 font-bold text-sm truncate"
                          style={{ color: entry.is_me ? '#5b21b6' : '#1e293b', ...font }}>
                          {entry.name}
                          {entry.is_me && <span className="text-xs text-purple-400 mr-1">(أنت)</span>}
                        </p>
                        <div className="text-left">
                          <p className="font-black text-base" style={{ color: entry.is_me ? '#7c3aed' : '#374151', ...font }}>
                            {entry.score}
                          </p>
                          <p className="text-xs text-slate-400" style={font}>نقطة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leagues List */}
        {!loading && leagues.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-white" style={{ border: '1px solid #ede9fe' }}>
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-slate-600 font-bold text-base" style={font}>لا توجد دوريات متاحة حالياً</p>
            <p className="text-slate-400 text-sm mt-1" style={font}>تابع الإعلانات لمعرفة الدوريات القادمة</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map((league) => (
            <div key={league.id}
              className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all"
              style={{ border: league.i_joined ? '1.5px solid #7c3aed' : '1px solid #ede9fe' }}
              onClick={() => handleOpen(league.id)}>

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={league.status} />
                  <TypeBadge type={league.type} />
                  {league.i_joined && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">مشارك ✓</span>
                  )}
                </div>
              </div>

              <h3 className="font-black text-slate-800 text-base mb-2" style={font}>{league.name}</h3>

              <div className="flex flex-wrap gap-3 text-xs text-slate-400" style={font}>
                <span>👥 {league.participants_count} مشارك{league.max_participants ? ` / ${league.max_participants}` : ''}</span>
                {league.starts_at && <span>📅 {formatDate(league.starts_at)}</span>}
                {league.ends_at   && <span>🏁 {formatDate(league.ends_at)}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpen(league.id); }}
                  className="text-xs text-purple-600 font-bold hover:text-purple-800 transition"
                  style={font}
                >
                  عرض الترتيب ←
                </button>

                {!league.i_joined && league.status !== 'ended' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleJoin(league.id); }}
                    disabled={joiningId === league.id}
                    className="text-xs bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    style={font}
                  >
                    {joiningId === league.id ? '...' : 'انضم'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </StudentLayout>
  );
}
