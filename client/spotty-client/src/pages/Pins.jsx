import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import usePageMotion from "../hooks/usePageMotion";
import pinsIcon from "../assets/icon-pins.svg";
import UserMenu from "../components/UserMenu";
import BottomDock from "../components/BottomDock";

function Pins() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapApiRef = useRef(null);
  const markerRefs = useRef([]);
  const [buildingId, setBuildingId] = useState(1);
  const [floor, setFloor] = useState(1);
  const [pins, setPins] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [mapBooting, setMapBooting] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [mapTilt, setMapTilt] = useState(55);
  const [mapHeading, setMapHeading] = useState(20);
  const [liveGuards, setLiveGuards] = useState([]);
  const [selectedGuardCode, setSelectedGuardCode] = useState("G-01");
  const [selectedGuardName, setSelectedGuardName] = useState("Guard 01");
  const [viewMode, setViewMode] = useState("map");
  usePageMotion(pageRef);
  const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_KEY;
  // Presidency University, Rajanukunte/Yelahanka campus (Bengaluru)
  const CAMPUS_CENTER = { lat: 13.1693, lng: 77.5348 };
  const VIRTUAL_TOUR_URL = "https://www.immersivetourz.com/presidencyuniversity/index.html";
  const guardPinsCount = liveGuards.length;
  const infoPinsCount = pins.filter((pin) => pin.type === "info").length;
  const recentPinsCount = pins.filter((pin) => pin.createdAt && Date.now() - new Date(pin.createdAt).getTime() <= 86400000).length;
  const guardOptions = Array.from({ length: 20 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { code: `G-${n}`, label: `Guard ${n}` };
  });
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const loadPins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/pins/${buildingId}/${floor}`);
      setPins(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pins");
    } finally {
      setLoading(false);
    }
  }, [buildingId, floor]);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  const loadLiveGuards = useCallback(async () => {
    try {
      const res = await API.get(`/guards/live?buildingId=${buildingId}&floor=${floor}`);
      setLiveGuards(res.data?.guards || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load live guard positions");
    }
  }, [buildingId, floor]);

  useEffect(() => {
    loadLiveGuards();
    const id = window.setInterval(() => loadLiveGuards(), 5000);
    return () => window.clearInterval(id);
  }, [loadLiveGuards]);

  const reportGuardMovement = useCallback(
    async ({ lat, lng }) => {
      if (!user?.name) {
        setError("Login required to mark guard movement.");
        return;
      }
      try {
        setSavingPin(true);
        setError("");
        await API.post("/guards/move", {
          guardCode: selectedGuardCode,
          displayName: selectedGuardName,
          buildingId,
          floor,
          lat,
          lng,
          reportedBy: user.name,
        });
        await loadLiveGuards();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update guard location");
      } finally {
        setSavingPin(false);
      }
    },
    [buildingId, floor, loadLiveGuards, selectedGuardCode, selectedGuardName, user?.name]
  );


  useEffect(() => {
    if (viewMode !== "map") return;
    if (!MAPPLS_KEY) {
      setMapError("Mappls key missing. Add VITE_MAPPLS_KEY in client .env");
      return;
    }
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = () => {
      try {
        const api = window.mappls || window.Mappls;
        if (!api || !mapContainerRef.current || mapRef.current) return;
        if (typeof api.Map !== "function") {
          setMapError("Map SDK loaded, but Map constructor is unavailable.");
          return;
        }
        setMapBooting(true);
        mapApiRef.current = api;
        if (!mapContainerRef.current.id) {
          mapContainerRef.current.id = "mappls-live-map";
        }
        let instance = null;
        let didLoad = false;
        try {
          instance = new api.Map(mapContainerRef.current.id, {
            center: CAMPUS_CENTER,
            zoom: 17,
            pitch: mapTilt,
            bearing: mapHeading,
          });
        } catch {
          instance = new api.Map(mapContainerRef.current, {
            center: CAMPUS_CENTER,
            zoom: 17,
            pitch: mapTilt,
            bearing: mapHeading,
          });
        }

        mapRef.current = instance;
        setMapError("");
        if (typeof instance?.on === "function") {
          instance.on("load", () => {
            didLoad = true;
            setMapReady(true);
            setMapBooting(false);
          });
        } else {
          didLoad = true;
          setMapReady(true);
          setMapBooting(false);
        }
        window.setTimeout(() => instance?.resize?.(), 300);
        window.setTimeout(() => instance?.resize?.(), 900);
        window.setTimeout(() => {
          if (!didLoad) {
            setMapError("Map is taking too long to load. Please check your Mappls key/domain settings.");
            setMapBooting(false);
            setMapReady(false);
          }
        }, 7000);
      } catch (err) {
        setMapBooting(false);
        setMapReady(false);
        setMapError("Map initialization failed.");
      }
    };

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if (window.mappls || window.Mappls) return resolve();
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error("script error")), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.setAttribute("data-mappls-sdk", "true");
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("script error"));
        document.body.appendChild(script);
      });

    (async () => {
      const scriptSources = [
        `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${MAPPLS_KEY}`,
        `https://apis.mappls.com/advancedmaps/api/${MAPPLS_KEY}/map_sdk?v=3.0&layer=vector`,
      ];

      for (const src of scriptSources) {
        try {
          await loadScript(src);
          if (window.mappls || window.Mappls) {
            initMap();
            return;
          }
        } catch (err) {
          // try next source
        }
      }

      setMapError("Failed to load Mappls SDK. Check key type (static key), domain restrictions, and internet.");
      setMapBooting(false);
      setViewMode("tour");
    })();
  }, [MAPPLS_KEY, viewMode]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    map.setTilt?.(mapTilt);
    map.setPitch?.(mapTilt);
    map.setHeading?.(mapHeading);
    map.setBearing?.(mapHeading);
  }, [mapReady, mapTilt, mapHeading]);

  useEffect(() => {
    return () => {
      markerRefs.current.forEach((marker) => marker?.remove?.());
      markerRefs.current = [];
      mapRef.current?.remove?.();
      mapRef.current = null;
      setMapReady(false);
      setMapBooting(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !mapApiRef.current) return;
    const api = mapApiRef.current;

    markerRefs.current.forEach((marker) => marker?.remove?.());
    markerRefs.current = [];
    if (typeof api.Marker !== "function") {
      setMapError("Map loaded, but Marker API is unavailable.");
      return;
    }

    liveGuards.forEach((guard) => {
      const lat =
        Number.isFinite(guard.lat)
          ? guard.lat
          : Number.isFinite(guard.y)
            ? CAMPUS_CENTER.lat + (50 - guard.y) * 0.00008
            : CAMPUS_CENTER.lat;
      const lng =
        Number.isFinite(guard.lng)
          ? guard.lng
          : Number.isFinite(guard.x)
            ? CAMPUS_CENTER.lng + (guard.x - 50) * 0.00008
            : CAMPUS_CENTER.lng;

      try {
        const marker = new api.Marker({
          map: mapRef.current,
          position: { lat, lng },
          title: `${guard.displayName || guard.guardCode} • ${guard.guardCode}`,
        });
        markerRefs.current.push(marker);
      } catch (err) {
        // keep page usable even if marker rendering fails for one pin
      }
    });
  }, [liveGuards, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || viewMode !== "map") return;
    const map = mapRef.current;

    const parseLatLng = (evt) => {
      if (evt?.lngLat && Number.isFinite(evt.lngLat.lat) && Number.isFinite(evt.lngLat.lng)) {
        return { lat: evt.lngLat.lat, lng: evt.lngLat.lng };
      }
      if (evt?.latlng && Number.isFinite(evt.latlng.lat) && Number.isFinite(evt.latlng.lng)) {
        return { lat: evt.latlng.lat, lng: evt.latlng.lng };
      }
      if (evt?.lat && evt?.lng && Number.isFinite(evt.lat) && Number.isFinite(evt.lng)) {
        return { lat: evt.lat, lng: evt.lng };
      }
      return null;
    };

    const onMapClick = (evt) => {
      if (savingPin) return;
      const point = parseLatLng(evt);
      if (!point) return;
      reportGuardMovement(point);
    };

    if (typeof map.on === "function") {
      map.on("click", onMapClick);
    } else if (typeof map.addListener === "function") {
      map.addListener("click", onMapClick);
    }

    return () => {
      if (typeof map.off === "function") {
        map.off("click", onMapClick);
      } else if (typeof map.removeListener === "function") {
        map.removeListener("click", onMapClick);
      }
    };
  }, [mapReady, viewMode, reportGuardMovement, savingPin]);

  return (
    <div ref={pageRef} className="min-h-screen pb-36 page-bg md:pb-32">
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
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Module</p>
            <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <img src={pinsIcon} alt="Pins" className="h-6 w-6" />
              Pins
            </h1>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <section data-anim="hero-card" data-speed="1.02" className="premium-card rounded-3xl p-5 sm:p-6">
          <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Campus Navigation View</p>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                {guardPinsCount} guards
              </span>
            </div>
            <div className="mb-3 inline-flex rounded-3xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`rounded-3xl px-3 py-1.5 text-xs font-bold transition ${viewMode === "map" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                Live Map
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tour")}
                className={`rounded-3xl px-3 py-1.5 text-xs font-bold transition ${viewMode === "tour" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                3D Tour
              </button>
            </div>
            {viewMode === "map" && (
              <div className="mb-3 grid gap-2 rounded-3xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    3D Tilt ({mapTilt}deg)
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={mapTilt}
                    onChange={(e) => setMapTilt(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Heading ({mapHeading}deg)
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={mapHeading}
                    onChange={(e) => setMapHeading(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Active Guard Identity (max 20 total)
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      value={selectedGuardCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedGuardCode(code);
                        const selected = guardOptions.find((g) => g.code === code);
                        setSelectedGuardName(selected?.label || code);
                      }}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    >
                      {guardOptions.map((g) => (
                        <option key={g.code} value={g.code}>
                          {g.code} - {g.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={selectedGuardName}
                      onChange={(e) => setSelectedGuardName(e.target.value)}
                      placeholder="Guard display name"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </label>
                <p className="sm:col-span-2 text-xs font-semibold text-slate-500">
                  <i className="bi bi-cursor-fill mr-1 text-indigo-600" />
                  Tap anywhere on the map to update the selected guard's exact location in real time.
                  {savingPin ? " Saving..." : ""}
                </p>
              </div>
            )}

            {viewMode === "map" && (
              <>
                {mapError ? (
                  <div className="space-y-3">
                    <p className="rounded-3xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">{mapError}</p>
                    <button
                      type="button"
                      onClick={() => setViewMode("tour")}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <i className="bi bi-compass" />
                      Switch to 3D Tour
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div ref={mapContainerRef} className="h-72 w-full rounded-3xl border border-slate-200 bg-white" />
                    {mapBooting && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm">
                        <p className="text-sm font-semibold text-slate-600">
                          <i className="bi bi-arrow-repeat mr-1 animate-spin" />
                          Loading map...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {viewMode === "tour" && (
              <div className="space-y-3">
                <div className="relative [perspective:1400px]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl [transform:rotateX(5deg)_rotateY(-4deg)] transition-transform duration-300 hover:[transform:rotateX(0deg)_rotateY(0deg)]">
                    <iframe
                      src={VIRTUAL_TOUR_URL}
                      title="Presidency University 3D Tour"
                      className="h-72 w-full rounded-3xl border border-slate-200 bg-white"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
                <a
                  href={VIRTUAL_TOUR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <i className="bi bi-box-arrow-up-right" />
                  Open Tour in Full Screen
                </a>
              </div>
            )}
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Pins</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{pins.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Active Guards</p>
              <p className="mt-1 text-2xl font-extrabold text-red-500">{guardPinsCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Live Updates (24h)</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600">{recentPinsCount || infoPinsCount}</p>
            </div>
          </div>

          <div className="section-divider my-4" />

          <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Building</span>
              <input type="number" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100" value={buildingId} onChange={(e) => setBuildingId(Number(e.target.value))} />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Floor</span>
              <input type="number" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100" value={floor} onChange={(e) => setFloor(Number(e.target.value))} />
            </label>

            <button onClick={loadPins} disabled={loading} className="gradient-btn rounded-3xl px-4 py-2.5 font-bold text-white disabled:opacity-70">
              <i className="bi bi-arrow-repeat mr-1" />{loading ? "Loading..." : "Load Pins"}
            </button>
          </div>
        </section>

        {error && <p className="mt-4 rounded-3xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Live Guard Movement</h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
              {liveGuards.length} / 20 tracked
            </span>
          </div>
          {liveGuards.length === 0 ? (
            <p className="text-sm text-slate-500">No active guard movement marked for this building/floor yet.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {liveGuards.map((guard) => (
                <article key={guard.guardCode} className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{guard.displayName || guard.guardCode}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-indigo-700">{guard.guardCode}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {Number(guard.lat).toFixed(5)}, {Number(guard.lng).toFixed(5)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Last seen: {guard.lastSeenAt ? new Date(guard.lastSeenAt).toLocaleTimeString() : "just now"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>

      <div data-anim="stagger">
        <BottomDock />
      </div>
    </div>
  );
}

export default Pins;
