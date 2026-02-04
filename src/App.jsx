import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Imweb from './pages/Imweb';
import Hanssem from './pages/Hanssem';

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/imweb': '아임웹',
      '/hanssem': '한샘',
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
        <Route path="/" element={<Navigate to="/imweb" />} />
      </Routes>
    </>
  );
}

export default App;
