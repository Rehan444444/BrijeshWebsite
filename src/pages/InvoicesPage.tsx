import { useState, useMemo } from 'react';
import { Search, FileText, ArrowRight, Download, Trash2, IndianRupee, Package, X } from 'lucide-react';
import type { Route } from '@/lib/router';
import type { Invoice } from '@/lib/types';
import { formatCurrency, formatRelativeDate } from '@/lib/format';
import { exportInvoicesToCSV, exportItemsToCSV } from '@/lib/export';
import { deleteInvoice } from '@/lib/invoiceStore';

interface InvoicesPageProps {
  invoices: Invoice[];
  loading: boolean;
  navigate: (r: Route) => void;
  refetch: () => void;
}

export function InvoicesPage({ invoices, loading, navigate, refetch }: InvoicesPageProps) {
  const [query, setQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return invoices;
    const q = query.toLowerCase();
    return invoices.filter((inv) =>
      inv.supplier_name?.toLowerCase().includes(q) ||
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.gstin?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.invoice_date?.includes(q) ||
      inv.items?.some((item) =>
        item.product_name?.toLowerCase().includes(q) ||
        item.hsn_code?.includes(q)
      )
    );
  }, [invoices, query]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this invoice?')) return;
    const ok = await deleteInvoice(id);
    if (ok) refetch();
  };

  const totalValue = filtered.reduce((s, inv) => s + (inv.grand_total || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-slate-500 mt-1">
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''} · {formatCurrency(totalValue)} total
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} /> Export
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-48 py-1">
                <button
                  onClick={() => { exportInvoicesToCSV(filtered); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Export Bills (CSV)
                </button>
                <button
                  onClick={() => { exportItemsToCSV(filtered); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Export Products (CSV)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by supplier, invoice no, GSTIN, product, HSN..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-teal-400 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-3 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-3"></div>
          <p className="text-slate-400">Loading invoices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">
            {query ? 'No invoices match your search' : 'No invoices yet'}
          </p>
          {!query && (
            <button
              onClick={() => navigate({ name: 'scan' })}
              className="mt-4 px-5 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
            >
              Scan Your First Bill
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate({ name: 'invoice', id: inv.id! })}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-teal-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 truncate">
                        {inv.supplier_name || 'Unknown Supplier'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        inv.status === 'saved' ? 'bg-emerald-50 text-emerald-600' :
                        inv.status === 'verified' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-400">
                      <span>{inv.invoice_number || 'No #'}</span>
                      <span>·</span>
                      <span>{inv.invoice_date || formatRelativeDate(inv.created_at || '')}</span>
                      {inv.items && inv.items.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Package size={12} /> {inv.items.length} items
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-slate-700 hidden sm:inline">
                    {formatCurrency(inv.grand_total || 0)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(inv.id!, e)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
