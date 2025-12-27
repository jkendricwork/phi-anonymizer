import axios from 'axios';
import type {
  AnonymizeTextRequest,
  AnonymizationResult,
  ProviderInfo,
  FileUploadResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function anonymizeText(
  request: AnonymizeTextRequest
): Promise<AnonymizationResult> {
  const response = await api.post<AnonymizationResult>('/api/anonymize/text', request);
  return response.data;
}

export async function anonymizeFile(
  file: File,
  provider: string,
  parameters?: import('../types').LLMParameters
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('provider', provider);

  if (parameters) {
    formData.append('parameters', JSON.stringify(parameters));
  }

  const response = await api.post<FileUploadResponse>('/api/anonymize/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function getAvailableProviders(): Promise<ProviderInfo[]> {
  const response = await api.get<ProviderInfo[]>('/api/anonymize/providers');
  return response.data;
}
