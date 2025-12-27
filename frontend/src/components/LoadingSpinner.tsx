import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600 font-medium">Anonymizing document...</p>
      <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
    </div>
  );
}
