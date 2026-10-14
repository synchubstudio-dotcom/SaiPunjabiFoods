import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';

export const metadata: Metadata = {
  title: 'Sai Punjabi — Authentic Amritsari & Punjabi Cuisine | Order Online',
  description:
    'Experience the authentic taste of Punjab at Sai Punjabi. Hand-churned lassi, slow-cooked Dal Makhani, clay-oven tandoori tikkas, and crispy Amritsari kulchas delivered hot to your doorstep.',
  keywords: [
    'Sai Punjabi',
    'Punjabi food',
    'Amritsari Kulcha',
    'Butter Chicken',
    'Dal Makhani',
    'Tandoori',
    'Restaurant New Delhi',
    'Punjabi delivery',
  ],
  authors: [{ name: 'Sai Punjabi Restaurant' }],
  openGraph: {
    title: 'Sai Punjabi — Authentic Amritsari & Punjabi Cuisine',
    description:
      'Craving real Punjabi flavor? Order fresh clay-oven tandoor specials, gravies with pure desi ghee, and festival specials online.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Sai Punjabi',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-brand-maroon-700 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
