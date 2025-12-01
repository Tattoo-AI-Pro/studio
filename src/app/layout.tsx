import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800'],
  variable: '--font-sans' 
});


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
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
