import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LiveAnalyzer from './views/LiveAnalyzer';
import SpectrumAnalyzer from './views/SpectrumAnalyzer';
import AudioUpload from './views/AudioUpload';
import InfoTheoryLab from './views/InfoTheoryLab';
import Reports from './views/Reports';
import Settings from './views/Settings';

import LandingPage from './views/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="live" element={<LiveAnalyzer />} />
          <Route path="spectrum" element={<SpectrumAnalyzer />} />
          <Route path="upload" element={<AudioUpload />} />
          <Route path="lab" element={<InfoTheoryLab />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
