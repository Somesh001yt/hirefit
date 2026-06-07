'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { extractTextFromPdf } from '@/lib/pdfExtract';
import Button from '@/components/ui/Button';

interface ResumeUploadProps {
  onExtracted: (text: string) => void;
  compact?: boolean;
}

export default function ResumeUpload({ onExtracted, compact = false }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setExtracting(true);
    setError(null);
    setFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      if (!text) throw new Error('No text found in PDF. It may be a scanned image.');
      onExtracted(text);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to extract text from PDF.';
      setError(msg);
      setFileName(null);
    } finally {
      setExtracting(false);
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onInputChange}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={extracting}
          type="button"
        >
          {extracting ? 'Extracting…' : '📄 Upload PDF'}
        </Button>
        {fileName && !extracting && (
          <span className="text-xs text-[var(--color-success)] truncate max-w-[160px]">
            ✓ {fileName}
          </span>
        )}
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onInputChange}
      />
      <div
        onClick={() => !extracting && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer select-none',
          dragging
            ? 'border-[var(--color-primary)] bg-[var(--color-status-applied)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background)]',
          extracting ? 'cursor-not-allowed opacity-60' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <svg
          className="h-8 w-8 text-[var(--color-text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {extracting ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Extracting text…</p>
        ) : fileName ? (
          <p className="text-sm text-[var(--color-success)] font-medium">✓ {fileName}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Drop your resume PDF here
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              or click to browse · PDF only · max 10 MB
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
