import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Plus, Trash2, FileText, Check, Loader2, Eye, X } from 'lucide-react';
import type { Route } from '@/lib/router';
import type { Invoice, InvoiceItem } from '@/lib/types';
import { fetchInvoiceWithItems, updateInvoice, deleteInvoice } from '@/lib/invoiceStore';
import { parseInvoice } from '@/lib/invoiceParser';
import { exportInvoiceToPDF, exportItemsToCSV } from '@/lib/export';
import { ConfidenceBadge } from '@/components/Confidence';

interface ReviewPageProps {
  id: string;
  navigate: (r: Route) => void;
}

export function ReviewPage({ id, navigate }: ReviewPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [confidenceMap, setConfidenceMap] = useState<Record<string, 'high' | 'medium' | 'low'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchInvoiceWithItems(id);
      if (data) {
        setInvoice(data);
        setItems(data.items || []);

        // Re-parse the raw text to get confidence scores
        if (data.raw_text) {
          const parsed = parseInvoice(data.raw_text);
          setConfidenceMap({
            supplier_name: parsed.supplier_name.confidence,
            invoice_number: parsed.invoice_number.confidence,
            invoice_date: parsed.invoice_date.confidence,
            gstin: parsed.gstin.confidence,
            customer_name: parsed.customer_name.confidence,
            supplier_address: parsed.supplier_address.confidence,
            taxable_amount: parsed.taxable_amount.confidence,
            cgst: parsed.cgst.confidence,
            sgst: parsed.sgst.confidence,
            igst: parsed.igst.confidence,
            grand_total: parsed.grand_total.confidence,
          });
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const updateField = useCallback((field: keyof Invoice, value: string) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      if (typeof prev[field] === 'number') {
        return { ...prev, [field]: parseFloat(value.replace(/[^0-9.]/g, '')) || 0 };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (typeof item[field] === 'number') {
        (item[field] as unknown as number) = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
      } else {
        (item[field] as unknown as string) = value;
      }
      // Recalculate total if qty or rate changes
      if (field === 'quantity' || field === 'rate' || field === 'gst_percent') {
        item.total = item.quantity * item.rate * (1 + item.gst_percent / 100);
      }
      updated[index] = item;
      return updated;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { product_name: '', hsn_code: '', quantity: 1, rate: 0, gst_percent: 0, total: 0 },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const recalcTotals = useCallback(() => {
    const taxable = items.reduce((s, i) => s + i.quantity * i.rate, 0);
    const taxAmount = items.reduce(
      (s, i) => s + i.quantity * i.rate * (i.gst_percent / 100),
      0
    );
    const isIGST = (invoice?.gstin || '').substring(0, 2) !== '27'; // simplified check
    if (isIGST && invoice?.igst !== undefined) {
      setInvoice((prev) => prev ? {
        ...prev,
        taxable_amount: taxable,
        igst: taxAmount,
        cgst: 0,
        sgst: 0,
        grand_total: taxable + taxAmount,
      } : prev);
    } else {
      setInvoice((prev) => prev ? {
        ...prev,
        taxable_amount: taxable,
        cgst: taxAmount / 2,
        sgst: taxAmount / 2,
        igst: 0,
        grand_total: taxable + taxAmount,
      } : prev);
    }
  }, [items, invoice]);

  const handleSave = useCallback(async () => {
    if (!invoice) return;
    setSaving(true);
    const ok = await updateInvoice(id, { ...invoice, status: 'saved' }, items);
    setSaving(false);
    if (ok) {
      navigate({ name: 'invoice', id });
    }
  }, [invoice, items, id, navigate]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    const ok = await deleteInvoice(id);
    if (ok) navigate({ name: 'dashboard' });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 size={28} className="text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-500">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Invoice not found.</p>
        <button
          onClick={() => navigate({ name: 'dashboard' })}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const fieldConfig: { key: keyof Invoice; label: string; type: 'text' | 'number' }[] = [
    { key: 'supplier_name', label: 'Supplier Name', type: 'text' },
    { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
    { key: 'invoice_date', label: 'Invoice Date', type: 'text' },
    { key: 'gstin', label: 'GSTIN', type: 'text' },
    { key: 'customer_name', label: 'Customer / Billed To', type: 'text' },
    { key: 'supplier_address', label: 'Supplier Address', type: 'text' },
  ];

  const amountConfig: { key: keyof Invoice; label: string }[] = [
    { key: 'taxable_amount', label: 'Taxable Amount' },
    { key: 'cgst', label: 'CGST' },
    { key: 'sgst', label: 'SGST' },
    { key: 'igst', label: 'IGST' },
    { key: 'grand_total', label: 'Grand Total' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Review & Edit Invoice</h1>
            <p className="text-sm text-slate-500">Verify extracted data and save</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.image_url && (
            <button
              onClick={() => setShowImage(true)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <Eye size={16} /> View Image
            </button>
          )}
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <FileText size={16} /> Raw Text
          </button>
        </div>
      </div>

      {/* Raw text drawer */}
      {showRawText && (
        <div className="mb-4 bg-slate-900 rounded-xl p-4 relative">
          <button
            onClick={() => setShowRawText(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
          <pre className="text-xs text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono pr-8">
            {invoice.raw_text}
          </pre>
        </div>
      )}

      {/* Image modal */}
      {showImage && invoice.image_url && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImage(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={invoice.image_url}
              alt="Bill"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setShowImage(false)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <X size={18} className="text-slate-700" />
            </button>
          </div>
        </div>
      )}

      {/* Bill-level fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
          Bill Details
        </h2>
        <div className="space-y-1">
          {fieldConfig.map(({ key, label, type }) => (
            <div key={key} className="flex items-center gap-3 py-2">
              <label className="text-sm text-slate-500 w-44 shrink-0">{label}</label>
              <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border ${
                confidenceMap[key as string] === 'high' ? 'border-emerald-200 bg-emerald-50/50' :
                confidenceMap[key as string] === 'medium' ? 'border-amber-200 bg-amber-50/50' :
                'border-slate-200'
              }`}>
                <input
                  type={type}
                  value={String(invoice[key] ?? '')}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                />
                {confidenceMap[key as string] && (
                  <ConfidenceBadge level={confidenceMap[key as string]} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
            Line Items
          </h2>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No items detected. Add them manually above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-2 pr-3 font-medium min-w-[140px]">Product</th>
                  <th className="py-2 pr-3 font-medium w-24">HSN</th>
                  <th className="py-2 pr-3 font-medium w-20 text-right">Qty</th>
                  <th className="py-2 pr-3 font-medium w-24 text-right">Rate</th>
                  <th className="py-2 pr-3 font-medium w-20 text-right">GST%</th>
                  <th className="py-2 pr-3 font-medium w-28 text-right">Total</th>
                  <th className="py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 group">
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => updateItem(i, 'product_name', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-transparent hover:border-slate-200 focus:border-teal-300 outline-none text-slate-800"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={item.hsn_code}
                        onChange={(e) => updateItem(i, 'hsn_code', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-transparent hover:border-slate-200 focus:border-teal-300 outline-none text-slate-800"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-transparent hover:border-slate-200 focus:border-teal-300 outline-none text-right text-slate-800"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(i, 'rate', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-transparent hover:border-slate-200 focus:border-teal-300 outline-none text-right text-slate-800"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={item.gst_percent}
                        onChange={(e) => updateItem(i, 'gst_percent', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-transparent hover:border-slate-200 focus:border-teal-300 outline-none text-right text-slate-800"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right font-medium text-slate-700">
                      ₹{item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeItem(i)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={recalcTotals}
          className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          Recalculate totals from items
        </button>
      </div>

      {/* Amount fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
          Tax & Totals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {amountConfig.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3 py-2">
              <label className="text-sm text-slate-500 flex-1">{label}</label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-44 ${
                confidenceMap[key as string] === 'high' ? 'border-emerald-200 bg-emerald-50/50' :
                confidenceMap[key as string] === 'medium' ? 'border-amber-200 bg-amber-50/50' :
                'border-slate-200'
              }`}>
                <span className="text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  value={String(invoice[key] ?? 0)}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none text-right"
                />
                {confidenceMap[key as string] && (
                  <ConfidenceBadge level={confidenceMap[key as string]} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-white p-4 rounded-xl border border-slate-200 shadow-lg">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Invoice'}
        </button>
        <button
          onClick={() => exportInvoiceToPDF({ ...invoice, items })}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          <FileText size={18} /> PDF
        </button>
        <button
          onClick={() => exportItemsToCSV([{ ...invoice, items }])}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          CSV
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
