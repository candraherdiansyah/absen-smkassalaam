import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Student, Class } from '@/types/database';
import { useUpsertStudent } from '@/lib/queries';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classes: Class[];
}

export default function StudentModal({ isOpen, onClose, student, classes }: StudentModalProps) {
  const isEdit = !!student;
  const upsertStudent = useUpsertStudent();
  
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    kelas: classes[0]?.name || '',
    gender: 'L' as 'L' | 'P'
  });

  useEffect(() => {
    if (student) {
      setFormData({
        nis: student.nis,
        nama: student.nama,
        kelas: student.kelas,
        gender: student.gender
      });
    } else {
      setFormData({
        nis: '',
        nama: '',
        kelas: classes[0]?.name || '',
        gender: 'L'
      });
    }
  }, [student, classes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertStudent.mutate({
      id: student?.id,
      ...formData
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-display font-semibold text-slate-900">
            {isEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">NIS</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.nis}
              onChange={e => setFormData({...formData, nis: e.target.value})}
              placeholder="Nomor Induk Siswa"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.nama}
              onChange={e => setFormData({...formData, nama: e.target.value})}
              placeholder="Nama Lengkap Siswa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kelas</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.kelas}
                onChange={e => setFormData({...formData, kelas: e.target.value})}
                required
              >
                {classes.length === 0 && <option value="">Tidak ada kelas</option>}
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Jenis Kelamin</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as 'L' | 'P'})}
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={upsertStudent.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {upsertStudent.isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
