import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import API from "../services/api";
import spottyLogo from "../assets/spotty-logo.svg";

gsap.registerPlugin(ScrollTrigger);

function Login() {
  const pageRef = useRef(null);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    identifier: "",
    password: "",
    otp: "",
  });
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const steps = [
    {
      id: "1",
      title: "Sign In",
      desc: "Use your campus account securely.",
      icon: "bi-person-badge",
      tint: "from-indigo-500/15 to-indigo-100/40",
      iconBg: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "2",
      title: "Open Map",
      desc: "Browse buildings and floor plans instantly.",
      icon: "bi-geo-alt",
      tint: "from-violet-500/15 to-violet-100/40",
      iconBg: "bg-violet-100 text-violet-700",
    },
    {
      id: "3",
      title: "Drop Pin",
      desc: "Report guards, food, seats, and updates.",
      icon: "bi-pin-map",
      tint: "from-rose-500/15 to-rose-100/40",
      iconBg: "bg-rose-100 text-rose-700",
    },
    {
      id: "4",
      title: "Earn",
      desc: "Gain points and climb the leaderboard.",
      icon: "bi-trophy",
      tint: "from-amber-500/15 to-amber-100/40",
      iconBg: "bg-amber-100 text-amber-700",
    },
  ];
  const reviews = [
    {
      name: "Rahul S.",
      branch: "Computer Science",
      score: "4.9/5",
      badge: "Power User",
      quote: "I save at least 20 minutes every day. The floor-level route guidance is spot on.",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&h=160",
      accent: "from-indigo-500/20 to-violet-500/10",
    },
    {
      name: "Priya M.",
      branch: "Architecture",
      score: "4.8/5",
      badge: "Daily Contributor",
      quote: "The guard and crowd updates are super practical when moving between classes.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160",
      accent: "from-pink-500/20 to-rose-500/10",
    },
    {
      name: "Ananya R.",
      branch: "MBA",
      score: "4.9/5",
      badge: "Top Reporter",
      quote: "Pinned updates make team coordination effortless. The app feels premium and fast.",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&h=160",
      accent: "from-emerald-500/20 to-teal-500/10",
    },
    {
      name: "Karthik N.",
      branch: "Mechanical",
      score: "4.7/5",
      badge: "Explorer",
      quote: "Best part is the live seat/food updates. It avoids unnecessary trips across campus.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160",
      accent: "from-amber-500/20 to-orange-500/10",
    },
    {
      name: "Zara A.",
      branch: "Law",
      score: "4.8/5",
      badge: "Trusted Reviewer",
      quote: "The UI is clean and smooth on mobile. I use it every single day.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160",
      accent: "from-sky-500/20 to-cyan-500/10",
    },
  ];

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setError("");
    if (mode !== "signup") {
      setOtpStage(false);
      setPendingEmail("");
    }
    setLoginModalOpen(true);
  };
  const closeAuthModal = () => {
    setLoginModalOpen(false);
    setError("");
  };

  const processLogin = async (e, mode = authMode) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (mode === "login") {
        if (!form.identifier.trim() || !form.password) {
          setError("Username/email and password are required");
          return;
        }
        const res = await API.post("/auth/login", {
          identifier: form.identifier.trim(),
          password: form.password,
        });
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/dashboard");
        return;
      }

      if (!otpStage) {
        const res = await API.post("/auth/request-otp", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        setPendingEmail(form.email.trim().toLowerCase());
        setOtpStage(true);
        if (res.data?.otpFallback) {
          setError(`Dev OTP: ${res.data.otpFallback}`);
        }
        return;
      }

      const verify = await API.post("/auth/verify-otp", {
        email: pendingEmail,
        otp: form.otp.trim(),
      });
      localStorage.setItem("user", JSON.stringify(verify.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setShowSplash(false);
          setShowAuth(true);
        },
      });

      tl.fromTo(
        ".splash-logo",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.4)" }
      )
        .fromTo(
          ".splash-text",
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.55,
            ease: "power3.out",
          },
          "-=0.35"
        )
        .to(".splash-view", {
          yPercent: -100,
          duration: 0.7,
          ease: "power3.inOut",
          delay: 0.3,
        });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!showAuth || !pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-reveal",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".gsap-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.2,
        }
      );

      gsap.to("#marquee-track", {
        xPercent: -33.33,
        ease: "none",
        duration: 25,
        repeat: -1,
      });

      gsap.from("#step-line", {
        scaleX: 0,
        duration: 1.4,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#section-steps",
          start: "top 70%",
        },
      });

      gsap.fromTo(
        ".gsap-step",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.14,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: "#section-steps",
            start: "top 78%",
            once: true,
          },
        }
      );

      gsap.from(".gsap-pulse-text", {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#section-pulse",
          start: "top 70%",
        },
      });

      gsap.from(".gsap-feed-item", {
        x: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#feed-container",
          start: "top 80%",
        },
      });

      gsap.fromTo(
        ".gsap-review-card",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.12,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: "#reviews",
            start: "top 82%",
            once: true,
          },
        }
      );

      gsap.from(".gsap-cta-content", {
        scale: 0.85,
        opacity: 0,
        duration: 0.9,
        ease: "back.out(1.3)",
        scrollTrigger: {
          trigger: ".gsap-cta-content",
          start: "top 85%",
        },
      });

      gsap.from(".gsap-footer-item", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#site-footer",
          start: "top 85%",
        },
      });
    }, pageRef);

    return () => ctx.revert();
  }, [showAuth]);

  useEffect(() => {
    if (!pageRef.current) return;
    const menu = pageRef.current.querySelector("#mobile-menu");
    if (!menu) return;

    if (mobileMenuOpen) {
      gsap.fromTo(
        menu,
        { scaleY: 0, opacity: 0, transformOrigin: "top" },
        { scaleY: 1, opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(menu, { scaleY: 0, opacity: 0, duration: 0.2, ease: "power2.in" });
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!pageRef.current || !loginModalOpen) return;
    const modal = pageRef.current.querySelector("#login-modal-card");
    if (!modal) return;

    gsap.fromTo(
      modal,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.32, ease: "back.out(1.2)" }
    );
  }, [loginModalOpen]);

  return (
    <div ref={pageRef} className="mesh-gradient min-h-screen text-slate-600 antialiased">
      {showSplash && (
        <div className="splash-view fixed inset-0 z-[100] flex origin-top flex-col items-center justify-center bg-slate-950 text-white">
          <div className="splash-logo relative mb-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/10 shadow-[0_0_60px_rgba(255,255,255,0.1)]">
              <img src={spottyLogo} alt="Spotty Logo" className="h-20 w-20 object-contain drop-shadow-lg" />
            </div>
          </div>
          <div className="overflow-hidden">
            <h1 className="splash-text mb-2 text-center text-5xl font-extrabold tracking-tight">Spotty</h1>
          </div>
          <div className="overflow-hidden">
            <p className="splash-text text-center text-lg font-medium text-slate-400">Presidency University</p>
          </div>
        </div>
      )}

      <div className={`${showAuth ? "flex" : "hidden"} min-h-screen flex-col`}>
        <nav className="sticky top-0 z-40 border-b border-white/20 bg-white/70 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 blur-md" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-3xl border border-indigo-100 bg-white shadow-sm md:h-11 md:w-11">
                  <img src={spottyLogo} alt="Spotty Logo" className="h-7 w-7 object-contain md:h-8 md:w-8" />
                </div>
              </div>
              <div className="leading-tight">
                <span className="block text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">Spotty</span>
                <span className="block text-[10px] font-bold tracking-[0.14em] text-indigo-600 uppercase md:text-[11px]">Campus Navigator</span>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm md:flex">
              <a href="#section-pulse" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-700">Features</a>
              <a href="#section-steps" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-700">How it Works</a>
              <a href="#reviews" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-700">Reviews</a>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="hidden rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:text-white md:inline-flex"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal("login")}
                className="group hidden h-10 w-10 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white md:flex"
                title="Profile"
              >
                <i className="bi bi-person text-base group-hover:scale-110" />
              </button>

              <button onClick={() => setMobileMenuOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 md:hidden">
                <i className={`bi ${mobileMenuOpen ? "bi-x-lg" : "bi-list"} text-lg`} />
              </button>
            </div>
          </div>

          <div
            id="mobile-menu"
            className="absolute top-full left-0 w-full origin-top border-b border-slate-100 bg-white/95 shadow-xl backdrop-blur-md md:hidden"
            style={{ transform: "scaleY(0)", opacity: 0 }}
          >
            <div className="space-y-3 p-4">
              <a href="#section-pulse" className="flex items-center gap-2 rounded-3xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-grid-1x2-fill text-indigo-500" /> Features
              </a>
              <a href="#section-steps" className="flex items-center gap-2 rounded-3xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-signpost-split-fill text-indigo-500" /> How it Works
              </a>
              <a href="#reviews" className="flex items-center gap-2 rounded-3xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setMobileMenuOpen(false)}>
                <i className="bi bi-chat-quote-fill text-indigo-500" /> Reviews
              </a>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
              >
                <i className="bi bi-person-circle" /> Login / Profile
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50" onClick={() => openAuthModal("login")}>
                <i className="bi bi-headset" /> Student Support
              </button>
            </div>
          </div>
        </nav>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden py-12 md:py-24">
          <div className="container relative z-10 mx-auto px-6">
            <div className="flex flex-col items-center gap-10 md:flex-row md:gap-20">
              <div className="w-full text-center md:w-1/2 md:text-left">
                <div className="gsap-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  v2.0 Platform Live
                </div>
                <h1 className="gsap-reveal mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
                  Campus navigation, <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">reimagined.</span>
                </h1>
                <p className="gsap-reveal mx-auto mb-8 max-w-lg text-base leading-relaxed text-slate-500 md:mx-0 md:text-lg">
                  The intelligent map for Presidency University. Locate guards, find empty study spots, and navigate complex building layouts.
                </p>

                <div className="gsap-reveal mx-auto max-w-sm rounded-3xl border border-slate-100 bg-white p-2 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01)] md:mx-0">
                  <form className="flex flex-col gap-2" onSubmit={(e) => processLogin(e, "login")}>
                    <div className="group relative">
                      <i className="bi bi-envelope absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="text"
                        placeholder="Username or Email"
                        required
                        value={form.identifier}
                        onChange={(e) => updateField("identifier", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="group relative">
                      <i className="bi bi-lock absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    {error && <p className="rounded-3xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-900 py-3.5 text-base font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-[1px] hover:shadow-slate-900/30 active:translate-y-[1px] disabled:opacity-70"
                    >
                      {loading ? "Signing In..." : "Sign In"} <i className="bi bi-arrow-right" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setOtpStage(false);
                        setPendingEmail("");
                        openAuthModal("signup");
                        setError("");
                      }}
                      className="rounded-3xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Create Account with OTP
                    </button>
                  </form>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-lg md:mx-0 md:w-1/2">
                <div className="gsap-reveal absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 blur-[60px] md:blur-[80px]" />

                <div className="relative min-h-[300px] md:min-h-[400px]">
                  <div className="gsap-card glass-panel absolute top-0 right-0 left-10 z-10 w-56 rotate-6 rounded-3xl border-l-4 border-l-violet-500/50 p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] md:left-auto md:w-64 md:p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100" className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm md:h-10 md:w-10" alt="Guard" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Guard Alert</div>
                        <div className="text-[10px] text-slate-500">2 min ago • Main Block</div>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-2/3 rounded-full bg-indigo-600" />
                    </div>
                  </div>

                  <div className="gsap-card absolute top-16 left-0 z-20 w-64 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01)] md:top-20 md:left-4 md:w-72 md:p-6">
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 md:text-base">Explorer Rank</h3>
                        <p className="text-xs text-slate-500">Weekly Leaderboard</p>
                      </div>
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">Top 5%</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">1</div>
                        <div className="flex-1">
                          <div className="mb-1 h-2 w-24 rounded bg-slate-100" />
                          <div className="h-2 w-16 rounded bg-slate-50" />
                        </div>
                        <div className="text-xs font-bold text-indigo-600">1,240 pts</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xs font-bold text-indigo-600">2</div>
                        <div className="flex-1">
                          <div className="mb-1 h-2 w-20 rounded bg-slate-200" />
                          <div className="h-2 w-12 rounded bg-slate-100" />
                        </div>
                        <div className="text-xs font-bold text-slate-900">You</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 overflow-hidden border-y border-slate-800 bg-slate-900 py-4 md:py-5">
          <div id="marquee-track" className="flex select-none items-center gap-8 whitespace-nowrap text-xs font-bold tracking-widest text-slate-300 uppercase md:gap-16 md:text-sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-8 md:gap-16">
                <span className="flex items-center gap-2 md:gap-3">🔴 Live Tracking</span>
                <span className="flex items-center gap-2 md:gap-3">📍 8 Buildings</span>
                <span className="flex items-center gap-2 md:gap-3">👥 500+ Students</span>
                <span className="flex items-center gap-2 md:gap-3">⚡ Real-time</span>
              </div>
            ))}
          </div>
        </div>

        <section id="section-steps" className="relative overflow-hidden bg-white py-12 md:py-24">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_5%,rgba(99,102,241,0.10),transparent_35%),radial-gradient(circle_at_85%_95%,rgba(139,92,246,0.08),transparent_30%)]" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="mb-8 text-center md:mb-16">
              <span className="mb-3 inline-flex items-center gap-2 rounded-3xl border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold tracking-wider text-indigo-700 uppercase md:text-[11px]">
                <i className="bi bi-magic text-xs" />
                Simple Workflow
              </span>
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900 md:mb-4 md:text-4xl">How Spotty Works</h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
                Get from confusion to clarity in four quick actions. Sign in, explore the live map, share campus updates, and earn rewards for useful reports.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-[54px] left-[10%] z-0 hidden h-1 w-[80%] rounded-full bg-gradient-to-r from-indigo-100 via-violet-100 to-amber-100 md:block">
                <div id="step-line" className="h-full w-full origin-left rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
                {steps.map((step) => (
                  <article
                    key={step.id}
                    className={`gsap-step group relative z-10 min-h-[190px] opacity-100 rounded-3xl border border-slate-200 bg-gradient-to-br ${step.tint} p-[1px] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_36px_-22px_rgba(79,70,229,0.45)] md:min-h-[230px] md:rounded-3xl`}
                  >
                    <div className="h-full rounded-[1.75rem] bg-white p-4 text-center md:rounded-[2rem] md:p-6">
                      <div className="mb-2 flex items-center justify-between md:mb-4">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 uppercase md:px-2.5 md:py-1 md:text-[11px]">Step {step.id}</span>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${step.iconBg} shadow-sm md:h-10 md:w-10 md:rounded-full md:text-sm`}>
                          <i className={`bi ${step.icon}`} />
                        </span>
                      </div>
                      <div className="mb-2 flex items-center justify-center md:mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-sm font-bold text-white shadow-md ring-2 ring-indigo-100/60 md:h-14 md:w-14 md:border-4 md:text-lg md:shadow-lg md:ring-4">
                          {step.id}
                        </div>
                      </div>
                      <h3 className="mb-1 text-base font-bold text-slate-900 md:mb-2 md:text-lg">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-slate-500 md:text-sm">{step.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="section-pulse" className="overflow-hidden bg-slate-50 py-16 md:py-24" aria-label="Live Pulse">
          <div className="container mx-auto flex flex-col items-center gap-12 px-6 md:flex-row">
            <div className="w-full md:w-1/3">
              <div className="gsap-pulse-text text-center md:text-left">
                <span className="mb-2 block text-xs font-bold tracking-wider text-emerald-500 uppercase">Live Activity</span>
                <h2 className="mb-6 text-3xl font-extrabold text-slate-900 md:text-4xl">The campus pulse, <br />in real-time.</h2>
                <p className="mb-8 text-sm leading-relaxed text-slate-500 md:text-base">See what's happening across campus right now.</p>
              </div>
            </div>
            <div className="w-full [perspective:1000px] md:w-2/3">
              <div id="feed-container" className="relative grid max-h-[500px] grid-cols-1 gap-4 overflow-hidden p-4 [transform:rotateX(10deg)_rotateY(-10deg)] md:grid-cols-2">
                {[
                  ["bi-shield-exclamation", "bg-red-100 text-red-600", "Guard at Gate 2", "Reported 2m ago", ""],
                  ["bi-info-circle", "bg-blue-100 text-blue-600", "Library 3rd Floor Quiet", "Reported 5m ago", "md:translate-y-8"],
                  ["bi-cup-hot", "bg-amber-100 text-amber-600", "Canteen Full", "Reported 8m ago", ""],
                  ["bi-star", "bg-purple-100 text-purple-600", "Tech Club Meetup", "Starting in 10m", "md:translate-y-8"],
                ].map(([icon, color, title, time, extra]) => (
                  <div key={title} className={`gsap-feed-item flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-lg ${extra}`}>
                    <div className={`${color} rounded-full p-2`}><i className={`bi ${icon} text-base`} /></div>
                    <div><p className="text-sm font-bold text-slate-900">{title}</p><p className="text-xs text-slate-500">{time}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="border-t border-slate-200 bg-white py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="mb-8 text-center md:mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Student Voices</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 md:text-base">Swipe to explore what students are saying about Spotty.</p>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden w-14 bg-gradient-to-r from-white to-transparent md:block" />
              <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden w-14 bg-gradient-to-l from-white to-transparent md:block" />
              <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3">
                {reviews.map((review) => (
                  <article
                    key={review.name}
                    className={`gsap-review-card group min-h-[220px] min-w-[290px] snap-start opacity-100 rounded-3xl border border-slate-200 bg-gradient-to-br ${review.accent} p-[1px] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_40px_-20px_rgba(79,70,229,0.45)] md:min-h-[250px] md:min-w-[360px]`}
                  >
                    <div className="h-full rounded-[calc(1.5rem-1px)] bg-white p-5 md:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} alt={review.name} className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 md:text-base">{review.name}</h4>
                            <p className="text-xs text-slate-500">{review.branch}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">{review.badge}</span>
                      </div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <i key={i} className="bi bi-star-fill text-xs" />)}</div>
                        <span className="text-xs font-bold text-slate-700">{review.score}</span>
                      </div>
                      <p className="mb-5 text-sm leading-relaxed text-slate-600 md:text-[15px]">"{review.quote}"</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Verified Student</span>
                        <i className="bi bi-patch-check-fill text-emerald-500" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden bg-slate-900 py-20 text-center md:py-28">
          <div className="absolute inset-0 opacity-20 [background-image:url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="gsap-cta-circle absolute h-[800px] w-[800px] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="container relative z-10 mx-auto px-6">
            <div className="gsap-cta-content mx-auto max-w-2xl">
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-white md:mb-8 md:text-6xl">Ready to navigate smarter?</h2>
              <p className="mx-auto mb-8 max-w-xl text-sm text-slate-300 md:text-base">
                Join the student network and start sharing live campus insights in seconds.
              </p>
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-3xl bg-white px-8 py-4 text-lg font-bold text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-indigo-50"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>

        <footer id="site-footer" className="relative overflow-hidden border-t border-slate-800 bg-slate-950">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.22),transparent_30%)]" />
          <div className="container relative z-10 mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="gsap-footer-item md:col-span-5">
                <div className="mb-4 flex items-center gap-3">
                  <img src={spottyLogo} alt="Spotty Logo" className="h-10 w-10 rounded-3xl bg-white/10 p-1.5" />
                  <div>
                    <p className="text-xl font-extrabold tracking-tight text-white">Spotty</p>
                    <p className="text-xs font-semibold tracking-widest text-indigo-300 uppercase">Campus Navigator</p>
                  </div>
                </div>
                <p className="mb-5 max-w-md text-sm leading-relaxed text-slate-300">
                  Smart indoor navigation for Presidency University with live updates, crowd-sourced pins, and faster building-to-building movement.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    ["bi-instagram", "Instagram"],
                    ["bi-twitter-x", "X"],
                    ["bi-linkedin", "LinkedIn"],
                    ["bi-youtube", "YouTube"],
                  ].map(([icon, label]) => (
                    <a key={label} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-white" aria-label={label}>
                      <i className={`bi ${icon}`} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="gsap-footer-item md:col-span-3">
                <h3 className="mb-3 text-sm font-bold tracking-wide text-white uppercase">Quick Links</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><a href="#section-steps" className="transition-colors hover:text-white"><i className="bi bi-arrow-right-short mr-1 text-indigo-300" />How it Works</a></li>
                  <li><a href="#section-pulse" className="transition-colors hover:text-white"><i className="bi bi-arrow-right-short mr-1 text-indigo-300" />Live Activity</a></li>
                  <li><a href="#reviews" className="transition-colors hover:text-white"><i className="bi bi-arrow-right-short mr-1 text-indigo-300" />Reviews</a></li>
                  <li><button onClick={() => openAuthModal("login")} className="text-left transition-colors hover:text-white"><i className="bi bi-arrow-right-short mr-1 text-indigo-300" />Get Started</button></li>
                </ul>
              </div>

              <div className="gsap-footer-item md:col-span-4">
                <h3 className="mb-3 text-sm font-bold tracking-wide text-white uppercase">Contact & Support</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-2 rounded-3xl border border-white/10 bg-white/5 p-3">
                    <i className="bi bi-geo-alt mt-0.5 text-indigo-300" />
                    <span>Presidency University, Bengaluru Campus</span>
                  </div>
                  <div className="flex items-start gap-2 rounded-3xl border border-white/10 bg-white/5 p-3">
                    <i className="bi bi-envelope text-indigo-300" />
                    <span>support@spottycampus.app</span>
                  </div>
                  <div className="flex items-start gap-2 rounded-3xl border border-white/10 bg-white/5 p-3">
                    <i className="bi bi-headset text-indigo-300" />
                    <span>Student helpdesk available 8AM to 8PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} Spotty Campus Navigator. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="transition-colors hover:text-white">Privacy</a>
                <a href="#" className="transition-colors hover:text-white">Terms</a>
                <a href="#" className="transition-colors hover:text-white">Status</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={closeAuthModal}>
          <div id="login-modal-card" className="relative w-full max-w-md overflow-hidden rounded-[2.75rem] bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeAuthModal} className="absolute top-6 right-6 z-10 text-slate-400 transition-colors hover:text-slate-600">
              <i className="bi bi-x-lg" />
            </button>

            <div className="relative z-10 mb-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 shadow-sm">
                <img src={spottyLogo} alt="Spotty Logo" className="h-12 w-12 object-contain" />
              </div>
              <h2 className="mb-1 text-2xl font-bold text-slate-900">{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-sm text-slate-500">
                {authMode === "login"
                  ? "Sign in with username/email and password"
                  : otpStage
                    ? `Enter OTP sent to ${pendingEmail}`
                    : "Register with username, email, and password"}
              </p>
              <div className="mx-auto mt-4 inline-flex rounded-3xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setOtpStage(false);
                    setError("");
                  }}
                  className={`rounded-3xl px-4 py-1.5 text-xs font-bold transition ${authMode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setOtpStage(false);
                    setError("");
                  }}
                  className={`rounded-3xl px-4 py-1.5 text-xs font-bold transition ${authMode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form className="relative z-10 space-y-4" onSubmit={processLogin}>
              {authMode === "login" && (
                <>
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-bold tracking-wide text-slate-400 uppercase">Username or Email</label>
                    <div className="group relative">
                      <i className="bi bi-person absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="text"
                        placeholder="e.g. CampusExplorer or mail@spotty.com"
                        required
                        value={form.identifier}
                        onChange={(e) => updateField("identifier", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-bold tracking-wide text-slate-400 uppercase">Password</label>
                    <div className="group relative">
                      <i className="bi bi-lock absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="password"
                        placeholder="Enter password"
                        required
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </>
              )}

              {authMode === "signup" && !otpStage && (
                <>
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-bold tracking-wide text-slate-400 uppercase">Username</label>
                    <div className="group relative">
                      <i className="bi bi-person-badge absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="text"
                        placeholder="e.g. CampusExplorer"
                        required
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-bold tracking-wide text-slate-400 uppercase">Email</label>
                    <div className="group relative">
                      <i className="bi bi-envelope absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="email"
                        placeholder="you@university.edu"
                        required
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-bold tracking-wide text-slate-400 uppercase">Password</label>
                    <div className="group relative">
                      <i className="bi bi-lock absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        required
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </>
              )}

              {authMode === "signup" && otpStage && (
                <div className="space-y-1">
                  <label className="ml-1 text-xs font-bold tracking-wide text-slate-400 uppercase">Email OTP</label>
                  <div className="group relative">
                    <i className="bi bi-shield-check absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                    <input
                      type="text"
                      placeholder="6-digit OTP"
                      required
                      value={form.otp}
                      onChange={(e) => updateField("otp", e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 font-medium tracking-[0.25em] text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              )}
              {error && <p className="rounded-3xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-900 py-3.5 text-base font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.01] hover:shadow-slate-900/30">
                {loading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign In"
                    : otpStage
                      ? "Verify OTP"
                      : "Send OTP"}
                <i className="bi bi-arrow-right" />
              </button>
              {authMode === "signup" && otpStage && (
                <button
                  type="button"
                  onClick={() => setOtpStage(false)}
                  className="w-full rounded-3xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Edit Signup Details
                </button>
              )}
            </form>

            <div className="pointer-events-none absolute top-0 left-0 h-32 w-full bg-gradient-to-b from-indigo-50/50 to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
