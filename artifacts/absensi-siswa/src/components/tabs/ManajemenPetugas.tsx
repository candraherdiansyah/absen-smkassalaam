import { useState } from 'react';
import { UserPlus, Trash2, ShieldCheck, User, Eye, EyeOff, Crown, Users } from 'lucide-react';
import { usePetugas, useCreatePetugas, useDeletePetugas } from '@/lib/queries';
import type { Petugas } from '@/types/database';
import { cn } from '@/lib/utils';

interface ManajemenPetugasProps {
  currentUser: Petugas;
}

export default function ManajemenPetugas({ currentUser }: ManajemenPetugasProps) {
  const { data: petugasList = [], isLoading } = usePetugas();
  const createPetugas = useCreatePetugas();
  const deletePetugas = useDeletePetugas();

  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'petugas' as 'admin' | 'petugas' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPetugas.mutate(form, {
      onSuccess: () => {
        setForm({ nama: '', email: '', password: '', role: 'petugas' });
        setShowForm(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) return; // can't delete self
    deletePetugas.mutate(id, {
      onSuccess: () => setDeleteConfirmId(null)
    });
  };

  const adminCount = petugasList.filter(p => p.role === 'admin').length;
  const petugasCount = petugasList.filter(p => p.role === 'petugas').length;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Manajemen Petugas</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola akun admin dan petugas absensi</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-sm shadow-blue-200 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Petugas
        </button>
      </div>

      {/* STATS */}
      <div className="px-4 sm:px-6 pt-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{adminCount}</p>
            <p className="text-xs text-blue-500 font-medium">Admin</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{petugasCount}</p>
            <p className="text-xs text-emerald-500 font-medium">Petugas</p>
          </div>
        </div>
      </div>

      {/* FORM TAMBAH */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Tambah Petugas Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nama petugas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="email@sekolah.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'petugas' }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="petugas">Petugas</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm({ nama: '', email: '', password: '', role: 'petugas' }); }}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createPetugas.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {createPetugas.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Hapus Petugas?</h3>
            <p className="text-sm text-slate-500 mb-6">Akun ini akan dihapus secara permanen dan tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletePetugas.isPending}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-60"
              >
                {deletePetugas.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : petugasList.length === 0 ? (
          <div className="py-20 text-center text-slate-500">Belum ada petugas terdaftar.</div>
        ) : (
          <div className="space-y-3">
            {petugasList.map(p => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  p.id === currentUser.id
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                  p.role === 'admin' ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"
                )}>
                  {p.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{p.nama}</p>
                    {p.id === currentUser.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Anda</span>
                    )}
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      p.role === 'admin'
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}>
                      {p.role === 'admin' ? 'Admin' : 'Petugas'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{p.email}</p>
                </div>
                {p.id !== currentUser.id && (
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                    title="Hapus petugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
