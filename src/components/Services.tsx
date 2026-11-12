import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { services } from '@/lib/siteData';

const SPEED = 40; // pixels per second, lower = slower

export function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const manualUntilRef = useRef(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateButtons();
    window.addEventListener('resize', updateButtons);
    return () => window.removeEventListener('resize', updateButtons);
  }, [updateButtons]);

  // Continuous auto-scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pos = el.scrollLeft;
    let last = performance.now();
    let id: number;

    const step = (now: number) => {
      const dt = now - last;
      last = now;
      const paused = hoverRef.current || now < manualUntilRef.current;

      if (paused) {
        pos = el.scrollLeft; // stay in sync with manual scrolling
      } else {
        const max = el.scrollWidth - el.clientWidth;
        pos += (SPEED * dt) / 1000;
        if (pos >= max) pos = 0; // loop back to the first card
        el.scrollLeft = pos;
      }
      id = requestAnimationFrame(step);
    };

    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    manualUntilRef.current = performance.now() + 2500; // pause auto-scroll briefly
    const card = el.querySelector('article') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : el.clientWidth; // 24 = gap-6
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const buttonClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition-all duration-200 hover:border-amber-400 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-300 disabled:hover:bg-white';

  return (
    <section id="services" className="bg-zinc-50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Our Services</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              From tooling to finished components
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-600">
              One partner for the tooling, machining and inspection your parts need, from first drawing to
              final delivery.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="Previous services"
              className={buttonClass}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="Next services"
              className={buttonClass}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={updateButtons}
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
          onTouchStart={() => (manualUntilRef.current = performance.now() + 4000)}
          className="mt-12 flex gap-6 overflow-x-auto px-1 pb-8 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="group relative w-full shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:shadow-zinc-900/10 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <span className="absolute right-6 top-6 text-sm font-semibold text-zinc-300 transition-colors group-hover:text-amber-500">
                  0{index + 1}
                </span>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-amber-400 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-zinc-950">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-zinc-900">{service.title}</h3>
                <p className="mt-3 leading-relaxed text-zinc-600">{service.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}