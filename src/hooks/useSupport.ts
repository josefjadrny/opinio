import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSupportTickets, createSupportTicket,
  updateSupportStatus, updateSupportReply, updateSupportNote,
} from '../api/client';

export function useSupportTickets() {
  return useQuery({ queryKey: ['support'], queryFn: getSupportTickets });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support'] }),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSupportStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support'] }),
  });
}

export function useUpdateReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminReply }: { id: string; adminReply: string }) => updateSupportReply(id, adminReply),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support'] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) => updateSupportNote(id, adminNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support'] }),
  });
}
