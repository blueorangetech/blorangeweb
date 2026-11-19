import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardHeader, Footer } from '../components';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/Intro.css';

const imageBase = `${import.meta.env.BASE_URL}images/boweb-home`;

const features = [
  {
    id: 'performance',
    label: '성과 분석',
    title: '광고 성과 분석',
    description: 'CSV·Excel 성과 데이터를 업로드하고, 매체·기간·키워드별 광고 성과를 비교하세요.',
    previewAlt: '매체별 광고비와 전환 수를 비교한 예시로, 검색 광고의 전환당 비용이 20,000원으로 가장 낮습니다.',
    cardAlt: '예시 전환당 비용은 검색 광고 20,000원, 디스플레이 광고 30,000원, 동영상 광고 40,000원입니다.',
  },
  {
    id: 'media-mix',
    label: '미디어믹스',
    title: '미디어믹스 설계',
    description: '캠페인 예산을 매체별로 배분하고, 시나리오별 예상 성과를 비교해 집행 계획을 세우세요.',
    previewAlt: '총 예산 800만원에서 기존 배분과 조정안을 비교한 예시로, 예상 전환은 320건에서 340건으로 증가합니다.',
    cardAlt: '검색 광고 예산 비중을 50%에서 62.5%로 높여 예상 전환이 320건에서 340건으로 증가하는 예시',
  },
  {
    id: 'creative',
    label: '소재 제작',
    title: 'AI 광고 소재 제작',
    description: '제품 연출 이미지와 배너 소재를 만들고, 작업 결과를 소재 라이브러리에서 관리하세요.',
    previewAlt: '같은 은색 텀블러를 파란색 배경과 주황색 배경에 다르게 연출한 광고 소재 예시',
    cardAlt: '같은 제품을 배경과 조명을 바꿔 만든 두 가지 광고 소재',
  },
];

function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = features[activeIndex];

  return (
    <figure className="intro-showcase" aria-label="업무 화면 미리보기" aria-roledescription="캐러셀">
      <div className="intro-showcase-frame" aria-live="polite">
        <img
          key={activeFeature.id}
          src={`${imageBase}/${activeFeature.id}-preview.webp`}
          alt={activeFeature.previewAlt}
          width="1536"
          height="1024"
          decoding="async"
          fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
        />
      </div>

      <figcaption className="intro-showcase-caption">
        <span className="intro-showcase-note">화면 예시</span>
        <div className="intro-showcase-controls" role="group" aria-label="미리보기 선택">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className="intro-showcase-tab"
              type="button"
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              {feature.label}
            </button>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

function Intro() {
  const {
    isLoggedIn,
    userName,
    currentUserInfo,
    checkAuth,
    logout,
    openLoginModal,
  } = useAuth();

  useEffect(() => {
    checkAuth('intro', false);
  }, [checkAuth]);

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

      <main className="intro-content">
        <section className="intro-hero" aria-labelledby="intro-hero-title">
          <div className="intro-shell intro-hero-grid">
            <div className="intro-hero-content">
              <h2 id="intro-hero-title" className="intro-hero-title">
                광고 성과 분석부터
                <span>AI 소재 제작까지</span>
              </h2>
              <p className="intro-hero-subtitle">
                매체별 성과를 비교하고, 예산 배분을 검토하고, 광고에 쓸 이미지를 만들어 보세요.
              </p>
              <Link className="intro-cta-button" to="/imweb">
                대시보드 시작하기
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>

            <FeatureShowcase />
          </div>
        </section>

        <section className="intro-shell intro-features-section" aria-labelledby="intro-features-title">
          <h2 id="intro-features-title" className="intro-section-title">주요 기능</h2>
          <div className="intro-features-grid">
            {features.map(feature => (
              <article key={feature.id} className="intro-feature-card">
                <img
                  className="intro-feature-image"
                  src={`${imageBase}/${feature.id}-card.webp`}
                  alt={feature.cardAlt}
                  width="1254"
                  height="1254"
                  loading="lazy"
                  decoding="async"
                />
                <div className="intro-feature-body">
                  <h3 className="intro-feature-title">{feature.title}</h3>
                  <p className="intro-feature-description">{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Intro;

