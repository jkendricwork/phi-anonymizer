import { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { AnonymizationResult } from '../types';

interface ResultsDisplayProps {
  result: AnonymizationResult;
  onReset: () => void;
}

export default function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const [showLog, setShowLog] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.anonymized_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.anonymized_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anonymized_document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 mb-6">
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
              title="Close log and reset"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {showLog && (
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
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Anonymized Output</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Copy size={16} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>
        </div>
        <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {result.anonymized_text}
          </pre>
        </div>
      </div>
    </div>
  );
}
