import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Imweb from './pages/Imweb';
import Hanssem from './pages/Hanssem';
import HanssemHf from './pages/HanssemHf';
import TestDashboard from './pages/TestDashboard';

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/imweb': '아임웹',
      '/hanssem': '한샘',
      '/hanssem_hf': '한샘 홈퍼니싱',
      '/test': '제안용 대시보드',
    };

    document.title = `${titleMap[location.pathname]} | 블루오렌지 대시보드`;
  }, [location]);

  return null;
}

function App() {
  return (
    <>
      <TitleUpdater />
      <Routes>
        <Route path="/imweb" element={<Imweb />} />
        <Route path="/hanssem" element={<Hanssem />} />
        <Route path="/hanssem_hf" element={<HanssemHf />} />
        <Route path="/test" element={<TestDashboard />} />
        <Route path="/" element={<Navigate to="/imweb" />} />
      </Routes>
    </>
  );
}

export default App;
