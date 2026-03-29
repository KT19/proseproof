import { useEffect, useCallback, useRef } from 'react';
import { documentsApi } from '../services/api';
import type { Document } from '../types';

interface AutoSaveOptions {
  documentId: number | null;
  text: string;
  field?: string;
  enabled: boolean;
  debounceMs?: number;
  onSuccess?: (document: Document) => void;
}

export function useAutoSave(options: AutoSaveOptions) {
  const { documentId, text, field = 'original_text', enabled, debounceMs = 1000, onSuccess } = options;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async (): Promise<void> => {
    if (!enabled || !documentId || isSavingRef.current) return;

    isSavingRef.current = true;

    try {
      const doc = await documentsApi.update(documentId, { [field]: text });
      if (onSuccess) {
        onSuccess(doc);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, documentId, text, field, onSuccess]);

  useEffect(() => {
    if (!enabled || !documentId) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(save, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [text, enabled, documentId, debounceMs, save]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { isSaving: isSavingRef.current, save };
}
