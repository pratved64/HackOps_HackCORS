"use client";

import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader as Loader2, CircleCheck as CheckCircle } from 'lucide-react';

type JournalResult = {
  name: string;
  description: string;
  score: number;
};

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<JournalResult[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractPdfText = async (file: File): Promise<string> => {
    // Configure pdfjs worker: use CDN with the SAME version as the imported API to avoid version mismatch
    const pdfjsVersion = (pdfjsLib as any)?.version || '4.10.38';
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }
    return fullText.trim();
  };

  const extractDocxText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await (mammoth as any).extractRawText({ arrayBuffer });
    return (result.value || '').trim();
  };

  const first2000Words = (text: string): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= 2000) return text.trim();
    return words.slice(0, 2000).join(' ');
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setResults(null);

    try {
      let extractedText = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractPdfText(file);
      } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx')) {
        extractedText = await extractDocxText(file);
      } else {
        extractedText = await file.text();
      }

      // Log extracted content
      console.log('[Upload] Extracted text characters:', extractedText.length);
      console.log('[Upload] First 1000 chars:', extractedText.slice(0, 1000));

      sessionStorage.setItem('uploadedPaperText', extractedText);

      const trimmed = first2000Words(extractedText);
      const apiResults = await searchJournals(trimmed);
      setResults(apiResults);
    } catch (err) {
      console.error('Failed to process file:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResults(null);
    
    // For demo, read values directly from inputs
    const titleEl = (document.getElementById('title') as HTMLInputElement);
    const abstractEl = (document.getElementById('abstract') as HTMLTextAreaElement);
    const text = `Title: ${titleEl?.value || ''}\n\nAbstract: ${abstractEl?.value || ''}`.trim();
    console.log('[Upload] Text input chars:', text.length);
    sessionStorage.setItem('uploadedPaperText', text);
    try {
      const trimmed = first2000Words(text);
      const apiResults = await searchJournals(trimmed);
      setResults(apiResults);
    } catch (err) {
      console.error('Failed sending text to backend:', err);
    }
    setIsAnalyzing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (score >= 80) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    if (score >= 70) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
  };

  const searchJournals = async (text: string): Promise<JournalResult[]> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/search_journals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, top_n: 5 }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Backend error ${res.status}: ${body}`);
    }
    const data = await res.json();
    return (data?.results || []) as JournalResult[];
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Find Your Perfect Journal
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Upload your research paper or provide details to get AI-powered journal recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Methods */}
          <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Upload Your Research
              </CardTitle>
              <CardDescription>
                Choose your preferred method to analyze your paper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Method Selection */}
              <div className="flex space-x-4">
                <Button
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('file')}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  variant={uploadMethod === 'text' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('text')}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Enter Details
                </Button>
              </div>

              {uploadMethod === 'file' ? (
                /* File Upload */
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Upload className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Supports PDF and Word documents (up to 10MB)
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                  </div>
                </div>
              ) : (
                /* Text Input */
                <form onSubmit={handleTextSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Paper Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter your research paper title"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abstract">Abstract</Label>
                    <Textarea
                      id="abstract"
                      placeholder="Paste your paper abstract here..."
                      className="min-h-32 resize-none"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analyze Paper
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Analysis Status */}
          <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Analysis Status
              </CardTitle>
              <CardDescription>
                Track the progress of your journal matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                      Analyzing your research...
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Extracting key concepts and topics
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Matching with journal database
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Calculating compatibility scores
                      </span>
                    </div>
                  </div>
                </div>
              ) : results ? (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                    Analysis complete! Found {results.length} matching journals.
                  </span>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Upload your paper to get started with journal recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        {results && (
          <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Recommended Journals
              </CardTitle>
              <CardDescription>
                Retrieved from the backend based on your paper's content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Name</th>
                      <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Description</th>
                      <th className="py-3 pr-0 text-slate-700 dark:text-slate-300">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((j, idx) => (
                      <tr key={`jr-${idx}`} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                        <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{j.name}</td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{j.description}</td>
                        <td className="py-3 pr-0 text-slate-900 dark:text-slate-100">{typeof j.score === 'number' ? j.score.toFixed(4) : j.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}