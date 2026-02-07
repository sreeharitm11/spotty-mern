import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function useScrollSmoother() {
  const location = useLocation();

  useEffect(() => {
    const existing = ScrollSmoother.get();
    if (existing) {
      existing.kill();
    }

    const isTouch = !!ScrollTrigger.isTouch;

    const smoother = ScrollSmoother.create({
      smooth: 1.1,
      smoothTouch: 0,
      effects: !isTouch,
      normalizeScroll: true,
      ignoreMobileResize: true,
    });

    ScrollTrigger.refresh();

    return () => {
      smoother.kill();
    };
  }, []);

  useEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(0, false);
    }
  }, [location.pathname]);
}
