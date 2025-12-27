import { useState } from 'react';
import type { AnonymizationResult, FileUploadResponse, LLMParameters } from '../types';
import * as api from '../services/api';

export function useAnonymizer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnonymizationResult | null>(null);

  const anonymizeText = async (text: string, provider: string, parameters?: LLMParameters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.anonymizeText({ text, provider, parameters });
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to anonymize text');
    } finally {
      setLoading(false);
    }
  };

  const anonymizeFile = async (file: File, provider: string, parameters?: LLMParameters) => {
    setLoading(true);
    setError(null);

    try {
      const response: FileUploadResponse = await api.anonymizeFile(file, provider, parameters);
      setResult(response.result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to anonymize file');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { loading, error, result, anonymizeText, anonymizeFile, reset };
}
