import Link from 'next/link';
import { Home, Megaphone, Package, Users, Activity, CreditCard, Settings } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { SystemStatusIndicator } from '@/components/system-status-indicator';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Activity className="w-6 h-6" /> Affiliate Pro
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <Home className="w-5 h-5" /> Overview
          </Link>
          <Link href="/campaigns" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <Megaphone className="w-5 h-5" /> Campaigns
          </Link>
          <Link href="/products" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <Package className="w-5 h-5" /> Products
          </Link>
          <Link href="/affiliates" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <Users className="w-5 h-5" /> Affiliates
          </Link>
          <Link href="/conversions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <Activity className="w-5 h-5" /> Conversions
          </Link>
          <Link href="/payments" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <CreditCard className="w-5 h-5" /> Payments
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
            <div className="flex items-center gap-6 text-sm text-gray-600">
             <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
               <NotificationBell />
             </div>
             <SystemStatusIndicator />
            </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
