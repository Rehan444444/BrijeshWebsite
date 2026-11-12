import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

const heroImage =
  'https://res.cloudinary.com/dutgu4qps/image/upload/v1794476491/d98a00d4-0a32-4563-9860-372f86acd1ca.png';

const LINE_1 = 'BUILT FOR PRECISION,';
const LINE_2 = 'Engineering to Micron Level';
const TYPE_SPEED = 60;    // ms per character
const START_DELAY = 500;  // ms before the first typing starts
const REPEAT_DELAY = 5000; // ms to wait after finishing, then type again

function useTypewriter(total: number) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(reduceMotion ? total : 0);

  useEffect(() => {
    if (reduceMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;

    const tick = () => {
      if (i < total) {
        i += 1;
        setCount(i);
        timer = setTimeout(tick, TYPE_SPEED);
      } else {
        // finished: wait, then restart from empty
        timer = setTimeout(() => {
          i = 0;
          setCount(0);
          timer = setTimeout(tick, TYPE_SPEED);
        }, REPEAT_DELAY);
      }
    };

    timer = setTimeout(tick, START_DELAY);
    return () => clearTimeout(timer);
  }, [total, reduceMotion]);

  return count;
}

export function Hero() {
  const count = useTypewriter(LINE_1.length + LINE_2.length);

  const typed1 = LINE_1.slice(0, Math.min(count, LINE_1.length));
  const rest1 = LINE_1.slice(typed1.length);
  const typed2 = LINE_2.slice(0, Math.max(0, count - LINE_1.length));
  const rest2 = LINE_2.slice(typed2.length);

  return (
    <section id="top" className="relative isolate flex min-h-screen items-center overflow-hidden bg-zinc-950">
      <img
        src={heroImage}
        alt="CNC machine cutting metal with coolant spraying across the workpiece"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 animate-kenburns"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-32 lg:px-8">
        <div className="max-w-3xl">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
            Precision Manufacturing Company
          </p>

          <h1
            aria-label={`${LINE_1} ${LINE_2}`}
            className="animate-fade-up mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-[#fc7303] sm:text-6xl lg:text-7xl [animation-delay:120ms]"
          >
            <span aria-hidden="true" className="block">
              {typed1}
              <span className="invisible">{rest1}</span>
            </span>
            <span aria-hidden="true" className="block">
              {typed2}
              <span className="invisible">{rest2}</span>
            </span>
          </h1>
          

          <p className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 [animation-delay:240ms]">
            Sandeep Tools delivers tool room development, CNC job works and precision component
            manufacturing for automotive, medical and Other industrial customers, along with custom
            fasteners, shafts and industrial equipment.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:360ms]">
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-7 py-4 text-base font-semibold text-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/25"
            >
              Request a Quote
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-7 py-4 text-base font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10"
            >
              Explore Our Services
            </a>
          </div>
        </div>
      </div>

      <a
        href="#services"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-300 transition-colors hover:text-amber-400"
        aria-label="Scroll to services"
      >
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </a>
    </section>
  );
}