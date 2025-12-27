import { useState } from 'react';
import { Tab } from '@headlessui/react';
import RichTextEditor from './components/RichTextEditor';
import FileUpload from './components/FileUpload';
import ProviderSelector from './components/ProviderSelector';
import LLMParametersConfig from './components/LLMParametersConfig';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { useAnonymizer } from './hooks/useAnonymizer';
import type { LLMParameters } from './types';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function App() {
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [parameters, setParameters] = useState<LLMParameters>({});
  const { loading, error, result, anonymizeText, anonymizeFile, reset } = useAnonymizer();

  const handleTextSubmit = (text: string) => {
    anonymizeText(text, selectedProvider, parameters);
  };

  const handleFileSubmit = (file: File) => {
    anonymizeFile(file, selectedProvider, parameters);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">PHI Anonymizer</h1>
          <p className="mt-2 text-gray-600">
            HIPAA-compliant de-identification of medical documents
          </p>
        </header>

        <div className="mb-6 space-y-4">
          <ProviderSelector
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
          <LLMParametersConfig
            selectedProvider={selectedProvider}
            parameters={parameters}
            onParametersChange={setParameters}
          />
        </div>

{result && (
          <ResultsDisplay result={result} onReset={handleReset} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Input</h2>
            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-900 hover:bg-white/[0.12] hover:text-blue-800'
                    )
                  }
                >
                  Rich Text Input
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-900 hover:bg-white/[0.12] hover:text-blue-800'
                    )
                  }
                >
                  Upload Document
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <RichTextEditor onSubmit={handleTextSubmit} disabled={loading} />
                </Tab.Panel>
                <Tab.Panel>
                  <FileUpload onSubmit={handleFileSubmit} disabled={loading} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            {loading && <LoadingSpinner />}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Anonymized Output</h2>
              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200 overflow-y-auto" style={{ height: '500px' }}>
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {result.anonymized_text}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
