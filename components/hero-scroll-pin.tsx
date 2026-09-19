"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HeroScrollPin({ children }: { children: ReactNode }) {
  const hero = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let revert: (() => void) | undefined;

    async function setup() {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (disposed || !hero.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      const element = hero.current;
      const nextSection = element.nextElementSibling;
      if (!nextSection) return;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const smoothScroll = new Lenis({
          lerp: .1,
          smoothWheel: true,
          syncTouch: false,
          anchors: true,
          allowNestedScroll: true,
          autoToggle: true,
        });
        const tick = (seconds: number) => smoothScroll.raf(seconds * 1000);
        smoothScroll.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        const heroContent = element.querySelector("#hero");
        const timeline = gsap.timeline({ scrollTrigger: {
          id: "homepage-hero-cover",
          trigger: element,
          // Let tall heroes scroll fully into view before pinning their bottom.
          start: () => element.offsetHeight > window.innerHeight ? "bottom bottom" : "top top",
          endTrigger: nextSection,
          end: "top top",
          pin: element,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          scrub: .5,
        } });
        if (heroContent) {
          timeline.to(heroContent, {
            y: -70,
            scale: .96,
            opacity: .3,
            transformOrigin: "50% 35%",
            ease: "none",
          });
        }

        const landscape = nextSection.querySelector("[data-scroll-landscape]");
        if (landscape) {
          gsap.fromTo(landscape, { "--results-shift": "-24px" }, {
            "--results-shift": "24px",
            ease: "none",
            scrollTrigger: {
              trigger: landscape,
              start: "top bottom",
              end: "bottom top",
              scrub: .6,
            },
          });
        }

        const items = nextSection.querySelectorAll<HTMLElement>(
          '[data-scroll-reveal], [data-testid="homepage-text-testimonial"], [data-testid="homepage-video-testimonial"]',
        );
        items.forEach((item, index) => {
          gsap.fromTo(item, { y: 28, opacity: .5 }, {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: `top ${92 - (index % 2) * 4}%`,
              end: `top ${70 - (index % 2) * 4}%`,
              scrub: .4,
              invalidateOnRefresh: true,
            },
          });
        });
        return () => {
          gsap.ticker.remove(tick);
          smoothScroll.off("scroll", ScrollTrigger.update);
          smoothScroll.destroy();
        };
      });
      revert = () => media.revert();
      // Font loading can change the hero height after the initial measurement.
      document.fonts?.ready.then(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
    }

    void setup();
    return () => { disposed = true; revert?.(); };
  }, []);

  return <div ref={hero} data-hero-scroll-pin className="relative z-0">{children}</div>;
}
