import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Imweb from './pages/Imweb';
import Hanssem from './pages/Hanssem';
import HanssemHf from './pages/HanssemHf';
import TestDashboard from './pages/TestDashboard';
import NotFound from './pages/NotFound';

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const titleMap = {
      '/imweb': '아임웹',
      '/hanssem': '한샘',
      '/hanssem_hf': '한샘 홈퍼니싱',
      '/test': '제안용 대시보드',
    };

    const title = titleMap[location.pathname] || '페이지를 찾을 수 없습니다';
    document.title = `${title} | 블루오렌지 대시보드`;
  }, [location]);

  return null;
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('auth_token');
    if (urlToken) {
      Cookies.set('Authorization', urlToken, { expires: 7 });
      
      // Decode user name from JWT token payload and save to UserName cookie
      const payload = decodeJwt(urlToken);
      if (payload && payload.name) {
        Cookies.set('UserName', payload.name, { expires: 7 });
      }
      
      searchParams.delete('auth_token');
      const newSearch = searchParams.toString();
      navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      <TitleUpdater />
      <Routes>
        <Route path="/imweb" element={<Imweb />} />
        <Route path="/hanssem" element={<Hanssem />} />
        <Route path="/hanssem_hf" element={<HanssemHf />} />
        <Route path="/test" element={<TestDashboard />} />
        <Route path="/" element={<Navigate to="/imweb" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
