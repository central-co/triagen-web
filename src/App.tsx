
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import InterviewPage from './components/InterviewPage';
import NotFoundPage from './components/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/interview/:token" element={<InterviewPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
