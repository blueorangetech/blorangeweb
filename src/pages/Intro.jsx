import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader, Footer } from '../components';
import { useAuth } from '../context/AuthContext';
import '../styles/Intro.css';

function Intro() {
  const {
    isLoggedIn,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    // 권한 검증 없이 게스트 접근이 가능하도록 설정
    checkAuth('intro', false);
  }, [checkAuth]);

  const handleStart = () => {
    navigate('/imweb');
  };

  const features = [
    {
      icon: 'monitoring',
      title: '다차원 데이터 시각화',
      description: '실시간, 매체별, 키워드별 광고 성과 및 핵심 KPI 데이터를 한눈에 파악할 수 있도록 직관적인 대시보드 형태로 제공합니다.',
    },
    {
      icon: 'auto_awesome',
      title: 'AI 크리에이티브 솔루션',
      description: 'AI 제품 연출 및 배너 이미지 대량 양산 기능을 활용하여 효율적으로 광고 소재를 제작하고 관리 라이브러리로 제어합니다.',
    },
    {
      icon: 'pie_chart',
      title: '미디어믹스 최적화',
      description: '캠페인 및 매체별 마케팅 효율성을 정밀하게 분석하고, AI 시뮬레이션을 통해 최적의 미디어 믹스 전략을 설계합니다.',
    },
    {
      icon: 'cloud_upload',
      title: '간편한 데이터 업로드',
      description: '복잡한 과정 없이 CSV, Excel 등 다양한 내부 성과 데이터를 빠르게 업로드하여 대시보드 분석 결과에 즉시 반영합니다.',
    },
  ];

  return (
    <div className="intro-container">
      <DashboardHeader
        title="AI Dashboard"
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={currentUserInfo.role}
        onLogout={logout}
        onLoginClick={openLoginModal}
      />

      <header className="intro-hero">
        <div className="intro-hero-content">
          <h2 className="intro-hero-title">
            마케팅 데이터 시각화부터<br />
            AI 소재 제작까지 통합 지원
          </h2>
          <p className="intro-hero-subtitle">
            블루오렌지 대시보드는 실시간 데이터 모니터링, 미디어믹스 최적화 및
            AI 기반 크리에이티브 생산을 원스톱으로 제공하는 엔터프라이즈 솔루션입니다.
          </p>
          <button className="intro-cta-button" onClick={handleStart}>
            <span>대시보드 시작하기</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </header>

      <main className="intro-features-section">
        <h3 className="intro-section-title">주요 기능 및 특징</h3>
        <div className="intro-features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="intro-feature-card">
              <div className="intro-feature-icon-wrapper">
                <span className="intro-feature-icon">{feature.icon}</span>
              </div>
              <div className="intro-feature-text">
                <h4 className="intro-feature-title">{feature.title}</h4>
                <p className="intro-feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Intro;
