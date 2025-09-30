"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Mail, Lock, User, Zap } from 'lucide-react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to upload page after successful auth
      window.location.href = '/upload';
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and benefits */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-slate-100">
                <BookOpen className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                JournalPal.ai
              </h1>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Discover Your Next Publishing Opportunity
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Join thousands of researchers who have revolutionized their publication strategy with AI-powered journal recommendations.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Save 20+ Hours of Research
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Stop manually searching through thousands of journals. Our AI does the heavy lifting for you.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Discover Hidden Gems
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Find high-quality journals that others might overlook, giving you better acceptance odds.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Perfect for All Researchers
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Whether you're early-career or interdisciplinary, access the same journal intelligence as seasoned researchers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Authentication forms */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="researcher@university.edu"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-semibold rounded-lg transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Dr. Jane Smith"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="researcher@university.edu"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-semibold rounded-lg transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}