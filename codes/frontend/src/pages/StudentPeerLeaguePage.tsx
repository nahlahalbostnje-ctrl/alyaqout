import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchLeagues, joinLeague, fetchLeagueDetail, clearActiveLeague,
  type League,
} from '../features/student/leagueSlice';

const C = {
  bg: '#F2EDE4', card: '#FFFFFF', navy: '#0D1535',
  gold: '#C9952A', goldL: '#DDAD50', goldGrad: 'linear-gradient(135deg,#C9952A 0%,#DDAD50 100%)',
  goldBg: 'rgba(201,149,42,0.09)', goldBdr: 'rgba(201,149,42,0.25)',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: 'rgba(0,0,0,0.07)',
  shadow: '0 2px 14px rgba(0,0,0,0.07)',
  red: '#EF4444', green: '#16A34A',
};
const font = { fontFamily: "'Cairo', sans-serif" };
const medalColor: Record<number, string> = { 1: '#F0D060', 2: '#B0BEC5', 3: '#CD7F32' };

function fDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
}

function StatusBadge({ s }: { s: League['status'] }) {
  const map = { active: ['جارٍ الآن', '#10B981'], pending: ['قريباً', '#F59E0B'], ended: ['منتهٍ', '#9CA3AF'] };
  const [label, color] = map[s] ?? ['—', '#9CA3AF'];
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>{label}</span>
  );
}

/** دوري الزملاء = دوريات الأدمن من نوع 1v1 فقط (نفس نظام leagues). */
export default function StudentPeerLeaguePage() {
  const dispatch = useAppDispatch();
  const { leagues, activeLeague, loading } = useAppSelector((s) => s.league);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [tab, setTab] = useState<'leagues' | 'board'>('leagues');

  useEffect(() => {
    dispatch(fetchLeagues('1v1'));
    return () => { dispatch(clearActiveLeague()); };
  }, [dispatch]);

  const displayLeagues = leagues;

  const handleJoin = async (leagueId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJoiningId(leagueId);
    setJoinError(null);
    const res = await dispatch(joinLeague(leagueId));
    if (joinLeague.rejected.match(res)) setJoinError((res.payload as string) ?? 'تعذّر الانضمام');
    setJoiningId(null);
  };

  const handleOpen = (leagueId: number) => {
    dispatch(fetchLeagueDetail(leagueId));
    setTab('board');
  };

  const board = activeLeague?.league.type === '1v1' ? (activeLeague.leaderboard ?? []) : [];
  const myEntry = board.find((e) => e.is_me);
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  const cardS = {
    background: C.card, borderRadius: 18, padding: '16px',
    boxShadow: C.shadow, border: `1px solid ${C.border}`,
  } as React.CSSProperties;

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{
            background: 'linear-gradient(135deg,#0D1535 0%,#1B2038 60%,#162144 100%)',
            padding: '28px 24px 32px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                }}>⚔️</div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>منازلات فردية</p>
                  <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1, margin: 0 }}>دوري الزملاء</h1>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, maxWidth: 400, margin: 0 }}>
                تحدّى زملاءك في مسابقات 1v1 التي ينشئها أدمن بلدك واكسب نقاط XP
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                {[
                  { icon: '⚔️', val: String(displayLeagues.length), label: 'منازلة متاحة' },
                  { icon: '🔥', val: String(displayLeagues.filter((l) => l.status === 'active').length), label: 'نشطة الآن' },
                  { icon: '⭐', val: myEntry ? `#${myEntry.rank}` : '—', label: 'مركزك' },
                ].map((s) => (
                  <div key={s.label} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, lineHeight: 1, margin: 0 }}>{s.val}</p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, margin: 0 }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 20px 32px' }}>
            <div style={{
              display: 'flex', gap: 6, marginBottom: 18, background: C.card, padding: 5,
              borderRadius: 12, border: `1px solid ${C.border}`, width: 'fit-content',
            }}>
              {[
                { tab: 'leagues' as const, icon: '⚔️', label: 'المنازلات' },
                { tab: 'board' as const, icon: '🏅', label: 'الترتيب' },
              ].map((item) => (
                <button key={item.tab} onClick={() => setTab(item.tab)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9,
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, ...font,
                  background: tab === item.tab ? C.goldGrad : 'transparent',
                  color: tab === item.tab ? '#1B2038' : C.sub,
                }}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>

            {joinError && (
              <div style={{
                marginBottom: 12, padding: '10px 14px', borderRadius: 12,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: C.red, fontSize: 13,
              }}>
                {joinError}
                <button onClick={() => setJoinError(null)} style={{
                  marginRight: 10, background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 16,
                }}>×</button>
              </div>
            )}

            {tab === 'leagues' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ color: C.text, fontWeight: 900, fontSize: 16, margin: 0 }}>منازلات 1v1 المتاحة</h2>
                  <span style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>{displayLeagues.length} منازلة</span>
                </div>

                {loading && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.goldBg}`,
                      borderTopColor: C.gold, animation: 'spin 0.8s linear infinite', margin: '0 auto',
                    }} />
                  </div>
                )}

                {!loading && displayLeagues.length === 0 && (
                  <div style={{ ...cardS, textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>⚔️</div>
                    <p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: '0 0 6px' }}>لا توجد منازلات 1v1 حالياً</p>
                    <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
                      ينشئها أدمن بلدك من «دوري ياقوت» بنوع منازلة فردية ثم يفعّلها
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gap: 12 }}>
                  {displayLeagues.map((lg) => (
                    <div
                      key={lg.id}
                      onClick={() => handleOpen(lg.id)}
                      style={{
                        ...cardS, cursor: 'pointer',
                        borderRight: lg.i_joined ? `4px solid ${C.gold}` : `4px solid transparent`,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <StatusBadge s={lg.status} />
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: 'rgba(239,68,68,0.1)', color: C.red,
                        }}>⚔️ 1v1</span>
                        {lg.i_joined && (
                          <span style={{
                            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: 'rgba(16,185,129,0.1)', color: '#10B981',
                          }}>✓ مشارك</span>
                        )}
                      </div>
                      <h3 style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: '0 0 6px' }}>{lg.name}</h3>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
                        <span style={{ color: C.sub, fontSize: 12 }}>
                          👥 {lg.participants_count}{lg.max_participants ? ` / ${lg.max_participants}` : ''} مشارك
                        </span>
                        {lg.starts_at && <span style={{ color: C.sub, fontSize: 12 }}>📅 {fDate(lg.starts_at)}</span>}
                        {lg.ends_at && <span style={{ color: C.sub, fontSize: 12 }}>🏁 {fDate(lg.ends_at)}</span>}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 12, borderTop: `1px solid ${C.border}`,
                      }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpen(lg.id); }}
                          style={{
                            fontSize: 12, fontWeight: 700, color: C.gold, background: 'none',
                            border: 'none', cursor: 'pointer', ...font,
                          }}
                        >
                          عرض الترتيب
                        </button>
                        {!lg.i_joined && lg.status !== 'ended' ? (
                          <button
                            onClick={(e) => void handleJoin(lg.id, e)}
                            disabled={joiningId === lg.id}
                            style={{
                              padding: '8px 20px', borderRadius: 12, background: C.goldGrad,
                              color: '#1B2038', fontWeight: 800, fontSize: 12, border: 'none',
                              cursor: 'pointer', opacity: joiningId === lg.id ? 0.7 : 1, ...font,
                            }}
                          >
                            {joiningId === lg.id ? 'جاري...' : 'انضم الآن'}
                          </button>
                        ) : lg.i_joined ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>مسجّل</span>
                        ) : (
                          <span style={{ fontSize: 12, color: C.dim }}>منتهٍ</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'board' && (
              <>
                <h2 style={{ color: C.text, fontWeight: 900, fontSize: 16, marginBottom: 14 }}>
                  {activeLeague?.league.type === '1v1'
                    ? `ترتيب: ${activeLeague.league.name}`
                    : 'ترتيب المتنافسين'}
                </h2>
                {board.length === 0 ? (
                  <div style={{ ...cardS, textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🏅</div>
                    <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
                      افتح منازلة من التبويب الأول لعرض الترتيب
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{
                      ...cardS, marginBottom: 14, padding: 20,
                      background: 'linear-gradient(160deg,#0D1535,#1B2038)',
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                        المراكز الثلاثة الأولى
                      </p>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
                        {[1, 0, 2].map((idx) => {
                          const entry = top3[idx];
                          const place = idx === 0 ? 1 : idx === 1 ? 2 : 3;
                          const h = place === 1 ? 56 : place === 2 ? 40 : 28;
                          const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
                          return (
                            <div key={place} style={{ textAlign: 'center', flex: 1, marginBottom: place === 1 ? 12 : 0 }}>
                              <p style={{
                                color: medalColor[place], fontWeight: 900, fontSize: place === 1 ? 13 : 11,
                                marginBottom: 2,
                              }}>{entry?.name ?? '—'}</p>
                              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, margin: 0 }}>
                                {entry?.score?.toLocaleString() ?? '—'} نقطة
                              </p>
                              <div style={{
                                height: h, background: `${medalColor[place]}18`,
                                borderRadius: '8px 8px 0 0', marginTop: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: place === 1 ? 28 : 20,
                              }}>{medals[place as 1 | 2 | 3]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={cardS}>
                      <p style={{ color: C.sub, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>الترتيب الكامل</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(rest.length > 0 ? [...top3, ...rest] : board).map((entry) => (
                          <div key={entry.student_id} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14,
                            background: entry.is_me ? C.goldBg : '#F9FAFB',
                            border: entry.is_me ? `1.5px solid ${C.goldBdr}` : `1px solid ${C.border}`,
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 10,
                              background: entry.is_me ? C.goldGrad : 'rgba(0,0,0,0.05)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <span style={{
                                fontWeight: 900, fontSize: 13,
                                color: entry.is_me ? '#1B2038' : C.sub,
                              }}>#{entry.rank}</span>
                            </div>
                            <p style={{
                              flex: 1, fontWeight: 700, fontSize: 13, margin: 0,
                              color: entry.is_me ? C.gold : C.text,
                            }}>
                              {entry.name}
                              {entry.is_me && <span style={{ fontSize: 10, color: C.sub, marginRight: 6 }}> (أنت)</span>}
                            </p>
                            <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>
                              {entry.score.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}
