import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-display font-semibold text-slate-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
