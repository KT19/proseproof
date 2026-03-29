import { useState, useCallback } from 'react';
import { analysisApi } from '../services/api';
import type { AnalysisResult } from '../types';

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string): Promise<AnalysisResult | null> => {
    if (!text || !text.trim()) {
      return {
        corrected_text: '',
        tips: ['Please enter some text to analyze.'],
        score: 10,
        errors_found: 0,
      };
    }

    try {
      setLoading(true);
      setError(null);
      const res = await analysisApi.analyze(text);
      setResult(res);
      return res;
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error('Analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    analyze,
    setResult,
  };
}
