import { Cog, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { products, services } from '@/lib/siteData';

const year = new Date().getFullYear();

// TODO: replace these placeholders with your real details
const contact = {
  phone: '+91 93110 77374',
  phoneHref: 'tel:+919311077374',
  email: 'Brijeshsingh567i@gmail.com',
  address: ['Plot No. 61, Gazipur industrial area, Pali, Faridabad-121004, Haryana'],
};

const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1J6z69wvy7/?mibextid=wwXIfr', icon: Facebook },
  { label: 'Instagram', href: 'http://www.instagram.com/sandeep.tools', icon: Instagram },
  
  { label: 'YouTube', href: 'https://youtube.com/@yourchannel', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
              <Cog className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold text-white">Sandeep Tools</span>
          </a>
          <p className="mt-5 max-w-xs leading-relaxed text-zinc-400">
            Precision manufacturing and custom OEM manufacturer for all types of industrial customers.
          </p>

          <ul className="mt-6 flex items-center gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-500 hover:text-zinc-950"
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Services</h3>
          <ul className="mt-5 space-y-3">
            {services.map((service) => (
              <li key={service.title}>
                <a href="#services" className="transition-colors duration-200 hover:text-amber-400">
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Products</h3>
          <ul className="mt-5 space-y-3">
            {products.map((product) => (
              <li key={product.title}>
                <a href="#products" className="transition-colors duration-200 hover:text-amber-400">
                  {product.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white">Contact</h3>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <a
                href={contact.phoneHref}
                className="transition-colors duration-200 hover:text-amber-400"
              >
                {contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <a
                href={`mailto:${contact.email}`}
                className="break-all transition-colors duration-200 hover:text-amber-400"
              >
                {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <address className="not-italic leading-relaxed text-zinc-400">
                {contact.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>&copy; {year} Sandeep Tools. All rights reserved.</p>
          <a href="#contact" className="transition-colors duration-200 hover:text-amber-400">
            Request a quote
          </a>
        </div>
      </div>
    </footer>
  );
}