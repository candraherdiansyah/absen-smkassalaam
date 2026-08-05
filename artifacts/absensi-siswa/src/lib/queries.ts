import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Student, AttendanceRecord, Class, SchoolInfo, WaliKelas, AttendanceStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// CLASSES
export const useClasses = () => useQuery({
  queryKey: ['classes'],
  queryFn: async () => {
    const { data, error } = await supabase.from('classes').select('*').order('name');
    if (error) throw error;
    return data as Class[];
  }
});

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('classes').insert({ name }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Kelas ditambahkan' });
    }
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Kelas dihapus' });
    }
  });
};

// STUDENTS
export const useStudents = () => useQuery({
  queryKey: ['students'],
  queryFn: async () => {
    const { data, error } = await supabase.from('students').select('*').order('kelas').order('nama');
    if (error) throw error;
    return data as Student[];
  }
});

export const useUpsertStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (student: Partial<Student>) => {
      if (student.id) {
        const { data, error } = await supabase.from('students').update(student).eq('id', student.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('students').insert(student).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Data siswa disimpan' });
    }
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Siswa dihapus' });
    }
  });
};

// ATTENDANCE
export const useAttendance = (date: string) => useQuery({
  queryKey: ['attendance', date],
  queryFn: async () => {
    const { data, error } = await supabase.from('attendance_records').select('*').eq('date', date);
    if (error) throw error;
    return data as AttendanceRecord[];
  },
  staleTime: 30_000, // treat data as fresh for 30s — avoids redundant re-fetches
});

// For reports/matrix: fetch all attendance in a month or date range
export const useAttendanceRange = (startDate: string, endDate: string) => useQuery({
  queryKey: ['attendance', 'range', startDate, endDate],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw error;
    return data as AttendanceRecord[];
  },
  staleTime: 60_000,
});

// Single-record upsert — uses native DB upsert (1 round trip instead of 2)
// Requires UNIQUE(date, student_id) on attendance_records ✓
export const useUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: { date: string; student_id: string; status: AttendanceStatus; note?: string }) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({ ...record, note: record.note ?? '' }, { onConflict: 'date,student_id' })
        .select()
        .single();
      if (error) throw error;
      return data as AttendanceRecord;
    },
    // Optimistic update — UI responds instantly, rolls back on error
    onMutate: async (record) => {
      await queryClient.cancelQueries({ queryKey: ['attendance', record.date] });
      const previous = queryClient.getQueryData<AttendanceRecord[]>(['attendance', record.date]);
      queryClient.setQueryData<AttendanceRecord[]>(['attendance', record.date], (old = []) => {
        const idx = old.findIndex(a => a.student_id === record.student_id);
        const updated: AttendanceRecord = {
          id: old[idx]?.id ?? `temp-${record.student_id}`,
          date: record.date,
          student_id: record.student_id,
          status: record.status,
          note: record.note ?? '',
          created_at: old[idx]?.created_at ?? new Date().toISOString(),
        };
        if (idx >= 0) { const next = [...old]; next[idx] = updated; return next; }
        return [...old, updated];
      });
      return { previous };
    },
    onError: (_err, record, context) => {
      if (context?.previous) queryClient.setQueryData(['attendance', record.date], context.previous);
    },
    onSettled: (_data, _err, record) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', record.date] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'range'] });
    },
  });
};

// Single-record delete — now receives { id, date } so optimistic update knows the query key
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; date: string }) => {
      const { error } = await supabase.from('attendance_records').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, date }) => {
      await queryClient.cancelQueries({ queryKey: ['attendance', date] });
      const previous = queryClient.getQueryData<AttendanceRecord[]>(['attendance', date]);
      queryClient.setQueryData<AttendanceRecord[]>(['attendance', date], (old = []) =>
        old.filter(r => r.id !== id)
      );
      return { previous };
    },
    onError: (_err, { date }, context) => {
      if (context?.previous) queryClient.setQueryData(['attendance', date], context.previous);
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'range'] });
    },
  });
};

// Bulk upsert — ONE request for all students (used by "Hadirkan Semua")
export const useBulkUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      records,
    }: {
      date: string;
      records: { student_id: string; status: AttendanceStatus; note: string }[];
    }) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(records.map(r => ({ ...r, date })), { onConflict: 'date,student_id' })
        .select();
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    onMutate: async ({ date, records }) => {
      await queryClient.cancelQueries({ queryKey: ['attendance', date] });
      const previous = queryClient.getQueryData<AttendanceRecord[]>(['attendance', date]);
      queryClient.setQueryData<AttendanceRecord[]>(['attendance', date], (old = []) => {
        const next = [...old];
        records.forEach(r => {
          const idx = next.findIndex(a => a.student_id === r.student_id);
          const entry: AttendanceRecord = {
            id: next[idx]?.id ?? `temp-${r.student_id}`,
            date,
            student_id: r.student_id,
            status: r.status,
            note: r.note,
            created_at: next[idx]?.created_at ?? new Date().toISOString(),
          };
          if (idx >= 0) next[idx] = entry; else next.push(entry);
        });
        return next;
      });
      return { previous };
    },
    onError: (_err, { date }, context) => {
      if (context?.previous) queryClient.setQueryData(['attendance', date], context.previous);
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'range'] });
    },
  });
};

// Bulk delete — ONE request for all records (used by "Reset")
export const useBulkDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids }: { date: string; ids: string[] }) => {
      if (ids.length === 0) return;
      const { error } = await supabase.from('attendance_records').delete().in('id', ids);
      if (error) throw error;
    },
    onMutate: async ({ date, ids }) => {
      await queryClient.cancelQueries({ queryKey: ['attendance', date] });
      const previous = queryClient.getQueryData<AttendanceRecord[]>(['attendance', date]);
      queryClient.setQueryData<AttendanceRecord[]>(['attendance', date], (old = []) =>
        old.filter(r => !ids.includes(r.id))
      );
      return { previous };
    },
    onError: (_err, { date }, context) => {
      if (context?.previous) queryClient.setQueryData(['attendance', date], context.previous);
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', date] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'range'] });
    },
  });
};

// SCHOOL INFO
export const useSchoolInfo = () => useQuery({
  queryKey: ['school_info'],
  queryFn: async () => {
    const { data, error } = await supabase.from('school_info').select('*').limit(1).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error; // ignore no rows
    return data as SchoolInfo | null;
  }
});

export const useUpdateSchoolInfo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (info: Partial<SchoolInfo>) => {
      if (info.id) {
        const { data, error } = await supabase.from('school_info').update(info).eq('id', info.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('school_info').insert(info).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_info'] });
      toast({ title: 'Info sekolah disimpan' });
    }
  });
};

// WALI KELAS
export const useWaliKelas = () => useQuery({
  queryKey: ['wali_kelas'],
  queryFn: async () => {
    const { data, error } = await supabase.from('wali_kelas').select('*');
    if (error) throw error;
    return data as WaliKelas[];
  }
});

export const useUpsertWaliKelas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (wali: Partial<WaliKelas>) => {
      // Find existing
      const { data: existing } = await supabase.from('wali_kelas').select('id').eq('kelas', wali.kelas!).maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase.from('wali_kelas').update(wali).eq('id', existing.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('wali_kelas').insert(wali).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wali_kelas'] });
    }
  });
};
