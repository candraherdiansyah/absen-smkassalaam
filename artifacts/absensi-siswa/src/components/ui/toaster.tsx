import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner 
      theme="light" 
      className="toaster group" 
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg font-sans",
          description: "group-[.toast]:text-slate-500",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
        },
      }} 
    />
  );
}
