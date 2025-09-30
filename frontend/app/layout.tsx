import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';


export const metadata: Metadata = {
  title: 'JournalFinder - AI-Powered Journal Recommendations',
  description: 'Discover the perfect journals for your research with AI-powered recommendations. Save time and boost publication success rates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
            <Navigation />
            <main className="pt-16">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}