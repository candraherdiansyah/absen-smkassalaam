import { useState } from 'react';
import { BookOpenCheck, Calendar, Users, FileBarChart, Settings } from 'lucide-react';
import AbsensiHariIni from '@/components/tabs/AbsensiHariIni';
import DataSiswa from '@/components/tabs/DataSiswa';
import RekapHarian from '@/components/tabs/RekapHarian';
import RekapLaporan from '@/components/tabs/RekapLaporan';
import { cn } from '@/lib/utils';

type Tab = 'hari-ini' | 'data-siswa' | 'rekap-harian' | 'rekap-laporan';

export default function AbsensiApp() {
  const [activeTab, setActiveTab] = useState<Tab>('hari-ini');

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f0f4f8] font-sans">
      {/* HEADER */}
      <header className="no-print bg-gradient-to-r from-[#0a1628] via-[#0f2d5c] to-[#1565c0] text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-display font-bold text-xl shadow-inner" style={{color:'#f59e0b'}}>
                A
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight tracking-wide">AbsensiSiswa</h1>
                <p className="text-xs text-blue-200 font-medium tracking-wider uppercase opacity-80">Presensi Digital Sekolah</p>
              </div>
            </div>
            
            <nav className="flex space-x-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <TabButton 
                active={activeTab === 'hari-ini'} 
                onClick={() => setActiveTab('hari-ini')}
                icon={<BookOpenCheck className="w-4 h-4" />}
                label="Hari Ini"
              />
              <TabButton 
                active={activeTab === 'rekap-harian'} 
                onClick={() => setActiveTab('rekap-harian')}
                icon={<Calendar className="w-4 h-4" />}
                label="Rekap Harian"
              />
              <TabButton 
                active={activeTab === 'rekap-laporan'} 
                onClick={() => setActiveTab('rekap-laporan')}
                icon={<FileBarChart className="w-4 h-4" />}
                label="Laporan"
              />
              <TabButton 
                active={activeTab === 'data-siswa'} 
                onClick={() => setActiveTab('data-siswa')}
                icon={<Users className="w-4 h-4" />}
                label="Data Siswa"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none print:mx-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[calc(100vh-12rem)] print:shadow-none print:border-0 print:rounded-none print:overflow-visible print:min-h-0">
          {activeTab === 'hari-ini' && <AbsensiHariIni />}
          {activeTab === 'data-siswa' && <DataSiswa />}
          {activeTab === 'rekap-harian' && <RekapHarian />}
          {activeTab === 'rekap-laporan' && <RekapLaporan />}
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
        active 
          ? "bg-white/20 text-white shadow-sm ring-1 ring-white/10" 
          : "text-indigo-100 hover:bg-white/10 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
