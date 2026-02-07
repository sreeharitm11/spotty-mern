import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import usePageMotion from "../hooks/usePageMotion";
import leaderboardIcon from "../assets/icon-leaderboard.svg";
import UserMenu from "../components/UserMenu";
import BottomDock from "../components/BottomDock";

function Leaderboard() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  usePageMotion(pageRef);

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async (silent = false) => {
      try {
        if (!silent) setRefreshing(true);
        setError("");
        const res = await API.get("/users/leaderboard");
        if (!isMounted) return;
        setUsers(res.data);
        setLastUpdated(new Date());
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load leaderboard");
      } finally {
        if (!isMounted) return;
        if (!silent) setRefreshing(false);
      }
    };

    loadLeaderboard();

    const interval = setInterval(() => {
      loadLeaderboard(true);
    }, 10000);

    const onFocus = () => loadLeaderboard(true);
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadLeaderboard(true);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const topThree = users.slice(0, 3);
  const others = users.slice(3);
  const maxPoints = users.length ? Math.max(...users.map((u) => Number(u.points) || 0), 1) : 1;
  const totalPoints = users.reduce((sum, u) => sum + (Number(u.points) || 0), 0);
  const avgPoints = users.length ? Math.round(totalPoints / users.length) : 0;
  const activeUsers = users.filter((u) => (Number(u.points) || 0) > 0).length;
  const topUser = users[0];

  return (
    <div ref={pageRef} className="min-h-screen pb-36 page-bg orb-bg md:pb-32">
      <header data-anim="nav" className="glass-panel sticky top-0 z-20 border-x-0 border-t-0 px-4 py-3 sm:px-6">
        <div data-float="slow" className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-3xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Back"
            >
              <i className="bi bi-arrow-left" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Weekly Ranking</p>
              <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <img src={leaderboardIcon} alt="Leaderboard" className="h-6 w-6" />
                Leaderboard
              </h1>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {error && <p className="mb-4 rounded-3xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "just now"}
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                setRefreshing(true);
                setError("");
                const res = await API.get("/users/leaderboard");
                setUsers(res.data);
                setLastUpdated(new Date());
              } catch (err) {
                setError(err.response?.data?.message || "Failed to refresh leaderboard");
              } finally {
                setRefreshing(false);
              }
            }}
            className="rounded-3xl border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <section data-anim="hero-card" data-speed="1.02" className="premium-card relative overflow-hidden rounded-3xl p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0 z-0 opacity-35">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:26px_26px]" />
            {topThree.map((u, index) => {
              const pct = Math.max(8, Math.round(((Number(u.points) || 0) / maxPoints) * 100));
              const topPos = 26 + index * 18;
              return (
                <div
                  key={`bg-bar-${u._id || u.name}-${index}`}
                  className="absolute left-4 h-3 rounded-full bg-gradient-to-r from-indigo-400/35 to-violet-400/10"
                  style={{ width: `${pct}%`, top: `${topPos}%` }}
                />
              );
            })}
          </div>

          <div className="relative z-10 mb-3 flex items-center gap-3">
            <img src={leaderboardIcon} alt="Top ranking" className="h-12 w-12" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Top Contributors</h2>
          </div>
          <div className="relative z-10 mb-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-4">
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Total Points</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{totalPoints}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-4">
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Active Users</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{activeUsers}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-4">
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Average Score</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{avgPoints}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-4">
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Top User</p>
              <p className="mt-1 truncate text-lg font-extrabold text-slate-900">{topUser?.name || "--"}</p>
            </div>
          </div>

          <div className="relative z-10 mb-6 rounded-3xl border border-slate-200 bg-white/98 p-4">
            <p className="mb-3 text-xs font-bold tracking-wide text-slate-400 uppercase">Live Podium Figure</p>
            <div className="flex h-52 items-end justify-center gap-4">
              {[
                { dataIndex: 1, rank: 2, base: 62, tone: "from-slate-300 to-slate-200" },
                { dataIndex: 0, rank: 1, base: 86, tone: "from-amber-400 to-orange-400" },
                { dataIndex: 2, rank: 3, base: 52, tone: "from-orange-300 to-amber-200" },
              ].map((slot) => {
                const u = topThree[slot.dataIndex];
                const points = Number(u?.points) || 0;
                const pct = Math.max(6, Math.round((points / maxPoints) * 100));
                return (
                  <div key={`pod-rank-${slot.rank}`} className="flex h-full w-24 flex-col items-center justify-end">
                    <div className="mb-1 max-w-[88px] truncate text-xs font-bold text-slate-700">{u?.name || "--"}</div>
                    <div
                      className={`relative w-full overflow-hidden rounded-t-3xl border border-white/30 bg-gradient-to-b ${slot.tone} shadow-lg`}
                      style={{ height: `${slot.base}%`, minHeight: "88px" }}
                    >
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xl font-black text-white">#{slot.rank}</span>
                      <div className="absolute right-2 bottom-2 left-2 h-1.5 rounded-full bg-white/35">
                        <div className="h-1.5 rounded-full bg-white/90 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">{points} pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {topThree.map((u, index) => (
              <article key={u._id || `${u.name}-${index}`} data-anim="stagger" className="lift-card rounded-3xl border border-slate-200 bg-white/95 p-4 backdrop-blur-sm">
                <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">#{index + 1}</div>
                <h3 className="text-lg font-bold text-slate-900">{u.name}</h3>
                <p className="mt-1 text-sm text-slate-500"><i className="bi bi-coin mr-1" />{u.points} points</p>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-700"
                    style={{ width: `${Math.max(8, Math.round(((Number(u.points) || 0) / maxPoints) * 100))}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-4 space-y-2">
          {others.map((u, i) => (
            <div key={u._id || `${u.name}-${i}`} data-anim="stagger" className="lift-card rounded-3xl border border-slate-200 bg-white px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">{i + 4}</span>
                  <span className="font-semibold text-slate-900">{u.name}</span>
                </div>
                <span className="font-bold text-slate-700"><i className="bi bi-coin mr-1" />{u.points}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${Math.max(4, Math.round(((Number(u.points) || 0) / maxPoints) * 100))}%` }}
                />
              </div>
            </div>
          ))}

          {users.length === 0 && <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">No leaderboard data yet.</div>}
        </section>
      </main>

      <div data-anim="stagger">
        <BottomDock />
      </div>
    </div>
  );
}

export default Leaderboard;
