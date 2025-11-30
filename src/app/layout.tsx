import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { Inter, Calistoga } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const calistoga = Calistoga({ subsets: ['latin'], weight: '400', variable: '--font-headline' });


export const metadata: Metadata = {
  title: 'Estúdio de Tatuagem',
  description: 'Crie, organize, compile e venda coleções de tatuagens com IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${calistoga.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
