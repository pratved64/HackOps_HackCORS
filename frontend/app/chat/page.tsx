"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, FileText, Link, CircleHelp as HelpCircle, Sparkles, Copy, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'journal-list' | 'formatting-guide';
  data?: any;
}

// Dummy responses for different types of queries
const getDummyResponse = (query: string): Message => {
  const id = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date();

  // Check query type and return appropriate response
  if (query.toLowerCase().includes('format') || query.toLowerCase().includes('formatting')) {
    return {
      id,
      role: 'assistant',
      content: "I'll help you format your paper according to the publisher's guidelines. Here's a comprehensive formatting guide:",
      timestamp,
      type: 'formatting-guide',
      data: {
        guidelines: [
          {
            aspect: 'Title Page',
            requirements: '• Title in Title Case (max 150 characters)\n• Author names with affiliations\n• Corresponding author email\n• ORCID IDs if available'
          },
          {
            aspect: 'Abstract',
            requirements: '• 150-300 words\n• Structured format (Background, Methods, Results, Conclusions)\n• No references or abbreviations\n• Keywords: 3-6 terms'
          },
          {
            aspect: 'Main Text',
            requirements: '• Double-spaced, 12pt Times New Roman\n• 1-inch margins all around\n• Line numbers for review\n• Sections: Introduction, Methods, Results, Discussion'
          },
          {
            aspect: 'References',
            requirements: '• Vancouver style (numbered)\n• Maximum 50 references\n• Include DOIs where available\n• Recent references preferred (within 5 years)'
          },
          {
            aspect: 'Figures & Tables',
            requirements: '• High resolution (300 DPI minimum)\n• Separate files for each figure\n• Descriptive captions\n• Referenced in text'
          }
        ]
      }
    };
  } else if (query.toLowerCase().includes('journal') && (query.toLowerCase().includes('recommend') || query.toLowerCase().includes('suggest'))) {
    return {
      id,
      role: 'assistant',
      content: "Based on your query, here are some excellent journal recommendations:",
      timestamp,
      type: 'journal-list',
      data: {
        journals: [
          {
            name: "IEEE Transactions on Pattern Analysis",
            publisher: "IEEE",
            impactFactor: 17.861,
            acceptanceRate: "14%",
            scope: "Computer vision, pattern recognition, machine learning"
          },
          {
            name: "Journal of Machine Learning Research",
            publisher: "JMLR",
            impactFactor: 4.994,
            acceptanceRate: "23%",
            scope: "Machine learning theory and applications"
          },
          {
            name: "Neural Networks",
            publisher: "Elsevier",
            impactFactor: 9.657,
            acceptanceRate: "20%",
            scope: "Neural network architectures and applications"
          }
        ]
      }
    };
  } else if (query.toLowerCase().includes('submission') || query.toLowerCase().includes('submit')) {
    return {
      id,
      role: 'assistant',
      content: `Here are the typical submission steps for academic journals:

**1. Pre-Submission Checklist**
- Ensure your research is novel and significant
- Check journal scope and recent publications
- Review author guidelines thoroughly
- Prepare all required documents

**2. Manuscript Preparation**
- Format according to journal guidelines
- Include cover letter explaining significance
- Prepare graphical abstract (if required)
- Complete author disclosure forms

**3. Submission Process**
- Create account on journal's submission system
- Upload manuscript and supplementary files
- Complete metadata forms
- Submit and track status

**4. Post-Submission**
- Expect initial editorial screening (1-2 weeks)
- Peer review process (2-4 months)
- Respond promptly to reviewer comments
- Final decision and publication

Would you like specific submission guidelines for a particular journal?`,
      timestamp,
      type: 'text'
    };
  } else {
    return {
      id,
      role: 'assistant',
      content: `I'm here to help with journal recommendations, paper formatting, submission guidelines, and research publication questions.

I can assist you with:
• **Journal recommendations** based on your research area
• **Formatting guidelines** for specific publishers
• **Submission processes** and requirements  
• **Publication strategies** and best practices
• **Journal metrics** and selection criteria

What specific aspect of academic publishing would you like to explore?`,
      timestamp,
      type: 'text'
    };
  }
};

const quickActions = [
  { label: 'Format my paper', icon: FileText, query: 'Help me format my paper for publication' },
  { label: 'Recommend journals', icon: Sparkles, query: 'Recommend journals for my machine learning research' },
  { label: 'Submission guidelines', icon: HelpCircle, query: 'What are the submission guidelines?' },
  { label: 'Analyze website', icon: Link, query: 'Analyze this website for related journals' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI research assistant. I'm here to help you with journal recommendations, paper formatting, submission guidelines, and any questions about academic publishing. How can I assist you today?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getDummyResponse(inputValue);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessage = (message: Message) => {
    if (message.role === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="flex items-start space-x-3 max-w-3xl">
            <div className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-4 rounded-2xl rounded-tr-md shadow-lg">
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start space-x-3 max-w-4xl">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-900 dark:bg-slate-100">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-md shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-100 mb-3">
              {message.content}
            </p>
            
            {message.type === 'formatting-guide' && message.data && (
              <div className="space-y-3 mt-4">
                {message.data.guidelines.map((guide: any, index: number) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {guide.aspect}
                    </h4>
                    <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono">
                      {guide.requirements}
                    </pre>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(message.data.guidelines.map((g: any) => `${g.aspect}:\n${g.requirements}`).join('\n\n'))}
                  className="mt-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Guidelines
                </Button>
              </div>
            )}

            {message.type === 'journal-list' && message.data && (
              <div className="space-y-3 mt-4">
                {message.data.journals.map((journal: any, index: number) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {journal.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        IF: {journal.impactFactor}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      {journal.scope}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {journal.publisher} • Accept Rate: {journal.acceptanceRate}
                      </span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            AI Research Assistant
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Get help with journal recommendations, formatting, and publication guidance
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Button
              key={`qa-${action.label}`}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-900"
              onClick={() => handleQuickAction(action.query)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="h-96 overflow-y-auto space-y-4 mb-6" id="messages-container">
              {messages.map((message) => (
                <div key={`msg-${message.id}-${message.timestamp.getTime()}`}>{renderMessage(message)}</div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 dark:bg-slate-100">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-md shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-slate-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about journals, formatting, submission guidelines..."
                  className="h-12 pr-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}