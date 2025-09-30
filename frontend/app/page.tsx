import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Target, Zap, Users, ArrowRight, Upload, MessageCircle, CircleCheck as CheckCircle, Star } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'AI-Powered Matching',
    description: 'Advanced algorithms analyze your research to find journals with the highest acceptance probability and impact potential.',
  },
  {
    icon: Zap,
    title: 'Save Time',
    description: 'Eliminate hours of manual journal scouting. Get instant, personalized recommendations tailored to your research.',
  },
  {
    icon: Users,
    title: 'Level the Playing Field',
    description: 'Democratize access to journal intelligence, especially for early-career and interdisciplinary researchers.',
  },
];

const stats = [
  { label: 'Researchers Helped', value: '10,000+' },
  { label: 'Journals in Database', value: '15,000+' },
  { label: 'Success Rate', value: '85%' },
  { label: 'Time Saved', value: '20+ hrs' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Find the Perfect{' '}
              <span className="text-slate-900 dark:text-slate-100">
                Journal
              </span>{' '}
              for Your Research
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empower your research journey with AI-driven journal recommendations. 
              Discover hidden gem publications and boost your publication success rate.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
              <Link href="/upload">
                <Button size="lg" className="glass-strong brutal brutal-hover bg-slate-900/80 dark:bg-white/90 text-white dark:text-slate-900 px-8 py-3 text-lg font-bold rounded-xl transition-all duration-300">
                  <Upload className="mr-2 h-5 w-5" />
                  Find My Journal
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" size="lg" className="glass brutal brutal-hover px-8 py-3 text-lg font-bold rounded-xl border-2 border-slate-900 dark:border-slate-100 transition-all duration-300">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Ask AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center glass brutal p-6 rounded-2xl">
                <div className="text-3xl sm:text-4xl font-bold neo-text text-purple-600 dark:text-purple-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why Choose JournalPal.ai?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our mission is to revolutionize how researchers discover and select journals for publication.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group glass brutal transition-all duration-300 bg-white/5 dark:bg-white/5 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-6 group-hover:scale-110 transition-transform duration-300 glass brutal">
                    <feature.icon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                  </div>
                  <h3 className="text-xl font-bold neo-text text-slate-900 dark:text-slate-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get journal recommendations in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6 glass brutal">
                <span className="text-2xl font-bold neo-text text-slate-900 dark:text-slate-100">1</span>
              </div>
              <h3 className="text-xl font-bold neo-text text-slate-900 dark:text-slate-100 mb-3">
                Upload Your Paper
              </h3>
              <p className="text-slate-700 dark:text-slate-200">
                Upload your research paper (PDF or Word) or provide title and abstract
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6 glass brutal">
                <span className="text-2xl font-bold neo-text text-slate-900 dark:text-slate-100">2</span>
              </div>
              <h3 className="text-xl font-bold neo-text text-slate-900 dark:text-slate-100 mb-3">
                AI Analysis
              </h3>
              <p className="text-slate-700 dark:text-slate-200">
                Our AI analyzes your content and matches it with suitable journals
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6 glass brutal">
                <span className="text-2xl font-bold neo-text text-slate-900 dark:text-slate-100">3</span>
              </div>
              <h3 className="text-xl font-bold neo-text text-slate-900 dark:text-slate-100 mb-3">
                Get Recommendations
              </h3>
              <p className="text-slate-700 dark:text-slate-200">
                Receive ranked journal suggestions with detailed information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Ready to Find Your Perfect Journal?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of researchers who have discovered the right journals for their work.
          </p>
          <Link href="/auth">
            <Button size="lg" className="glass-strong brutal brutal-hover bg-slate-900/80 dark:bg-white/90 text-white dark:text-slate-900 px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}