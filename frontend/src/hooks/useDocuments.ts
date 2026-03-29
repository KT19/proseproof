import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../services/api';
import type { Document } from '../types';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await documentsApi.list();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (title?: string, text?: string): Promise<Document | null> => {
    try {
      const doc = await documentsApi.create(title, text);
      setDocuments(prev => [doc, ...prev]);
      return doc;
    } catch (err) {
      setError('Failed to create document');
      console.error(err);
      return null;
    }
  }, []);

  const updateDocument = useCallback(async (id: number, data: Partial<Document>): Promise<Document | null> => {
    try {
      const doc = await documentsApi.update(id, data);
      setDocuments(prev => prev.map(d => d.id === id ? doc : d));
      return doc;
    } catch (err) {
      setError('Failed to update document');
      console.error(err);
      return null;
    }
  }, []);

  const deleteDocument = useCallback(async (id: number): Promise<boolean> => {
    try {
      await documentsApi.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}
