import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Revox — Business Operating System',
  description: 'Your business operating system: CRM, AI Brain, Email, Tasks, and Insights in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
