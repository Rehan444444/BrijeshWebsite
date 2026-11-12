import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { products } from '@/lib/siteData';

interface ProductsProps {
  className?: string;
  onRequestQuote: (productTitle: string) => void;
}

const highlights = ['Made to your drawing', 'Material of your choice', 'Tight tolerance control'];
const stats = [
  { label: 'Tolerance', value: '±0.01 mm' },
  { label: 'Materials', value: 'Steel · SS · Brass' },
  { label: 'Orders', value: 'Prototype to bulk' },
];

export function Products({ className = '', onRequestQuote }: ProductsProps) {
  const [active, setActive] = useState(0);

  const featured = products[active];
  const FeaturedIcon = featured.icon;

  const side = products
    .map((product, index) => ({ product, index }))
    .filter(({ index }) => index !== active)
    .slice(0, 4);

  return (
    <section id="products" className={`relative bg-white py-24 lg:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Our Products</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Components made to Order
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Every product can be customised to your drawing, material and tolerance requirements.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-5">
          {/* Featured product */}
          <article
            key={featured.title}
            className="animate-fade-up relative isolate flex flex-col overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white sm:p-10 lg:col-span-3 lg:p-12"
          >
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl"
            />

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
                Featured product
              </span>
              <span className="text-sm font-semibold text-zinc-400">
                {String(active + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20">
              <FeaturedIcon className="h-8 w-8" />
            </div>

            <h3 className="mt-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {featured.title}
            </h3>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-300">
              {featured.description}
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-wider text-zinc-400">{s.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => onRequestQuote(featured.title)}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3.5 text-base font-semibold text-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/25"
              >
                Request a quote
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </article>

          {/* Side products */}
          <div className="grid gap-2 sm:grid-cols-2 lg:col-span-2">
            {side.map(({ product, index }) => {
              const Icon = product.icon;
              return (
                <article
                  key={product.title}
                  className="group relative isolate flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:shadow-zinc-900/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-400 backdrop-blur-sm transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-zinc-950">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-white/50 transition-colors group-hover:text-amber-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="mt-auto pt-10">
                    <h3 className="text-lg font-bold leading-snug text-white">{product.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                      <button
                        type="button"
                        onClick={() => setActive(index)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-amber-400"
                      >
                        View details
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestQuote(product.title)}
                        aria-label={`Request a quote for ${product.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-200 hover:border-amber-400 hover:bg-amber-500 hover:text-zinc-950"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}