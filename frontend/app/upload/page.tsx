"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader as Loader2, CircleCheck as CheckCircle, ExternalLink, Star, TrendingUp, Clock } from 'lucide-react';

// Dummy data for journal recommendations
const dummyJournals = [
  {
    name: "Nature Machine Intelligence",
    publisher: "Springer Nature",
    type: "Q1 Journal",
    link: "https://nature.com/natmachintell",
    impactFactor: 25.898,
    acceptanceRate: "12%",
    avgReviewTime: "3-4 months",
    matchScore: 95,
    description: "Leading journal in AI and machine learning research"
  },
  {
    name: "Journal of Artificial Intelligence Research",
    publisher: "AAAI Press",
    type: "Q1 Journal", 
    link: "https://jair.org",
    impactFactor: 4.051,
    acceptanceRate: "25%",
    avgReviewTime: "2-3 months",
    matchScore: 88,
    description: "Premier venue for AI research with rigorous peer review"
  },
  {
    name: "IEEE Transactions on Neural Networks",
    publisher: "IEEE",
    type: "Q1 Journal",
    link: "https://ieee.org/tnnls",
    impactFactor: 14.255,
    acceptanceRate: "18%",
    avgReviewTime: "4-6 months",
    matchScore: 82,
    description: "Top-tier journal for neural network and learning systems"
  },
  {
    name: "Machine Learning",
    publisher: "Springer",
    type: "Q2 Journal",
    link: "https://springer.com/ml",
    impactFactor: 3.986,
    acceptanceRate: "30%",
    avgReviewTime: "3-4 months",
    matchScore: 78,
    description: "Established journal covering all aspects of machine learning"
  },
  {
    name: "Neural Computing & Applications",
    publisher: "Springer",
    type: "Q2 Journal",
    link: "https://springer.com/nca",
    impactFactor: 5.606,
    acceptanceRate: "35%",
    avgReviewTime: "2-3 months",
    matchScore: 72,
    description: "Applied neural computing and intelligent systems"
  }
];

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<typeof dummyJournals | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setResults(null);
    
    // Simulate API call
    setTimeout(() => {
      setResults(dummyJournals);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResults(null);
    
    // Simulate API call
    setTimeout(() => {
      setResults(dummyJournals);
      setIsAnalyzing(false);
    }, 3000);
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
    if (score >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (score >= 70) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
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
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Upload className="h-6 w-6 text-white" />
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
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
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
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                      Analyzing your research...
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Extracting key concepts and topics
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Matching with journal database
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
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
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-500" />
                Recommended Journals
              </CardTitle>
              <CardDescription>
                AI-powered journal recommendations ranked by compatibility with your research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((journal, index) => (
                  <div 
                    key={index} 
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                              {journal.name}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                              {journal.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {journal.publisher}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {journal.type}
                              </Badge>
                              <Badge className={`text-xs font-semibold ${getMatchScoreColor(journal.matchScore)}`}>
                                {journal.matchScore}% Match
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span className="text-slate-600 dark:text-slate-300">
                              IF: <strong className="text-slate-900 dark:text-slate-100">{journal.impactFactor}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-slate-600 dark:text-slate-300">
                              Accept: <strong className="text-slate-900 dark:text-slate-100">{journal.acceptanceRate}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-slate-600 dark:text-slate-300">
                              Review: <strong className="text-slate-900 dark:text-slate-100">{journal.avgReviewTime}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(journal.link, '_blank')}
                              className="h-8 px-3 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit Journal
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}