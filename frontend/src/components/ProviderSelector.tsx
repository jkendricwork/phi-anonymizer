import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useProviders } from '../hooks/useProviders';

interface ProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

export default function ProviderSelector({ selectedProvider, onProviderChange }: ProviderSelectorProps) {
  const { providers, loading, error } = useProviders();

  const availableProviders = providers.filter((p) => p.available);

  const getProviderDisplayName = (name: string) => {
    const displayNames: Record<string, string> = {
      anthropic: 'Anthropic Claude',
      openai: 'OpenAI GPT-4',
      ollama: 'Ollama (Local)',
      local: 'Ollama (Local)',  // Backwards compatibility
    };
    return displayNames[name] || name;
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Loading providers...</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">Error loading providers: {error}</div>
    );
  }

  if (availableProviders.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          No LLM providers configured. Please add API keys to your backend .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">
        LLM Provider:
      </label>
      <Listbox value={selectedProvider} onChange={onProviderChange}>
        <div className="relative">
          <Listbox.Button className="relative w-48 cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
            <span className="block truncate">{getProviderDisplayName(selectedProvider)}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {availableProviders.map((provider) => (
                <Listbox.Option
                  key={provider.name}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={provider.name}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {getProviderDisplayName(provider.name)}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
