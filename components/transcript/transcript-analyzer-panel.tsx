'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  Loader, 
  Copy, 
  Check, 
  Square,
  AlertCircle,
  FileUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranscriptAnalyzer } from '@/hooks/use-transcript-analyzer';

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadedFile {
  name: string;
  size: number;
  content: string;
}

export function TranscriptAnalyzerPanel() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { analyzeTranscript, stopAnalysis, isAnalyzing } = useTranscriptAnalyzer();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file type. Please upload: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let content = '';
      
      if (extension === 'txt') {
        content = await file.text();
      } else if (extension === 'pdf') {
        // For PDF, we'll read as text (basic extraction)
        // In production, you'd want a proper PDF parser library
        content = await file.text();
        // If the content looks like binary, show an error
        if (content.includes('%PDF') && content.length > 1000 && !/[a-zA-Z]{10,}/.test(content.slice(0, 500))) {
          content = `[PDF file uploaded: ${file.name}]\n\nNote: For best results with PDF files, please copy and paste the transcript text directly into the text area. PDF parsing may not extract all text properly.`;
        }
      } else if (extension === 'docx') {
        // For DOCX, read as text (basic extraction)
        content = await file.text();
        if (content.includes('PK') && content.length > 100) {
          content = `[DOCX file uploaded: ${file.name}]\n\nNote: For best results with DOCX files, please copy and paste the transcript text directly into the text area.`;
        }
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        content,
      });
      setTranscript(content);
    } catch (err) {
      setError('Failed to read file. Please try copying the text directly.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setTranscript('');
  }, []);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please enter or upload a transcript to analyze.');
      return;
    }

    setAnalysis('');
    setError('');

    await analyzeTranscript(
      transcript,
      (chunk) => {
        setAnalysis((prev) => prev + chunk);
      },
      (err) => {
        setError(err.message);
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meeting Transcript Analyzer</h1>
          <p className="text-muted-foreground">
            Upload or paste your meeting transcript to extract key insights, action items, and summaries
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="ml-auto p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transcript Input
              </CardTitle>
              <CardDescription>
                Upload a file or paste your meeting transcript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <FileUp className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Reading file...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Transcript (PDF, DOCX, TXT)
                    </>
                  )}
                </Button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              <Textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  if (uploadedFile) setUploadedFile(null);
                }}
                placeholder="Paste your meeting transcript here...

Example:
John: Good morning everyone. Let's discuss the Q4 roadmap.
Sarah: I think we should prioritize the mobile app redesign.
John: Agreed. What's the timeline?
Sarah: We can have a prototype ready by end of November..."
                className="min-h-[300px] bg-input border-border font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={!transcript.trim() || isAnalyzing}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Analyze Transcript
                    </>
                  )}
                </Button>
                {isAnalyzing && (
                  <Button
                    onClick={stopAnalysis}
                    variant="outline"
                    className="gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Structured insights from your meeting transcript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[300px] max-h-[500px] overflow-auto bg-input border border-border rounded-lg p-4">
                {isAnalyzing && !analysis && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing your transcript...
                  </div>
                )}
                {analysis ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  !isAnalyzing && (
                    <span className="text-muted-foreground text-sm">
                      Analysis results will appear here...
                    </span>
                  )
                )}
              </div>

              {analysis && !isAnalyzing && (
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Analysis
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">What You Get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Meeting Overview',
                description: 'Quick summary of the meeting purpose and key outcomes',
              },
              {
                title: 'Key Points',
                description: 'Important discussions, decisions, and insights extracted',
              },
              {
                title: 'Action Items',
                description: 'Tasks, owners, and deadlines clearly identified',
              },
              {
                title: 'Important Terms',
                description: 'Technical terms, names, and concepts highlighted',
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <Card className="border-border bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">1.</span>
                <span>Include speaker labels when possible (e.g., &quot;John: Good morning...&quot;)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">2.</span>
                <span>For PDF/DOCX files, copy-paste the text directly for best extraction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">3.</span>
                <span>Longer transcripts with clear context provide better analysis results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">4.</span>
                <span>The analyzer works best with complete meetings rather than fragments</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
