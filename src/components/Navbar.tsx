import { useEffect, useState } from 'react';
import { Cog, Menu, X } from 'lucide-react';

const links = [
  { label: 'Services', href: '#services' },
  { label: 'Products', href: '#products' },
  { label: 'Capabilities', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerTone = scrolled || open
    ? 'bg-zinc-950/95 shadow-lg shadow-black/20 backdrop-blur border-b border-white/10'
    : 'bg-transparent border-b border-transparent';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerTone}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
      <a
  href="#top"
  className="flex items-center "
  onClick={() => setOpen(false)}
  aria-label="Sandeep Tools - back to top"
>
  <img
    src="https://res.cloudinary.com/dutgu4qps/image/upload/v1794476630/WhatsApp_Image_2026-11-12_at_12.58.26_AM.jpg"
    alt="Sandeep Tools logo"
    className="h-24 w-32 rounded-md object-contain p-1 shadow-md transition-transform duration-200 hover:scale-105 sm:h-14"
  />
  <span className="text-lg font-semibold tracking-tight text-white">
    Sandeep Tools
  </span>
</a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-200 transition-colors duration-200 hover:text-amber-400"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
          >
            Request a Quote
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md p-2 text-white transition-colors hover:bg-white/10 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`overflow-hidden bg-zinc-950 transition-all duration-300 md:hidden ${
          open ? 'max-h-96 border-t border-white/10' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-zinc-200 hover:bg-white/5 hover:text-amber-400"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-md bg-amber-500 px-5 py-3 text-center text-base font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Request a Quote
          </a>
        </nav>
      </div>
    </header>
  );
}
