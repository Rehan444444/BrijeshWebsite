import { TrendingUp, FileText, Package, IndianRupee, ArrowRight } from 'lucide-react';
import type { Invoice } from '@/lib/types';
import type { Route } from '@/lib/router';
import { formatCurrency, formatRelativeDate } from '@/lib/format';

interface DashboardProps {
  invoices: Invoice[];
  loading: boolean;
  navigate: (r: Route) => void;
}

export function Dashboard({ invoices, loading, navigate }: DashboardProps) {
  const totalBills = invoices.length;
  const totalProducts = invoices.reduce(
    (sum, inv) => sum + (inv.items?.length || 0),
    0
  );
  const totalPurchase = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
  const totalTax = invoices.reduce(
    (sum, inv) => sum + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0),
    0
  );

  const recentBills = invoices.slice(0, 5);

  const stats = [
    {
      label: 'Total Bills',
      value: totalBills.toLocaleString('en-IN'),
      icon: <FileText size={22} />,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: 'Products Scanned',
      value: totalProducts.toLocaleString('en-IN'),
      icon: <Package size={22} />,
      color: 'bg-teal-500',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
    },
    {
      label: 'Total Purchases',
      value: formatCurrency(totalPurchase),
      icon: <IndianRupee size={22} />,
      color: 'bg-violet-500',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    {
      label: 'Total Tax',
      value: formatCurrency(totalTax),
      icon: <TrendingUp size={22} />,
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your scanned invoices and purchases</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center ${stat.text} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate({ name: 'scan' })}
          className="group bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-left text-white hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-bold mb-1">Scan New Bill</h3>
          <p className="text-sm text-teal-50">Upload or capture a bill photo to extract data</p>
          <div className="flex items-center gap-1 mt-3 text-sm font-medium">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate({ name: 'invoices' })}
          className="group bg-white rounded-2xl border border-slate-200 p-6 text-left hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
            <Package size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">View All Invoices</h3>
          <p className="text-sm text-slate-500">Search, export, and manage your scanned bills</p>
          <div className="flex items-center gap-1 mt-3 text-sm font-medium text-blue-600">
            Browse <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Bills */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Bills</h2>
          {invoices.length > 0 && (
            <button
              onClick={() => navigate({ name: 'invoices' })}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-3"></div>
            <p>Loading invoices...</p>
          </div>
        ) : recentBills.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No invoices yet</p>
            <p className="text-sm text-slate-400 mt-1">Scan your first bill to get started</p>
            <button
              onClick={() => navigate({ name: 'scan' })}
              className="mt-4 px-5 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
            >
              Scan a Bill
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentBills.map((inv) => (
              <button
                key={inv.id}
                onClick={() => navigate({ name: 'invoice', id: inv.id! })}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {inv.supplier_name || 'Unknown Supplier'}
                    </p>
                    <p className="text-sm text-slate-400 truncate">
                      {inv.invoice_number || 'No invoice number'} · {inv.invoice_date || formatRelativeDate(inv.created_at || '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-slate-700">{formatCurrency(inv.grand_total || 0)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    inv.status === 'saved' ? 'bg-emerald-50 text-emerald-600' :
                    inv.status === 'verified' ? 'bg-blue-50 text-blue-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {inv.status}
                  </span>
                  <ArrowRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
