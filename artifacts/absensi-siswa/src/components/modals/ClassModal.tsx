import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useClasses, useCreateClass, useDeleteClass, useStudents, useSchoolInfo, useUpdateSchoolInfo, useWaliKelas, useUpsertWaliKelas } from '@/lib/queries';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassModal({ isOpen, onClose }: ClassModalProps) {
  const [activeTab, setActiveTab] = useState<'sekolah' | 'kelas'>('sekolah');
  
  const { data: schoolInfo } = useSchoolInfo();
  const updateSchoolInfo = useUpdateSchoolInfo();
  
  const { data: classes = [] } = useClasses();
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const { data: students = [] } = useStudents();

  const { data: waliKelasList = [] } = useWaliKelas();
  const upsertWaliKelas = useUpsertWaliKelas();

  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const [newClassName, setNewClassName] = useState('');
  
  // Local state for forms to handle edits smoothly
  const [infoForm, setInfoForm] = useState({
    nama_sekolah: '',
    kota: '',
    kepala_sekolah: '',
    nip_kepala: '',
    wakil_kesiswaan: '',
    nip_wakil: ''
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (schoolInfo && !initialized.current) {
      setInfoForm({
        nama_sekolah: schoolInfo.nama_sekolah || '',
        kota: schoolInfo.kota || '',
        kepala_sekolah: schoolInfo.kepala_sekolah || '',
        nip_kepala: schoolInfo.nip_kepala || '',
        wakil_kesiswaan: schoolInfo.wakil_kesiswaan || '',
        nip_wakil: schoolInfo.nip_wakil || ''
      });
      initialized.current = true;
    }
  }, [schoolInfo]);

  const handleSaveInfo = () => {
    updateSchoolInfo.mutate({
      id: schoolInfo?.id,
      ...infoForm
    });
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName.trim()) {
      createClass.mutate(newClassName.trim(), {
        onSuccess: () => setNewClassName('')
      });
    }
  };

  const handleDeleteClass = (id: string, name: string) => {
    const studentsInClass = students.filter(s => s.kelas === name);
    if (studentsInClass.length > 0) {
      setBlockMessage(
        `Kelas "${name}" tidak bisa dihapus karena masih memiliki ${studentsInClass.length} siswa. Pindahkan atau hapus semua siswa di kelas ini terlebih dahulu melalui tab Data Siswa.`
      );
      return;
    }
    if (confirm(`Hapus kelas "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteClass.mutate(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-display font-semibold text-slate-900">
            Pengaturan Master Data
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 px-6">
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'sekolah' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('sekolah')}
          >
            Informasi Sekolah
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'kelas' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('kelas')}
          >
            Daftar Kelas & Wali
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'sekolah' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nama Sekolah</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={infoForm.nama_sekolah}
                    onChange={e => setInfoForm({...infoForm, nama_sekolah: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Kota / Kabupaten</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={infoForm.kota}
                    onChange={e => setInfoForm({...infoForm, kota: e.target.value})}
                    placeholder="Contoh: Jakarta Selatan"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nama Kepala Sekolah</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={infoForm.kepala_sekolah}
                    onChange={e => setInfoForm({...infoForm, kepala_sekolah: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">NIP Kepala Sekolah</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={infoForm.nip_kepala}
                    onChange={e => setInfoForm({...infoForm, nip_kepala: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nama Wakasek Kesiswaan</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={infoForm.wakil_kesiswaan}
                    onChange={e => setInfoForm({...infoForm, wakil_kesiswaan: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">NIP Wakasek</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={infoForm.nip_wakil}
                    onChange={e => setInfoForm({...infoForm, nip_wakil: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveInfo}
                  disabled={updateSchoolInfo.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  Simpan Info Sekolah
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleAddClass} className="flex gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tambah Kelas Baru</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: X IPA 1"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newClassName.trim() || createClass.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 h-10"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </form>

              {blockMessage && (
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800">{blockMessage}</p>
                  </div>
                  <button onClick={() => setBlockMessage(null)} className="text-amber-400 hover:text-amber-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 px-1">Daftar Kelas</h3>
                {classes.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Belum ada kelas yang terdaftar.</p>
                ) : (
                  <div className="space-y-3">
                    {classes.map(c => {
                      const wali = waliKelasList.find(w => w.kelas === c.name);
                      return (
                        <div key={c.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-white">
                          <div className="w-full sm:w-1/4 flex items-center justify-between sm:justify-start">
                            <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md text-sm">{c.name}</span>
                            <button 
                              onClick={() => handleDeleteClass(c.id, c.name)}
                              className="sm:hidden p-1.5 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="w-full sm:w-3/4 flex flex-col sm:flex-row gap-3 items-center">
                            <input 
                              type="text" 
                              placeholder="Nama Wali Kelas"
                              className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-primary"
                              defaultValue={wali?.nama || ''}
                              onBlur={(e) => {
                                if (e.target.value !== wali?.nama) {
                                  upsertWaliKelas.mutate({ id: wali?.id, kelas: c.name, nama: e.target.value, nip: wali?.nip || '' });
                                }
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="NIP Wali Kelas"
                              className="w-full sm:w-48 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-primary"
                              defaultValue={wali?.nip || ''}
                              onBlur={(e) => {
                                if (e.target.value !== wali?.nip) {
                                  upsertWaliKelas.mutate({ id: wali?.id, kelas: c.name, nama: wali?.nama || '', nip: e.target.value });
                                }
                              }}
                            />
                            <button 
                              onClick={() => handleDeleteClass(c.id, c.name)}
                              className="hidden sm:flex p-1.5 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                              title="Hapus Kelas"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
