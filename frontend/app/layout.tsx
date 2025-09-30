import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';


export const metadata: Metadata = {
  title: 'JournalPal.ai - AI-Powered Journal Recommendations',
  description: 'Discover the perfect journals for your research with AI-powered recommendations. Save time and boost publication success rates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-background grid-overlay">
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