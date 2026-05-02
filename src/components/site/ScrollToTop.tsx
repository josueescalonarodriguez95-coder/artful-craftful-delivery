import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={`fixed top-24 left-4 md:left-6 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink bg-cream/70 backdrop-blur-md border border-border/60 hover:border-ink/40 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-3 w-3" />
      <span>up</span>
    </button>
  );
};
