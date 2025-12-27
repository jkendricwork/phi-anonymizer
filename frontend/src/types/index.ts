export interface LLMParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  context_length?: number;
  model_name?: string;
}

export interface AnonymizeTextRequest {
  text: string;
  provider: string;
  parameters?: LLMParameters;
}

export interface PHIReplacement {
  category: string;
  original_token: string;
  replacement: string;
  consistency_key: string;
}

export interface AnonymizationResult {
  replacement_log: PHIReplacement[];
  anonymized_text: string;
  provider_used: string;
  processing_time_seconds: number;
  original_text?: string;
}

export interface ProviderInfo {
  name: string;
  configured: boolean;
  available: boolean;
}

export interface FileUploadResponse {
  filename: string;
  file_type: string;
  used_ocr: boolean;
  result: AnonymizationResult;
}
