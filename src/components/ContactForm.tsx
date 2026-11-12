import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { interestOptions } from '@/lib/siteData';

interface ContactFormProps {
  interest: string | null;
}

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

const emptyForm: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  interest: '',
  message: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 91 = India country code, followed by your WhatsApp number
const WHATSAPP_NUMBER = '919311077374';

const buildWhatsAppUrl = (p: FormState) => {
  const text = [
    '*New Website Enquiry*',
    `Name: ${p.name}`,
    `Company: ${p.company || '-'}`,
    `Email: ${p.email}`,
    `Phone: ${p.phone || '-'}`,
    `Interest: ${p.interest || '-'}`,
    '',
    `Details: ${p.message}`,
  ].join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

const inputClass =
  'mt-2 w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition-colors duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30';

export function ContactForm({ interest }: ContactFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    if (interest) {
      setForm((current) => ({ ...current, interest }));
    }
  }, [interest]);

  const updateField = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: FormState = {
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      interest: form.interest,
      message: form.message.trim(),
    };

    if (!payload.name || !payload.message) {
      setErrorMessage('Please enter your name and project details.');
      setStatus('error');
      return;
    }
    if (!emailPattern.test(payload.email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    // Open the tab now (inside the click) so browsers don't block it as a popup
    const waWindow = window.open('', '_blank');

    const { error } = await supabase.from('inquiries').insert({
      name: payload.name,
      company: payload.company || null,
      email: payload.email,
      phone: payload.phone || null,
      interest: payload.interest || null,
      message: payload.message,
    });

    if (error) {
      waWindow?.close();
      setErrorMessage('Something went wrong while sending your request. Please try again shortly.');
      setStatus('error');
      return;
    }

    const url = buildWhatsAppUrl(payload);
    setWhatsappUrl(url);
    if (waWindow) {
      waWindow.location.href = url;
    }

    setForm(emptyForm);
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-600" />
        <h3 className="mt-6 text-2xl font-bold text-zinc-900">Thank you for your enquiry</h3>
        <p className="mt-3 max-w-md leading-relaxed text-zinc-700">
          We have received your details and our team will get back to you shortly.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700"
          >
            Send details on WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            setWhatsappUrl('');
            setStatus('idle');
          }}
          className="mt-4 rounded-md border border-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors duration-200 hover:bg-zinc-900 hover:text-white"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const submitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-900/5 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-zinc-800">
          Full name <span className="text-amber-700">*</span>
          <input
            type="text"
            maxLength={120}
            value={form.name}
            onChange={updateField('name')}
            placeholder="Your name"
            className={inputClass}
            autoComplete="name"
          />
        </label>
        <label className="block text-sm font-semibold text-zinc-800">
          Company
          <input
            type="text"
            maxLength={160}
            value={form.company}
            onChange={updateField('company')}
            placeholder="Company name"
            className={inputClass}
            autoComplete="organization"
          />
        </label>
        <label className="block text-sm font-semibold text-zinc-800">
          Email <span className="text-amber-700">*</span>
          <input
            type="email"
            maxLength={254}
            value={form.email}
            onChange={updateField('email')}
            placeholder="you@company.com"
            className={inputClass}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm font-semibold text-zinc-800">
          Phone
          <input
            type="tel"
            maxLength={40}
            value={form.phone}
            onChange={updateField('phone')}
            placeholder="Optional"
            className={inputClass}
            autoComplete="tel"
          />
        </label>
      </div>

      <label className="block text-sm font-semibold text-zinc-800">
        What are you interested in?
        <select value={form.interest} onChange={updateField('interest')} className={`${inputClass} pr-10`}>
          <option value="">Select a service or product</option>
          {interestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold text-zinc-800">
        Project details <span className="text-amber-700">*</span>
        <textarea
          rows={5}
          maxLength={3000}
          value={form.message}
          onChange={updateField('message')}
          placeholder="Share part names, quantities, materials, tolerances or any drawings you have ready."
          className={`${inputClass} resize-y`}
        />
      </label>

      {status === 'error' && errorMessage && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-7 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Enquiry
            <Send className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}