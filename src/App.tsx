import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DIDExplorerPage } from '@/pages/DIDExplorerPage';
import { TokenExplorerPage } from '@/pages/TokenExplorerPage';
import { TransactionExplorerPage } from '@/pages/TransactionExplorerPage';
import { SCTransactionExplorerPage } from './pages/SCTransactionsExplorerPage';
import { BurntTransactionExplorerPage } from './pages/BurntExplorePage';

function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/did-explorer" element={<DIDExplorerPage />} />
            <Route path="/token-explorer" element={<TokenExplorerPage />} />
            <Route path="/transaction-explorer" element={<TransactionExplorerPage />} />
            <Route path="/sc-transaction-explorer" element={<SCTransactionExplorerPage />} />
            <Route path="/burnt-transaction-explorer" element={<BurntTransactionExplorerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
