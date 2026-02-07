import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function UserMenu() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(readUser());

  useEffect(() => {
    const onStorage = () => setUser(readUser());
    const onDocClick = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const initials = useMemo(() => (user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"), [user?.name]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {initials}
        </span>
        <span className="max-w-24 truncate">{user?.name || "Guest"}</span>
        <i className={`bi bi-chevron-${open ? "up" : "down"} text-xs text-slate-500`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Profile</p>
            <p className="mt-1 truncate text-base font-bold text-slate-900">{user?.name || "Guest User"}</p>
            <p className="truncate text-sm text-slate-500">{user?.email || "No email"}</p>
            <p className="mt-2 text-xs font-semibold text-indigo-600">
              <i className="bi bi-coin mr-1" />
              {Number(user?.points) || 0} points
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-2xl border border-slate-200 px-2 py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              <i className="bi bi-house mr-1" />
              Home
            </Link>
            <Link to="/pins" onClick={() => setOpen(false)} className="rounded-2xl border border-slate-200 px-2 py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              <i className="bi bi-pin-map mr-1" />
              Pins
            </Link>
            <Link to="/leaderboard" onClick={() => setOpen(false)} className="rounded-2xl border border-slate-200 px-2 py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              <i className="bi bi-bar-chart mr-1" />
              Board
            </Link>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            <i className="bi bi-box-arrow-right" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
