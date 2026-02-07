import { useLocation, useNavigate } from "react-router-dom";

const ITEMS = [
  { key: "home", label: "Home", icon: "bi-house-fill", path: "/dashboard" },
  { key: "pins", label: "Pins", icon: "bi-pin-map-fill", path: "/pins" },
  { key: "chat", label: "Chat", icon: "bi-chat-dots-fill", path: "/chat" },
  { key: "board", label: "Board", icon: "bi-bar-chart-fill", path: "/leaderboard" },
];

function BottomDock() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-[94%] max-w-lg -translate-x-1/2">
      <div className="relative overflow-hidden rounded-t-[2rem] border border-white/60 bg-white/82 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_8px_22px_-18px_rgba(51,65,85,0.28)] backdrop-blur-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06),transparent_62%)]" />
        <div className="relative grid grid-cols-4 gap-1">
          {ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`group inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-900/95 text-white shadow-[0_8px_20px_-15px_rgba(15,23,42,0.55)]"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                <i className={`bi ${item.icon} text-base ${active ? "text-indigo-300" : "text-slate-500 group-hover:text-indigo-600"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BottomDock;
