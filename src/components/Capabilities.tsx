import { CheckCircle2, Layers, ShieldCheck, Timer } from 'lucide-react';
import { strengths } from '@/lib/siteData';

const industries = ['Automotive', 'Medical', 'Industrial Machinery', 'Engineering & Equipment'];

const highlights = [
  { icon: Layers, title: 'Tool room to production', text: 'Tooling built in-house, so your parts run on dependable fixtures.' },
  { icon: ShieldCheck, title: 'Inspection before dispatch', text: 'Every batch is checked against your drawing before it ships.' },
  { icon: Timer, title: 'Prototype to volume', text: 'Single samples and repeat production runs handled the same way.' },
];

export function Capabilities() {
  return (
    <section id="about" className="bg-zinc-900 py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Why Sandeep Tools</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            A precision partner you can build on
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-300">
            We combine tool room skill with modern CNC machining to produce components that fit, perform
            and repeat. Whether you need one part or thousands, the quality stays the same.
          </p>

          <ul className="mt-10 space-y-4">
            {strengths.map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Industries served</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors duration-200 hover:border-amber-400 hover:text-amber-300"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-zinc-300">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
