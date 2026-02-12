import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import DocumentationPage from './pages/DocumentationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate/:mode" element={<GeneratePage />} />
        <Route path="/generate" element={<Navigate to="/generate/image" replace />} />
        <Route path="/docs" element={<DocumentationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
