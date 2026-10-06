import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, FileText, Image as ImageIcon, X, ArrowRight, ClipboardPaste, Zap } from 'lucide-react';
import type { Route } from '@/lib/router';
import type { Invoice, InvoiceItem } from '@/lib/types';
import { parseInvoice } from '@/lib/invoiceParser';
import { saveInvoice } from '@/lib/invoiceStore';

interface ScanPageProps {
  navigate: (r: Route) => void;
}

type ScanState = 'idle' | 'input';

export function ScanPage({ navigate }: ScanPageProps) {
  const [state, setState] = useState<ScanState>('idle');
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setImageDataUrl(result);
    };
    reader.readAsDataURL(file);
    setState('input');
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      const parsed = rawText.trim()
        ? parseInvoice(rawText)
        : {
            supplier_name: { value: '', confidence: 'low' as const },
            invoice_number: { value: '', confidence: 'low' as const },
            invoice_date: { value: '', confidence: 'low' as const },
            gstin: { value: '', confidence: 'low' as const },
            customer_name: { value: '', confidence: 'low' as const },
            supplier_address: { value: '', confidence: 'low' as const },
            taxable_amount: { value: '', confidence: 'low' as const },
            cgst: { value: '', confidence: 'low' as const },
            sgst: { value: '', confidence: 'low' as const },
            igst: { value: '', confidence: 'low' as const },
            grand_total: { value: '', confidence: 'low' as const },
            items: [] as InvoiceItem[],
          };

      const invoice: Invoice = {
        supplier_name: parsed.supplier_name.value,
        invoice_number: parsed.invoice_number.value,
        invoice_date: parsed.invoice_date.value,
        gstin: parsed.gstin.value,
        customer_name: parsed.customer_name.value,
        supplier_address: parsed.supplier_address.value,
        taxable_amount: parseFloat(parsed.taxable_amount.value.replace(/[^0-9.]/g, '')) || 0,
        cgst: parseFloat(parsed.cgst.value.replace(/[^0-9.]/g, '')) || 0,
        sgst: parseFloat(parsed.sgst.value.replace(/[^0-9.]/g, '')) || 0,
        igst: parseFloat(parsed.igst.value.replace(/[^0-9.]/g, '')) || 0,
        grand_total: parseFloat(parsed.grand_total.value.replace(/[^0-9.]/g, '')) || 0,
        raw_text: rawText,
        image_url: imageDataUrl,
        status: 'draft',
      };

      const saved = await saveInvoice(invoice, parsed.items);
      if (saved && saved.id) {
        navigate({ name: 'review', id: saved.id });
      } else {
        setError('Failed to save invoice. Please try again.');
      }
    } catch {
      setError('Something went wrong while saving.');
    }
    setSaving(false);
  }, [rawText, imageDataUrl, navigate]);

  const handleReset = () => {
    setState('idle');
    setPreviewUrl('');
    setImageDataUrl('');
    setRawText('');
    setError('');
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add Bill</h1>
        <p className="text-slate-500 mt-1">Upload a bill photo for reference, then paste text or enter data manually</p>
      </div>

      {state === 'idle' && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-teal-400', 'bg-teal-50/30'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50/30'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50/30');
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
          >
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={28} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Drop bill image here or click to upload</h3>
            <p className="text-sm text-slate-400">Supports JPG, PNG, WebP</p>
          </div>

          {/* Camera capture */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              <Camera size={22} />
              Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              <ImageIcon size={22} />
              Choose File
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />

          {/* Skip image — go straight to manual */}
          <button
            onClick={() => setState('input')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-teal-600 font-medium hover:bg-teal-50 rounded-xl transition-colors"
          >
            <ClipboardPaste size={18} />
            Skip image — paste text or enter manually
          </button>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <FileText size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">How it works</p>
              <p className="text-blue-600 mt-1">Upload a bill photo for reference. Then paste text from any OCR tool (Google Lens, etc.) and the app will auto-parse supplier name, invoice number, date, GSTIN, line items, and totals. You can review and edit everything before saving.</p>
            </div>
          </div>
        </div>
      )}

      {state === 'input' && (
        <div className="space-y-4">
          {/* Image preview */}
          {previewUrl && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Bill Image</h3>
                <button
                  onClick={handleReset}
                  className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X size={14} /> Start Over
                </button>
              </div>
              <img
                src={previewUrl}
                alt="Bill preview"
                className="max-h-64 mx-auto rounded-lg border border-slate-200"
              />
            </div>
          )}

          {/* Paste text */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <ClipboardPaste size={18} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Paste Bill Text</h3>
                <p className="text-sm text-slate-500">Paste text from any OCR tool and we'll auto-extract the fields</p>
              </div>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the text content of your bill here…"
              className="w-full h-48 px-4 py-3 bg-slate-50 rounded-lg text-sm text-slate-700 outline-none border border-slate-200 focus:border-teal-400 transition-colors resize-y font-mono"
            />
            {rawText.trim() && (
              <div className="mt-3 flex items-center gap-2 text-sm text-teal-600">
                <Zap size={14} />
                <span>Auto-parser will extract fields from this text</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!previewUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                <Upload size={18} /> Add Image
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Continue to Edit'}
              {!saving && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
