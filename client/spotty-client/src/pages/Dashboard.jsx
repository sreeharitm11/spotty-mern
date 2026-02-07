import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import usePageMotion from "../hooks/usePageMotion";
import spottyLogo from "../assets/spotty-logo.svg";
import pinsIcon from "../assets/icon-pins.svg";
import leaderboardIcon from "../assets/icon-leaderboard.svg";
import dashboardBanner from "../assets/dashboard-banner.svg";
import UserMenu from "../components/UserMenu";
import BottomDock from "../components/BottomDock";
import API from "../services/api";

function Dashboard() {
  const pageRef = useRef(null);
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  usePageMotion(pageRef);
  const [activeMembers, setActiveMembers] = useState(0);
  const [liveGuards, setLiveGuards] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(Number(user?.points) || 0);

  useLayoutEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-anim="dash-chip"]',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.15 }
      );
      gsap.to('[data-anim="hero-glow"]', {
        scale: 1.08,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const points = Number(currentPoints) || 0;

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      try {
        const [membersRes, guardsRes] = await Promise.all([
          API.get("/users/leaderboard"),
          API.get("/guards/live"),
        ]);
        if (!mounted) return;
        const members = Array.isArray(membersRes.data) ? membersRes.data : [];
        const active = members.filter((m) => (Number(m.points) || 0) > 0).length;
        setActiveMembers(active || members.length || 0);
        setLiveGuards(Number(guardsRes.data?.activeGuards) || 0);
        if (user?.name) {
          const me = members.find((m) => String(m.name || "").toLowerCase() === String(user.name).toLowerCase());
          if (me) {
            const nextPoints = Number(me.points) || 0;
            setCurrentPoints(nextPoints);
            try {
              const nextUser = { ...user, points: nextPoints };
              localStorage.setItem("user", JSON.stringify(nextUser));
            } catch {
              // ignore localStorage failures
            }
          }
        }
      } catch {
        if (!mounted) return;
        setActiveMembers(0);
        setLiveGuards(0);
      }
    };

    loadCounts();
    const timer = window.setInterval(loadCounts, 10000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen pb-36 page-bg orb-bg md:pb-32">
      <header data-anim="nav" className="glass-panel sticky top-0 z-20 border-x-0 border-t-0 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={spottyLogo} alt="Spotty logo" className="h-7 w-7 rounded-3xl" />
              <div>
                <p className="text-sm font-bold text-slate-900">Spotty</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Live</p>
              </div>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div data-anim="hero-card" data-speed="1.02" className="premium-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div data-anim="hero-glow" className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-indigo-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Hi {user?.name || "Explorer"}</h1>
              <p className="mt-2 text-slate-500">Choose a module to explore campus activity and report updates.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div data-anim="dash-chip" className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Points</p>
                  <p className="text-xl font-extrabold text-indigo-700">{points}</p>
                </div>
                <div data-anim="dash-chip" className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Active Members</p>
                  <p className="text-xl font-extrabold text-emerald-600">{activeMembers}</p>
                </div>
                <div data-anim="dash-chip" className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Live Guards On Duty</p>
                  <p className="text-xl font-extrabold text-violet-700">{liveGuards}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src={dashboardBanner} alt="Dashboard preview" data-lag="0.15" className="w-full rounded-3xl border border-indigo-100 shadow-lg" />
              <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-bold text-white">
                <i className="bi bi-lightning-charge-fill mr-1 text-amber-300" />
                Real-time
              </div>
            </div>
          </div>

          <div className="section-divider my-7" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link data-anim="stagger" to="/pins" className="group lift-card rounded-3xl border border-slate-200 bg-white p-5 no-underline transition hover:border-indigo-200 hover:shadow-xl">
              <img src={pinsIcon} alt="Pins icon" className="h-10 w-10" />
              <h2 className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-900"><i className="bi bi-geo-alt" />Pins</h2>
              <p className="mt-1 text-sm text-slate-500">View and filter location pins by building and floor.</p>
            </Link>

            <Link data-anim="stagger" to="/chat" className="group lift-card rounded-3xl border border-slate-200 bg-white p-5 no-underline transition hover:border-indigo-200 hover:shadow-xl">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <i className="bi bi-chat-dots-fill text-lg" />
              </div>
              <h2 className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-900"><i className="bi bi-people" />Chatroom</h2>
              <p className="mt-1 text-sm text-slate-500">Join live campus chat and earn points for quality updates.</p>
            </Link>

            <Link data-anim="stagger" to="/leaderboard" className="group lift-card rounded-3xl border border-slate-200 bg-white p-5 no-underline transition hover:border-indigo-200 hover:shadow-xl">
              <img src={leaderboardIcon} alt="Leaderboard icon" className="h-10 w-10" />
              <h2 className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-900"><i className="bi bi-trophy" />Leaderboard</h2>
              <p className="mt-1 text-sm text-slate-500">Track top contributors and points standings.</p>
            </Link>
          </div>
        </div>
      </main>

      <div data-anim="stagger">
        <BottomDock />
      </div>
    </div>
  );
}

export default Dashboard;
