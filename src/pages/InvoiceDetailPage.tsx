import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Package, Printer, Download, Edit3, Loader2, IndianRupee } from 'lucide-react';
import type { Route } from '@/lib/router';
import type { Invoice } from '@/lib/types';
import { fetchInvoiceWithItems } from '@/lib/invoiceStore';
import { exportInvoiceToPDF, exportItemsToCSV } from '@/lib/export';
import { formatCurrency } from '@/lib/format';

interface InvoiceDetailProps {
  id: string;
  navigate: (r: Route) => void;
}

export function InvoiceDetailPage({ id, navigate }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchInvoiceWithItems(id);
      setInvoice(data);
      setLoading(false);
    })();
  }, [id]);

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
          onClick={() => navigate({ name: 'invoices' })}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const items = invoice.items || [];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'invoices' })}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {invoice.supplier_name || 'Invoice'}
            </h1>
            <p className="text-sm text-slate-500">
              {invoice.invoice_number || 'No invoice number'} · {invoice.invoice_date || 'No date'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ name: 'review', id })}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Edit3 size={16} /> Edit
          </button>
          <button
            onClick={() => exportInvoiceToPDF(invoice)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Printer size={16} /> PDF
          </button>
          <button
            onClick={() => exportItemsToCSV([invoice])}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Line items table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-teal-600" />
                Line Items ({items.length})
              </h2>
            </div>
            {items.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No line items recorded</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-3 py-3 font-medium">HSN</th>
                      <th className="px-3 py-3 font-medium text-right">Qty</th>
                      <th className="px-3 py-3 font-medium text-right">Rate</th>
                      <th className="px-3 py-3 font-medium text-right">GST</th>
                      <th className="px-6 py-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-6 py-3 text-slate-800 font-medium">{item.product_name || '—'}</td>
                        <td className="px-3 py-3 text-slate-500">{item.hsn_code || '—'}</td>
                        <td className="px-3 py-3 text-right text-slate-600">{item.quantity}</td>
                        <td className="px-3 py-3 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                        <td className="px-3 py-3 text-right text-slate-600">{item.gst_percent}%</td>
                        <td className="px-6 py-3 text-right font-semibold text-slate-800">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Raw text */}
          {invoice.raw_text && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={18} className="text-teal-600" />
                Raw OCR Text
              </h2>
              <pre className="bg-slate-50 rounded-lg p-4 text-xs text-slate-500 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                {invoice.raw_text}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Bill summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Bill Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Taxable Amount</span>
                <span className="font-medium text-slate-800">{formatCurrency(invoice.taxable_amount)}</span>
              </div>
              {invoice.cgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">CGST</span>
                  <span className="font-medium text-slate-800">{formatCurrency(invoice.cgst)}</span>
                </div>
              )}
              {invoice.sgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">SGST</span>
                  <span className="font-medium text-slate-800">{formatCurrency(invoice.sgst)}</span>
                </div>
              )}
              {invoice.igst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">IGST</span>
                  <span className="font-medium text-slate-800">{formatCurrency(invoice.igst)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="font-semibold text-slate-700">Grand Total</span>
                <span className="font-bold text-teal-600 text-lg">{formatCurrency(invoice.grand_total)}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">Supplier</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{invoice.supplier_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">GSTIN</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{invoice.gstin || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">Customer</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{invoice.customer_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">Address</dt>
                <dd className="text-slate-600 mt-0.5">{invoice.supplier_address || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Bill image */}
          {invoice.image_url && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Original Bill</h3>
              <img
                src={invoice.image_url}
                alt="Bill"
                className="w-full rounded-lg border border-slate-100"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
