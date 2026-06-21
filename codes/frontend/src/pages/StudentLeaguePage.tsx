import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchLeagues, joinLeague, fetchLeagueDetail, clearActiveLeague,
  type League,
} from '../features/student/leagueSlice';
import StudentLayout from '../components/StudentLayout';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  goldL:  '#DDAD50',
  dimTxt: '#9CA3AF',
};

const font = { fontFamily: "'Cairo', sans-serif" };

function StatusBadge({ status }: { status: League['status'] }) {
  if (status === 'active')  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>جارٍ الآن</span>;
  if (status === 'pending') return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>قريباً</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>منتهٍ</span>;
}

function TypeBadge({ type }: { type: League['type'] }) {
  if (type === '1v1') return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>⚔️ 1v1</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>👥 جماعي</span>;
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
    setJoiningId(leagueId); setJoinError(null);
    const res = await dispatch(joinLeague(leagueId));
    if (joinLeague.rejected.match(res)) setJoinError(res.payload as string);
    setJoiningId(null);
  };

  const handleOpen = (leagueId: number) => { dispatch(fetchLeagueDetail(leagueId)); };

  return (
    <StudentLayout>
      <div className="p-7 min-h-screen" style={{ ...font, background: '#F5EDD8' }}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: DK.gold }}>دوري ياقوت</p>
          <h1 className="font-black" style={{ fontSize: '1.75rem', color: '#1B2038' }}>دوري ياقوت</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>تنافس مع طلاب بلدك واكسب نقاطاً أكثر</p>
        </div>

        {joinError && (
          <div className="mb-4 text-sm px-4 py-3 rounded-xl" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {joinError}
          </div>
        )}
        {error && (
          <div className="text-sm px-4 py-3 rounded-xl" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{error}</div>
        )}

        {loading && !activeLeague && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        )}

        {/* League Detail Modal */}
        {activeLeague && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(27,32,56,0.6)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col rounded-3xl"
              style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
              {/* Modal Header */}
              <div className="p-6" style={{ borderBottom: '1px solid #EDE3CE' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={activeLeague.league.status} />
                      <TypeBadge type={activeLeague.league.type} />
                    </div>
                    <h2 className="text-xl font-black mt-2" style={{ color: '#1B2038' }}>{activeLeague.league.name}</h2>
                    <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>
                      {formatDate(activeLeague.league.starts_at)} — {formatDate(activeLeague.league.ends_at)}
                    </p>
                  </div>
                  <button onClick={() => dispatch(clearActiveLeague())}
                    className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition"
                    style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #EDE3CE' }}>
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <span className="text-xs" style={{ color: DK.dimTxt }}>
                    👥 {activeLeague.league.participants_count} مشارك
                    {activeLeague.league.max_participants && ` / ${activeLeague.league.max_participants}`}
                  </span>
                  {!activeLeague.league.i_joined && activeLeague.league.status !== 'ended' && (
                    <button onClick={() => handleJoin(activeLeague.league.id)} disabled={!!joiningId}
                      className="mr-auto text-sm px-4 py-1.5 rounded-lg transition disabled:opacity-50 font-semibold"
                      style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                      {joiningId === activeLeague.league.id ? 'جاري...' : 'انضم للدوري'}
                    </button>
                  )}
                  {activeLeague.league.i_joined && (
                    <span className="mr-auto text-xs font-semibold px-3 py-1 rounded-lg"
                      style={{ color: '#10B981', background: 'rgba(16,185,129,0.08)' }}>✓ مشارك</span>
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="overflow-y-auto flex-1 p-4">
                {activeLeague.leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-2">🏁</p>
                    <p className="text-sm" style={{ color: DK.dimTxt }}>لا يوجد مشاركون بعد</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeLeague.leaderboard.map((entry) => (
                      <div key={entry.student_id} className="flex items-center gap-3 p-3 rounded-2xl transition"
                        style={entry.is_me
                          ? { background: 'rgba(201,149,42,0.08)', border: '1.5px solid rgba(201,149,42,0.3)' }
                          : { background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                        <div className="w-9 text-center flex-shrink-0">
                          {medals[entry.rank]
                            ? <span className="text-xl">{medals[entry.rank]}</span>
                            : <span className="font-black text-sm" style={{ color: DK.dimTxt }}>#{entry.rank}</span>}
                        </div>
                        <p className="flex-1 font-bold text-sm truncate" style={{ color: entry.is_me ? DK.gold : '#1B2038' }}>
                          {entry.name}
                          {entry.is_me && <span className="text-xs mr-1" style={{ color: DK.dimTxt }}>(أنت)</span>}
                        </p>
                        <div className="text-left">
                          <p className="font-black text-base" style={{ color: entry.is_me ? DK.gold : '#1B2038' }}>{entry.score}</p>
                          <p className="text-xs" style={{ color: DK.dimTxt }}>نقطة</p>
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
          <div className="text-center py-16 rounded-3xl" style={DK.card}>
            <p className="text-5xl mb-4">🏆</p>
            <p className="font-bold text-base" style={{ color: '#1B2038' }}>لا توجد دوريات متاحة حالياً</p>
            <p className="text-sm mt-1" style={{ color: DK.dimTxt }}>تابع الإعلانات لمعرفة الدوريات القادمة</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map((league) => (
            <div key={league.id} className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
              style={league.i_joined
                ? { background: '#FFFFFF', border: '1.5px solid rgba(201,149,42,0.4)', boxShadow: '0 4px 20px rgba(201,149,42,0.08)' }
                : { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
              onClick={() => handleOpen(league.id)}>

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={league.status} />
                  <TypeBadge type={league.type} />
                  {league.i_joined && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>مشارك ✓</span>
                  )}
                </div>
              </div>

              <h3 className="font-black text-base mb-2" style={{ color: '#1B2038' }}>{league.name}</h3>

              <div className="flex flex-wrap gap-3 text-xs" style={{ color: DK.dimTxt }}>
                <span>👥 {league.participants_count} مشارك{league.max_participants ? ` / ${league.max_participants}` : ''}</span>
                {league.starts_at && <span>📅 {formatDate(league.starts_at)}</span>}
                {league.ends_at   && <span>🏁 {formatDate(league.ends_at)}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={(e) => { e.stopPropagation(); handleOpen(league.id); }}
                  className="text-xs font-bold transition" style={{ color: DK.gold }}>
                  عرض الترتيب ←
                </button>

                {!league.i_joined && league.status !== 'ended' && (
                  <button onClick={(e) => { e.stopPropagation(); handleJoin(league.id); }}
                    disabled={joiningId === league.id}
                    className="text-xs px-4 py-1.5 rounded-lg transition disabled:opacity-50 font-semibold"
                    style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
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
