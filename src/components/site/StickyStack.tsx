import { Children, ReactNode, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Sticky "overlap" scroll effect used ONLY on the Home page.
 * Desktop: each layer is sticky at the top with an increasing z-index, so the
 * next layer scrolls up and fully covers the previous one (depth via scale/opacity).
 * Mobile (<768px): effect disabled — normal scroll with a soft fade-in per layer.
 */
export const StickyStack = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  const layers = Children.toArray(children);

  if (isMobile) {
    return (
      <>
        {layers.map((child, i) => (
          <FadeLayer key={i}>{child}</FadeLayer>
        ))}
      </>
    );
  }

  return (
    <div className="relative">
      {layers.map((child, i) => (
        <StickyLayer key={i} index={i} total={layers.length}>
          {child}
        </StickyLayer>
      ))}
    </div>
  );
};

const FadeLayer = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      className="bg-cream transition-opacity duration-700 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {children}
    </section>
  );
};

const StickyLayer = ({ children, index, total }: { children: ReactNode; index: number; total: number }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [top, setTop] = useState(0);
  const [progress, setProgress] = useState(0); // 0 = fully visible, 1 = fully covered

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // Tall sections must scroll through before pinning, so pin their bottom.
      setTop(Math.min(0, window.innerHeight - el.offsetHeight));
    };

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      if (index === total - 1) return;
      // How far the layer has been pushed past the top of the viewport.
      const covered = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      setProgress(covered);
    };

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [index, total]);

  const isLast = index === total - 1;

  return (
    <section
      ref={ref}
      className="bg-cream"
      style={{
        position: isLast ? "relative" : "sticky",
        top: isLast ? undefined : top,
        zIndex: index + 1,
        minHeight: "100vh",
        transition: "transform 0.6s ease, opacity 0.6s ease",
        transform: isLast ? undefined : `scale(${1 - progress * 0.04})`,
        opacity: isLast ? undefined : 1 - progress * 0.35,
        willChange: isLast ? undefined : "transform, opacity",
      }}
    >
      {children}
    </section>
  );
};
