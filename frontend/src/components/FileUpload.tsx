import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onSubmit: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onSubmit, disabled }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled,
  });

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-gray-600">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, Word (.docx)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Maximum file size: 10MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="border border-gray-300 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {selectedFile.name.endsWith('.pdf') && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                If this is a scanned PDF, OCR will be automatically applied to extract text.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Anonymize File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
