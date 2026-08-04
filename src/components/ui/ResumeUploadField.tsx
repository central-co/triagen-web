import { useId, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { extractPdfText } from '../../lib/extractPdfText';
import StatusMessage from './StatusMessage';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_EXTRACTED_TEXT_LENGTH = 50;
const UNREADABLE_PDF_MESSAGE =
  'Não conseguimos ler este PDF. Ele pode ser digitalizado como imagem — tente outro arquivo ou escreva um resumo.';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

interface ResumeUploadFieldProps {
  darkMode?: boolean;
  onTextExtracted: (text: string, fileName: string) => void;
  onRemove: () => void;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUploadField({
  darkMode = false,
  onTextExtracted,
  onRemove,
}: Readonly<ResumeUploadFieldProps>) {
  const inputId = useId();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setErrorMessage('Envie um arquivo em formato PDF.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setStatus('error');
      setErrorMessage(`O arquivo deve ter no máximo 10 MB (este tem ${formatFileSize(file.size)}).`);
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const text = await extractPdfText(file);
      if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
        setStatus('error');
        setErrorMessage(UNREADABLE_PDF_MESSAGE);
        return;
      }
      setFileName(file.name);
      setStatus('success');
      onTextExtracted(text, file.name);
    } catch {
      setStatus('error');
      setErrorMessage(UNREADABLE_PDF_MESSAGE);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void processFile(file);
  };

  const handleRemove = () => {
    setStatus('idle');
    setFileName(null);
    setErrorMessage(null);
    onRemove();
  };

  const labelClasses = `block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`;
  const hintClasses = `text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`;

  const dropzoneClasses = `relative rounded border-2 border-dashed p-8 text-center transition-colors duration-200 ${
    isDragging
      ? darkMode
        ? 'border-triagen-secondary-green bg-triagen-secondary-green/10'
        : 'border-triagen-secondary-green bg-triagen-sage-tint/40'
      : darkMode
        ? 'border-gray-700 bg-gray-800/40'
        : 'border-triagen-border-light bg-white'
  }`;

  return (
    <div>
      <label htmlFor={inputId} className={labelClasses}>Currículo (opcional)</label>

      {status === 'success' && fileName ? (
        <div className={`flex items-center gap-3 rounded border p-4 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
          <FileText className="h-8 w-8 shrink-0 text-triagen-secondary-green" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{fileName}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Currículo lido com sucesso</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remover currículo anexado"
            className={`shrink-0 p-1.5 rounded transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-triagen-secondary hover:bg-neutral-100 hover:text-triagen-primary'}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className={dropzoneClasses}>
          <input
            id={inputId}
            type="file"
            accept="application/pdf,.pdf"
            disabled={status === 'loading'}
            onChange={handleFileChange}
            onDragEnter={() => setIsDragging(true)}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={() => setIsDragging(false)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label="Anexar currículo em PDF"
          />
          <div className="pointer-events-none flex flex-col items-center gap-2">
            {status === 'loading' ? (
              <>
                <Loader2 className={`h-8 w-8 animate-spin ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`} aria-hidden="true" />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>Lendo currículo...</p>
              </>
            ) : (
              <>
                <Upload className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`} aria-hidden="true" />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                  Arraste seu currículo em PDF aqui ou clique para selecionar
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {status !== 'error' && <p className={hintClasses}>Formato aceito: PDF, até 10 MB.</p>}
      {status === 'error' && errorMessage && (
        <StatusMessage type="error" message={errorMessage} darkMode={darkMode} className="mt-3" />
      )}
    </div>
  );
}
