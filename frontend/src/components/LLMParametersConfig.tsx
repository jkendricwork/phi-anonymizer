import { useState } from 'react';
import { Settings, ChevronDown, ChevronRight } from 'lucide-react';
import type { LLMParameters } from '../types';

interface LLMParametersConfigProps {
  selectedProvider: string;
  parameters: LLMParameters;
  onParametersChange: (parameters: LLMParameters) => void;
}

export default function LLMParametersConfig({
  selectedProvider,
  parameters,
  onParametersChange,
}: LLMParametersConfigProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (field: keyof LLMParameters, value: string) => {
    const numValue = field === 'model_name' ? value : parseFloat(value);
    onParametersChange({
      ...parameters,
      [field]: value === '' ? undefined : (field === 'model_name' ? value : numValue),
    });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Settings size={20} className="text-gray-600" />
          <span className="font-medium text-gray-900">LLM Parameters (Optional)</span>
        </div>
        {expanded ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (0.0 - 2.0)
              </label>
              <input
                type="number"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={parameters.temperature ?? ''}
                onChange={(e) => handleChange('temperature', e.target.value)}
                placeholder="0.3 (default)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lower = more focused, higher = more creative
              </p>
            </div>

            <div>
              <label htmlFor="max_tokens" className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                id="max_tokens"
                min="100"
                max="32000"
                step="100"
                value={parameters.max_tokens ?? ''}
                onChange={(e) => handleChange('max_tokens', e.target.value)}
                placeholder="8000 (default)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum length of response
              </p>
            </div>

            <div>
              <label htmlFor="top_p" className="block text-sm font-medium text-gray-700 mb-1">
                Top P (0.0 - 1.0)
              </label>
              <input
                type="number"
                id="top_p"
                min="0"
                max="1"
                step="0.1"
                value={parameters.top_p ?? ''}
                onChange={(e) => handleChange('top_p', e.target.value)}
                placeholder="1.0 (default)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nucleus sampling threshold
              </p>
            </div>

            {selectedProvider === 'ollama' && (
              <div>
                <label htmlFor="context_length" className="block text-sm font-medium text-gray-700 mb-1">
                  Context Length
                </label>
                <input
                  type="number"
                  id="context_length"
                  min="512"
                  max="128000"
                  step="512"
                  value={parameters.context_length ?? ''}
                  onChange={(e) => handleChange('context_length', e.target.value)}
                  placeholder="4096 (default)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Context window size (Ollama only)
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="model_name" className="block text-sm font-medium text-gray-700 mb-1">
              Model Name (Optional Override)
            </label>
            <input
              type="text"
              id="model_name"
              value={parameters.model_name ?? ''}
              onChange={(e) => handleChange('model_name', e.target.value)}
              placeholder={
                selectedProvider === 'ollama'
                  ? 'e.g., llama2, mistral, mixtral'
                  : selectedProvider === 'anthropic'
                  ? 'e.g., claude-3-5-sonnet-20241022'
                  : 'e.g., gpt-4-turbo-preview'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Override the default model for this provider
            </p>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                onParametersChange({
                  temperature: undefined,
                  max_tokens: undefined,
                  top_p: undefined,
                  context_length: undefined,
                  model_name: undefined,
                })
              }
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
