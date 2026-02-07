import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function usePageMotion(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from('[data-anim="hero"]', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from('[data-anim="hero-card"]', {
        y: 34,
        opacity: 0,
        duration: 0.85,
        delay: 0.08,
        ease: "power3.out",
      });

      gsap.from('[data-anim="nav"]', {
        y: -16,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from('[data-anim="stagger"]', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.utils.toArray('[data-anim="reveal"]').forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      });

      gsap.utils.toArray('[data-float="slow"]').forEach((el) => {
        gsap.to(el, {
          y: -14,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      gsap.utils.toArray('[data-float="fast"]').forEach((el) => {
        gsap.to(el, {
          y: -8,
          duration: 1.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const amount = Number(el.getAttribute("data-parallax")) || 28;
        gsap.to(el, {
          y: amount,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef]);
}
