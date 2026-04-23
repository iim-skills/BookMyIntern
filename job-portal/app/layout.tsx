import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar    from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title:       'BookMyIntern',
  description: 'Find your next opportunity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <div>{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
