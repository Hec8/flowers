import TopBanner from './TopBanner';
import Header from './Header';
import { Footer } from './TrustBar';
import TrustBar from './TrustBar';
import Newsletter from './Newsletter';
import PageTransition from '../animation/PageTransition';

export default function MainLayout({ children, showNewsletter = true, showTrustBar = true }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <Header />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      {showTrustBar && <TrustBar />}
      {showNewsletter && <Newsletter />}
      <Footer />
    </div>
  );
}
