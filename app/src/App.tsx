import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import DocumentationPage from './pages/DocumentationPage';
import PricingPage from './pages/PricingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CommercePage from './pages/CommercePage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/generate/:mode" element={<GeneratePage />} />
        <Route path="/generate" element={<Navigate to="/generate/image" replace />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/commerce" element={<CommercePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

