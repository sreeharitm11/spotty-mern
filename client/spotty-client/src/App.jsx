import { useLayoutEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pins from "./pages/Pins";
import Leaderboard from "./pages/Leaderboard";
import Chat from "./pages/Chat";
import useScrollSmoother from "./hooks/useScrollSmoother";

function AnimatedRoutes() {
  const location = useLocation();
  const shellRef = useRef(null);
  useScrollSmoother();

  useLayoutEffect(() => {
    if (!shellRef.current) return;

    gsap.fromTo(
      shellRef.current,
      { autoAlpha: 0, y: 20, filter: "blur(6px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power2.out",
      }
    );
  }, [location.pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div ref={shellRef} className="route-shell">
          <Routes location={location}>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pins" element={<Pins />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
