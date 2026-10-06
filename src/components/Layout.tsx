import { ScanLine, LayoutDashboard, FileText, Camera, Upload } from 'lucide-react';
import type { Route } from '@/lib/router';

interface LayoutProps {
  route: Route;
  navigate: (r: Route) => void;
  children: React.ReactNode;
}

export function Layout({ route, navigate, children }: LayoutProps) {
  const navItems: { label: string; icon: React.ReactNode; route: Route; active: boolean }[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      route: { name: 'dashboard' },
      active: route.name === 'dashboard',
    },
    {
      label: 'Invoices',
      icon: <FileText size={20} />,
      route: { name: 'invoices' },
      active: route.name === 'invoices' || route.name === 'invoice',
    },
    {
      label: 'Scan Bill',
      icon: <Camera size={20} />,
      route: { name: 'scan' },
      active: route.name === 'scan' || route.name === 'review',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <ScanLine size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">BillScan</h1>
              <p className="text-xs text-slate-400">Invoice OCR</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                item.active
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <button
            onClick={() => navigate({ name: 'scan' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 rounded-lg text-sm font-semibold transition-colors"
          >
            <Upload size={18} />
            New Scan
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <ScanLine size={18} className="text-white" />
          </div>
          <span className="font-bold">BillScan</span>
        </div>
        <button
          onClick={() => navigate({ name: 'scan' })}
          className="px-3 py-1.5 bg-teal-500 rounded-lg text-sm font-semibold"
        >
          Scan
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900 border-t border-slate-800 flex">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 ${
              item.active ? 'text-teal-400' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
