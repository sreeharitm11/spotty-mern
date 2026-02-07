import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import usePageMotion from "../hooks/usePageMotion";
import UserMenu from "../components/UserMenu";
import BottomDock from "../components/BottomDock";

const defaultRoom = "global";

const roomFromSelection = (type, buildingId, floor) => {
  if (type === "global") return "global";
  return `building-${buildingId}-floor-${floor}`;
};

function Chat() {
  const pageRef = useRef(null);
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  usePageMotion(pageRef);

  const [roomType, setRoomType] = useState("global");
  const [buildingId, setBuildingId] = useState(1);
  const [floor, setFloor] = useState(1);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [livePoints, setLivePoints] = useState(null);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const room = useMemo(() => roomFromSelection(roomType, buildingId, floor), [roomType, buildingId, floor]);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const socketUrl = import.meta.env.VITE_SOCKET_URL || apiBase.replace(/\/api\/?$/, "");

  useEffect(() => {
    if (!user?.name) {
      navigate("/");
      return;
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.emit("chat:join", { room });

    socket.on("chat:new", (msg) => {
      if (msg.room !== room) return;
      setMessages((prev) => [...prev, msg].slice(-100));
      if (msg.senderName === user.name && Number.isFinite(msg.points)) {
        setLivePoints(msg.points);
        try {
          const updated = { ...user, points: msg.points };
          localStorage.setItem("user", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      socket.emit("chat:leave", { room });
      socket.disconnect();
    };
  }, [room, socketUrl]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError("");
        const res = await API.get(`/chat/messages?room=${encodeURIComponent(room)}&limit=80`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chat");
      }
    };
    loadHistory();
  }, [room]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!socketRef.current || !text.trim() || !user?.name) return;
    setSending(true);
    setError("");
    const payload = { room, text: text.trim(), senderName: user.name };
    socketRef.current.emit("chat:send", payload, (ack) => {
      setSending(false);
      if (!ack?.ok) {
        setError(ack?.message || "Unable to send message");
        return;
      }
      setText("");
      if (Number.isFinite(ack?.points)) {
        setLivePoints(ack.points);
      }
    });
  };

  const points = Number(livePoints ?? user?.points ?? 0);

  return (
    <div ref={pageRef} className="min-h-screen pb-36 page-bg orb-bg md:pb-32">
      <header data-anim="nav" className="glass-panel sticky top-0 z-20 border-x-0 border-t-0 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-3xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Back"
            >
              <i className="bi bi-arrow-left" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Community</p>
              <h1 className="text-xl font-extrabold text-slate-900">Live Chatroom</h1>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <section className="premium-card rounded-3xl p-5 sm:p-6">
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Room</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{room}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Your Points</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-700">{points}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Rule</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">+1 point per valid message</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Anti-spam</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">30s cooldown, daily cap 30</p>
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Room Type</span>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="global">Global</option>
                <option value="building">Building/Floor</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Building</span>
              <input
                type="number"
                value={buildingId}
                onChange={(e) => setBuildingId(Number(e.target.value))}
                disabled={roomType === "global"}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Floor</span>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                disabled={roomType === "global"}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
              />
            </label>
          </div>

          {error && <p className="mb-3 rounded-3xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div ref={listRef} className="mb-3 h-[46vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-slate-500">No messages yet. Start the conversation.</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => {
                  const mine = msg.senderName === user?.name;
                  return (
                    <article
                      key={msg._id || `${msg.senderName}-${msg.createdAt}-${msg.text.slice(0, 8)}`}
                      className={`rounded-2xl border px-3 py-2 ${mine ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{msg.senderName}</p>
                        <p className="text-[11px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <p className="text-sm text-slate-800">{msg.text}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              maxLength={280}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
            <button type="submit" disabled={sending || !text.trim()} className="gradient-btn rounded-3xl px-4 py-3 font-bold text-white disabled:opacity-70">
              <i className="bi bi-send mr-1" />
              {sending ? "Sending" : "Send"}
            </button>
          </form>
        </section>
      </main>

      <div data-anim="stagger">
        <BottomDock />
      </div>
    </div>
  );
}

export default Chat;
