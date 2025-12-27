import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import type { AnonymizationResult } from '../types';

interface ResultsDisplayProps {
  result: AnonymizationResult;
  onReset: () => void;
}

export default function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const [showLog, setShowLog] = useState(true);

  return (
    <div className="mb-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center cursor-pointer space-x-2"
            onClick={() => setShowLog(!showLog)}
          >
            {showLog ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <h2 className="text-xl font-semibold text-gray-900">
              PHI Replacement Log ({result.replacement_log.length} items)
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Processed in {result.processing_time_seconds.toFixed(2)}s using {result.provider_used}
            </div>
            <button
              onClick={onReset}
              className="text-gray-400 hover:text-gray-600"
              title="Close and reset"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {showLog && result.replacement_log.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Token
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Replacement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consistency Key
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.replacement_log.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.original_token}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                      {item.replacement}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.consistency_key}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showLog && result.replacement_log.length === 0 && (
          <p className="text-gray-500 text-sm">No PHI replacements were made.</p>
        )}
      </div>
    </div>
  );
}
