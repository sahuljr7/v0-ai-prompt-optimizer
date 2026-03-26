'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractTextFromFile } from '@/lib/file-extraction';
import { AnalysisResult } from './analysis-result';

export function TranscriptAnalyzerPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setExtractionError(null);
    setFile(selectedFile);
    setAnalysis('');

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setExtractionError('File is too large. Maximum size is 50MB.');
      setFile(null);
      return;
    }

    // Extract text from file
    try {
      console.log('[v0] Extracting text from file:', selectedFile.name);
      const extractedText = await extractTextFromFile(selectedFile);

      if (!extractedText || extractedText.trim().length === 0) {
        setExtractionError('No text content found in the file.');
        setFile(null);
        return;
      }

      setTranscript(extractedText);
      console.log('[v0] Successfully extracted', extractedText.length, 'characters');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract text from file';
      setExtractionError(errorMessage);
      setFile(null);
      setTranscript('');
    }
  };

  const handleManualInput = (text: string) => {
    setTranscript(text);
    setFile(null);
    setError(null);
    setExtractionError(null);
    setAnalysis('');
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please provide a transcript to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[v0] Starting transcript analysis...');
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze transcript');
      }

      setAnalysis(data.analysis);
      console.log('[v0] Analysis completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(errorMessage);
      console.error('[v0] Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setAnalysis('');
    setFile(null);
    setError(null);
    setExtractionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-4 sm:px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Meeting Transcript Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a meeting transcript or paste text to extract key insights and action items
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!analysis ? (
          <div className="p-4 sm:p-6 space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: PDF, DOCX, TXT, Markdown (max 50MB)
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                  <span className="text-sm text-secondary-foreground">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}

              {extractionError && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{extractionError}</p>
                </div>
              )}
            </div>

            {/* Or Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Manual Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Paste Transcript</label>
              <textarea
                value={transcript}
                onChange={(e) => handleManualInput(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                className="w-full h-48 p-3 bg-card border border-input rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 20 words required for analysis
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={!transcript.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Transcript'
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={!transcript && !file}
              >
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <AnalysisResult 
              analysis={analysis}
              onBack={handleClear}
            />
          </div>
        )}
      </div>
    </div>
  );
}
