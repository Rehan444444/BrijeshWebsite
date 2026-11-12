import { ClipboardList, FileCheck2, PackageCheck } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';

interface ContactProps {
  interest: string | null;
}

const steps = [
  { icon: ClipboardList, text: 'Tell us what you need: part names, quantities and materials.' },
  { icon: FileCheck2, text: 'Share drawings or tolerances if you have them ready.' },
  { icon: PackageCheck, text: 'Our team reviews your request and replies with next steps.' },
];

export function Contact({ interest }: ContactProps) {
  return (
    <section id="contact" className="bg-zinc-50 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Get in Touch</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Request a quote for your next project
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Send us your requirements and we will get back to you with a clear plan for tooling, machining
            and delivery.
          </p>

          <ol className="mt-10 space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.text} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="pt-2 leading-relaxed text-zinc-700">
                    <span className="font-semibold text-zinc-900">Step {index + 1}. </span>
                    {step.text}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="lg:col-span-3">
          <ContactForm interest={interest} />
        </div>
      </div>
    </section>
  );
}
