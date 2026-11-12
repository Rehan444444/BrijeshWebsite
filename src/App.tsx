import { useCallback, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Products } from '@/components/Products';
import { Capabilities } from '@/components/Capabilities';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

function App() {
  const [quoteInterest, setQuoteInterest] = useState<string | null>(null);

  const requestQuote = useCallback((interest: string) => {
    setQuoteInterest(interest);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Products className="-my-20" onRequestQuote={requestQuote} />
        <Capabilities />
        <Contact interest={quoteInterest} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
