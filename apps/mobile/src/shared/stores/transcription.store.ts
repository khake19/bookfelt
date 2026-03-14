import { create } from 'zustand';
import { transcribeAudio } from '@bookfelt/core';
import { updateEntry } from '../../features/entries/services/entry.service';
import { useToastStore } from './toast.store';

type TranscriptionStatus = 'idle' | 'transcribing' | 'completed' | 'failed';

interface TranscriptionState {
  status: TranscriptionStatus;
  text: string | null;
  entryId: string | null;
  startTranscription: (audioUri: string) => void;
  registerEntryId: (entryId: string) => void;
  reset: () => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  status: 'idle',
  text: null,
  entryId: null,

  startTranscription: (audioUri) => {
    set({ status: 'transcribing', text: null, entryId: null });
    const fileName = `voice-${Date.now()}.m4a`;

    transcribeAudio(audioUri, fileName)
      .then(async (result) => {
        const { entryId } = get();
        set({ status: 'completed', text: result.text });

        if (entryId) {
          await updateEntry(entryId, { reflection: result.text });
          useToastStore.getState().show('Reflection transcribed', 'success');
        }
      })
      .catch(() => {
        const { entryId } = get();
        set({ status: 'failed', text: null });

        if (entryId) {
          useToastStore.getState().show('Transcription failed', 'error');
        }
      });
  },

  registerEntryId: (entryId) => {
    const { status, text } = get();
    set({ entryId });

    if (status === 'completed' && text) {
      updateEntry(entryId, { reflection: text }).then(() => {
        useToastStore.getState().show('Reflection transcribed', 'success');
      });
    } else if (status === 'failed') {
      useToastStore.getState().show('Transcription failed', 'error');
    }
  },

  reset: () => set({ status: 'idle', text: null, entryId: null }),
}));
